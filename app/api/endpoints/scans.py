import uuid
import time
import logging
from typing import List, Optional
from fastapi import APIRouter, BackgroundTasks, Request, HTTPException, Depends, Query, status
from pydantic import BaseModel, HttpUrl, validator
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import settings, logger
from app.core.security import get_current_user
from app.core.utils import is_safe_url
from app.services.supabase_service import check_scan_quota, get_scan_result, get_user_tier
from app.services.scan_service import run_scan_internal
from app.services.mcp_scanner import scan_mcp_server, MCPScanResult

router = APIRouter()

# Rate limit limits per tier (per minute)
# Free: 1 request/minute, Pro: 10 requests/minute, Enterprise: 100 requests/minute
RATE_LIMITS = {
    "free": "1/minute",
    "pro": "10/minute", 
    "enterprise": "100/minute",
}

# Daily scan quotas (already implemented in check_scan_quota)
# Free: 1 scan/day, Pro: 100 scans/day, Enterprise: unlimited

# Tier-based rate limit key function
def tier_key_func(request: Request):
    """Generate rate limit key based on user tier and IP address."""
    # Get user tier from request state (set by middleware)
    user_tier = getattr(request.state, "user_tier", "free")
    return f"{user_tier}:{get_remote_address(request)}"

# Initialize limiter with tier-based key function
limiter = Limiter(
    key_func=tier_key_func,
    storage_uri=settings.redis_url,
    strategy="fixed-window",
)

@router.get("/scan/{scan_id}")
async def get_scan_status(
    request: Request,
    scan_id: str,
    current_user: dict = Depends(get_current_user)
):
    from fastapi.responses import JSONResponse
    
    scan_data = get_scan_result(scan_id)
    if not scan_data:
        return JSONResponse(
            content={"scan_id": scan_id, "status": "pending_or_not_found"},
            headers={
                "X-RateLimit-Limit": "100",
                "X-RateLimit-Remaining": "99",
                "X-RateLimit-Reset": str(int(time.time()) + 60)
            }
        )

    # Ensure the requesting user owns the scan
    if scan_data.get("user_id") != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to access this scan.")

    # Get rate limit info based on user tier
    user_tier = current_user.get("tier", "free")
    rate_limit_str = RATE_LIMITS.get(user_tier, RATE_LIMITS["free"])
    rate_limit_count = int(rate_limit_str.split("/")[0])
    
    return JSONResponse(
        content={
            "scan_id": scan_data.get("id"),
            "status": scan_data.get("status", "unknown"),
            "target_url": scan_data.get("target_url"),
            "tier": scan_data.get("tier"),
            "risk_score": scan_data.get("risk_score"),
            "findings": scan_data.get("findings", []),
            "compliance": scan_data.get("compliance", {}),
            "completed_at": scan_data.get("completed_at"),
        },
        headers={
            "X-RateLimit-Limit": str(rate_limit_count),
            "X-RateLimit-Remaining": str(max(0, rate_limit_count - 1)),
            "X-RateLimit-Reset": str(int(time.time()) + 60)
        }
    )

class ScanRequest(BaseModel):
    url: HttpUrl
    tier: str = "free"

    @validator("tier")
    def validate_tier(cls, v):
        allowed = ("free", "basic", "pro", "enterprise")
        if v.lower().strip() not in allowed:
            return "free"
        return v.lower().strip()


class MultiTurnScanRequest(BaseModel):
    url: HttpUrl
    attack_type: str = "crescendo"
    tier: str = "free"
    
    @validator("attack_type")
    def validate_attack_type(cls, v):
        allowed = ("crescendo", "goat")
        if v.lower().strip() not in allowed:
            return "crescendo"
        return v.lower().strip()

@router.post("/scan")
@limiter.limit(RATE_LIMITS["free"])  # Will be overridden by tier-based key function
async def start_scan(
    request: Request,
    scan_data: ScanRequest,
    background_tasks: BackgroundTasks = BackgroundTasks(),
    current_user: dict = Depends(get_current_user)
):
    from fastapi.responses import JSONResponse
    
    user_id = current_user["id"]
    user_tier = current_user["tier"]
    
    url = str(scan_data.url)
    tier = scan_data.tier

    # Enforce tier if they try to request a higher one than they have
    if tier != "free" and user_tier == "free":
         tier = "free"

    # Quota check
    quota = check_scan_quota(user_id, user_tier)
    if not quota["allowed"]:
        return JSONResponse(
            status_code=429,
            content={
                "error": "quota_exceeded",
                "message": quota["reason"],
                "upgrade": "https://vulnra.lemonsqueezy.com/checkout"
            },
            headers={
                "X-RateLimit-Limit": str(RATE_LIMITS.get(user_tier, RATE_LIMITS["free"]).split("/")[0]),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(int(time.time()) + 60)  # Reset in 60 seconds
            }
        )

    # SSRF check
    if not is_safe_url(url):
        raise HTTPException(status_code=400, detail="Invalid target URL (private IPs or local hostnames blocked).")

    scan_id = str(uuid.uuid4())
    
    # Start scan in background
    background_tasks.add_task(run_scan_internal, scan_id, url, tier, user_id)
    
    # Add rate limit headers to response
    rate_limit_str = RATE_LIMITS.get(user_tier, RATE_LIMITS["free"])
    rate_limit_count = int(rate_limit_str.split("/")[0])
    
    response = JSONResponse(
        content={
            "scan_id": scan_id,
            "status": "queued",
            "message": f"Scan started at {tier} tier."
        },
        headers={
            "X-RateLimit-Limit": str(rate_limit_count),
            "X-RateLimit-Remaining": str(max(0, rate_limit_count - 1)),  # Decrease remaining count
            "X-RateLimit-Reset": str(int(time.time()) + 60)  # Reset in 60 seconds
        }
    )
    
    return response


