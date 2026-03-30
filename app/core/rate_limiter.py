"""
app/core/rate_limiter.py — Single source of truth for VULNRA rate limiting.

Creates ONE Limiter instance shared by main.py and all endpoint modules.
Import `limiter` and `RATE_LIMITS` from here — never instantiate Limiter elsewhere.
"""

import logging
from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings

logger = logging.getLogger("vulnra.ratelimit")


# ── Rate limit strings from config (e.g. "1/minute", "10/minute") ─────────────
RATE_LIMITS: dict[str, str] = {
    "free":       settings.rate_limit_free,
    "pro":        settings.rate_limit_pro,
    "enterprise": settings.rate_limit_enterprise,
}

# Parsed form: {"free": (1, "minute"), ...} — used for header generation
def _parse(limit_str: str) -> tuple[int, str]:
    try:
        count, period = limit_str.split("/")
        return int(count.strip()), period.strip().lower()
    except Exception:
        return (1, "minute")

TIER_LIMITS: dict[str, tuple[int, str]] = {
    tier: _parse(s) for tier, s in RATE_LIMITS.items()
}


def tier_key_func(request: Request) -> str:
    """
    Rate-limit key: combines user tier (set by set_user_tier_middleware) + IP.
    This ensures free/pro/enterprise users each have their own quota bucket.
    """
    user_tier = getattr(request.state, "user_tier", "free")
    return f"{user_tier}:{get_remote_address(request)}"


def get_tier_limit_str(tier: str) -> str:
    """Return the limit string for a given tier (e.g. '10/minute')."""
    return RATE_LIMITS.get(tier, RATE_LIMITS["free"])


# ── Single shared Limiter instance ────────────────────────────────────────────
# Both main.py (app.state.limiter) and endpoint decorators (@limiter.limit())
# must reference THIS object so slowapi uses consistent keys + storage.
try:
    limiter = Limiter(
        key_func=tier_key_func,
        storage_uri=settings.redis_url,
        strategy="fixed-window",
    )
    logger.info(f"Rate limiter initialised with Redis: {settings.redis_url}")
except Exception as exc:
    logger.warning(f"Redis rate limiter failed ({exc}), falling back to memory.")
    limiter = Limiter(
        key_func=tier_key_func,
        storage_uri="memory://",
        strategy="fixed-window",
    )
