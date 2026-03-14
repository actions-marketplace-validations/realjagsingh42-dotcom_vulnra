import logging
from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.core.config import settings, validate_config, logger
from app.api.endpoints import scans, billing
from app.core.rate_limiter import TIER_LIMITS, set_limiter
from app.core.security import get_current_user

# ── Validate Environment ──────────────────────────────────────────────────
validate_config()

# ── Rate Limiting ─────────────────────────────────────────────────────────────
# Use Redis for distributed rate limiting if available
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=settings.redis_url,
    strategy="fixed-window",
)

# Set the global limiter instance for use in rate_limiter module
set_limiter(limiter)

# ── FastAPI App Setup ─────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.app_name,
    description="Production-hardened AI Risk Scanner & Compliance Reporter",
    version=settings.version,
    debug=settings.debug,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# ── Security Middleware ───────────────────────────────────────────────────────
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data: https:; "
        "connect-src 'self' https://*.supabase.co; "
        "object-src 'none';"
    )
    return response

# ── User Tier Middleware ───────────────────────────────────────────────────────
@app.middleware("http")
async def set_user_tier_middleware(request: Request, call_next):
    """Set user tier in request state for rate limiting."""
    from app.core.security import get_current_user
    from fastapi import Depends
    
    # Skip for non-authenticated endpoints
    if request.url.path in ["/health", "/"]:
        request.state.user_tier = "free"
    else:
        # Try to get user tier from authorization header
        auth_header = request.headers.get("authorization", "")
        if auth_header and auth_header.startswith("Bearer "):
            try:
                from app.services.supabase_service import get_supabase, get_user_tier
                sb = get_supabase()
                if sb:
                    token = auth_header.split(" ")[1]
                    user_resp = sb.auth.get_user(token)
                    if user_resp and user_resp.user:
                        user_id = user_resp.user.id
                        request.state.user_tier = get_user_tier(user_id)
                    else:
                        request.state.user_tier = "free"
                else:
                    request.state.user_tier = "free"
            except Exception:
                request.state.user_tier = "free"
        else:
            request.state.user_tier = "free"
    
    response = await call_next(request)
    return response

# ── Rate Limit Headers Middleware ───────────────────────────────────────────────
@app.middleware("http")
async def add_rate_limit_headers_middleware(request: Request, call_next):
    """Add X-RateLimit-* headers to responses."""
    response = await call_next(request)
    
    # Add rate limit headers if available
    try:
        # Get rate limit info from slowapi if available
        if hasattr(app.state, "limiter"):
            # Note: slowapi doesn't expose rate limit info directly in response
            # We'll add headers based on user tier
            user_tier = getattr(request.state, "user_tier", "free")
            
            # Define limits per tier
            limits = {
                "free": {"limit": 1, "window": 60},      # 1 per minute
                "pro": {"limit": 10, "window": 60},      # 10 per minute
                "enterprise": {"limit": 100, "window": 60}  # 100 per minute
            }
            
            tier_limit = limits.get(user_tier, limits["free"])
            
            # Add standard rate limit headers
            response.headers["X-RateLimit-Limit"] = str(tier_limit["limit"])
            response.headers["X-RateLimit-Window"] = str(tier_limit["window"])
            
            # Note: X-RateLimit-Remaining and X-RateLimit-Reset would require
            # tracking actual usage, which slowapi handles internally
            # For now, we'll leave these headers to be added by slowapi's middleware
            
    except Exception as e:
        logger.debug(f"Could not add rate limit headers: {e}")
    
    return response

# ── Global Exception Handler ─────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "code": "INTERNAL_ERROR"}
    )

# ── Routes ────────────────────────────────────────────────────────────────────
app.include_router(scans.router, tags=["scans"])
app.include_router(billing.router, prefix="/billing", tags=["billing"])

@app.get("/health")
def health():
    return {"status": "healthy", "version": settings.version}

# ── Static Files (Must be last) ───────────────────────────────────────────────
# Serve static HTML files from the project root (works on Windows + Docker)
from pathlib import Path
_project_root = Path(__file__).resolve().parent.parent
try:
    app.mount("/", StaticFiles(directory=str(_project_root), html=True), name="static")
except Exception as e:
    logger.warning(f"Static mount failed: {e}")