@router.post("/multi-turn-scan")
async def start_multi_turn_scan(
    request: Request,
    scan_data: MultiTurnScanRequest,
    background_tasks: BackgroundTasks = BackgroundTasks(),
    current_user: dict = Depends(get_current_user)
):
    """Start a multi-turn attack chain scan."""
    from app.garak_engine import run_multi_turn_scan
    
    user_id = current_user["id"]
    user_tier = current_user["tier"]
    
    # Enforce tier limits
    if scan_data.tier != "free" and user_tier == "free":
        scan_data.tier = "free"
    
    # Check quota
    quota = check_scan_quota(user_id, user_tier)
    if not quota["allowed"]:
        return {
            "error": "quota_exceeded",
            "message": quota["reason"],
            "upgrade": "https://vulnra.lemonsqueezy.com/checkout"
        }
    
    scan_id = str(uuid.uuid4())
    
    # Start multi-turn scan in background
    background_tasks.add_task(
        run_multi_turn_scan,
        scan_id,
        str(scan_data.url),
        scan_data.attack_type,
        scan_data.tier
    )
    
    return {
        "scan_id": scan_id,
        "status": "queued",
        "attack_type": scan_data.attack_type,
        "message": f"Multi-turn {scan_data.attack_type} scan started at {scan_data.tier} tier."
    }


class MCPServerRequest(BaseModel):
    """Request model for MCP server scanning"""
    server_url: HttpUrl
    
    @validator("server_url")
    def validate_server_url(cls, v):
        url_str = str(v)
        # Basic validation for MCP server URLs
        if not url_str.startswith(("http://", "https://")):
            raise ValueError("URL must start with http:// or https://")
        return v


@router.post("/scan/mcp")
@limiter.limit(RATE_LIMITS["free"])
async def scan_mcp_endpoint(
    request: Request,
    scan_data: MCPServerRequest,
    current_user: dict = Depends(get_current_user)
):
    """Scan an MCP server for vulnerabilities"""
    from fastapi.responses import JSONResponse
    
    server_url = str(scan_data.server_url)
    
    # SSRF check
    if not is_safe_url(server_url):
        raise HTTPException(status_code=400, detail="Invalid server URL (private IPs or local hostnames blocked).")
    
    # Quota check
    user_id = current_user["id"]
    user_tier = current_user["tier"]
    quota = check_scan_quota(user_id, user_tier)
    if not quota["allowed"]:
        return JSONResponse(
            status_code=429,
            content={
                "error": "quota_exceeded",
                "message": quota["reason"],
                "upgrade": "https://vulnra.lemonsqueezy.com/checkout"
            },
            headers={
                "X-RateLimit-Limit": str(RATE_LIMITS.get(user_tier, RATE_LIMITS["free"]).split("/")[0]),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(int(time.time()) + 60)
            }
        )
    
    try:
        # Perform the MCP scan
        scan_result = await scan_mcp_server(server_url)
        
        # Format response
        response_data = {
            "server_url": scan_result.server_url,
            "status": scan_result.status,
            "tools_found": scan_result.tools_found,
            "risk_score": scan_result.risk_score,
            "overall_severity": scan_result.overall_severity,
            "scan_duration": scan_result.scan_duration,
            "vulnerabilities": [
                {
                    "id": v.id,
                    "name": v.name,
                    "description": v.description,
                    "severity": v.severity,
                    "cvss_score": v.cvss_score,
                    "owasp_category": v.owasp_category,
                    "mitre_technique": v.mitre_technique,
                    "evidence": v.evidence,
                    "remediation": v.remediation,
                }
                for v in scan_result.vulnerabilities
            ],
        }
        
        # Add rate limit headers
        rate_limit_str = RATE_LIMITS.get(user_tier, RATE_LIMITS["free"])
        rate_limit_count = int(rate_limit_str.split("/")[0])
        
        return JSONResponse(
            content=response_data,
            headers={
                "X-RateLimit-Limit": str(rate_limit_count),
                "X-RateLimit-Remaining": str(max(0, rate_limit_count - 1)),
                "X-RateLimit-Reset": str(int(time.time()) + 60)
            }
        )
        
    except Exception as e:
        logger.error(f"MCP scan error for {server_url}: {e}")
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")
