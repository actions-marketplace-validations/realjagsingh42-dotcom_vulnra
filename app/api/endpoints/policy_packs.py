"""
VULNRA — Policy Pack Endpoints
GET    /api/policy-packs                    — list available packs
GET    /api/policy-packs/{pack_name}        — get raw YAML content
POST   /api/policy-packs/{pack_name}/activate — activate a pack
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse

from app.core.security import get_current_user
from app.services.policy_pack_service import get_available_packs, get_pack_content, activate_pack

router = APIRouter(tags=["Policy Packs"])


@router.get("/api/policy-packs")
async def list_policy_packs(
    current_user: dict = Depends(get_current_user),
):
    """List all available compliance policy packs."""
    packs = get_available_packs()
    return {"packs": packs, "count": len(packs)}


@router.get("/api/policy-packs/{pack_name}")
async def get_policy_pack(
    pack_name: str,
    current_user: dict = Depends(get_current_user),
):
    """Return raw YAML content of a policy pack."""
    try:
        content = get_pack_content(pack_name)
    except ValueError:
        raise HTTPException(status_code=404, detail=f"Policy pack '{pack_name}' not found")
    return PlainTextResponse(content, media_type="text/yaml")


@router.post("/api/policy-packs/{pack_name}/activate")
async def activate_policy_pack(
    pack_name: str,
    current_user: dict = Depends(get_current_user),
):
    """Activate a compliance policy pack (admin only)."""
    user_tier = current_user.get("tier", "free")
    if user_tier not in ("pro", "enterprise"):
        raise HTTPException(status_code=403, detail="Admin access required")

    ok = activate_pack(pack_name)
    if not ok:
        raise HTTPException(status_code=404, detail=f"Policy pack '{pack_name}' not found")

    return {"status": "ok", "active_pack": pack_name}
