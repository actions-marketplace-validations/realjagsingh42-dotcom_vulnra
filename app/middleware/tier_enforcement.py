from fastapi import Depends, HTTPException, status
from app.core.security import get_current_user

def require_tier(required_tier: str):
    async def dependency(current_user: dict = Depends(get_current_user)):
        user_tier = current_user.get("tier", "free")
        tier_order = {"free": 0, "pro": 1, "enterprise": 2}
        if tier_order.get(user_tier, 0) < tier_order.get(required_tier, 0):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This feature requires {required_tier} tier or higher."
            )
        return current_user
    return dependency
