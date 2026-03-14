"""
app/api/endpoints/billing.py - Lemon Squeezy billing endpoints for VULNRA.
"""

import os
import hmac
import hashlib
import json
from typing import Optional
from fastapi import APIRouter, Request, HTTPException, Depends, Header
from fastapi.responses import JSONResponse
from pydantic import BaseModel, HttpUrl
import logging

from app.core.config import settings
from app.core.security import get_current_user
from app.services.supabase_service import get_supabase, get_user_tier, update_user_subscription

logger = logging.getLogger("vulnra.billing")

router = APIRouter()

# ── Configuration ─────────────────────────────────────────────────────────────
LEMON_SQUEEZY_API_KEY = os.getenv("LEMON_SQUEEZY_API_KEY")
LEMON_SQUEEZY_STORE_ID = os.getenv("LEMON_SQUEEZY_STORE_ID")
LEMON_SQUEEZY_WEBHOOK_SECRET = os.getenv("LEMON_SQUEEZY_WEBHOOK_SECRET")

# ── Pydantic Models ───────────────────────────────────────────────────────────
class CheckoutRequest(BaseModel):
    product_variant_id: int
    customer_email: Optional[str] = None
    custom_data: Optional[dict] = None

class CheckoutResponse(BaseModel):
    checkout_url: str
    checkout_id: str

# ── Public Endpoints ──────────────────────────────────────────────────────────
@router.get("/plans")
async def get_plans():
    """Get available subscription plans."""
    return {
        "plans": [
            {
                "id": "free",
                "name": "Free",
                "price": 0,
                "features": ["1 scan/day", "Basic probes", "Email support"],
                "tier": "free"
            },
            {
                "id": "pro",
                "name": "Pro",
                "price": 49,
                "currency": "USD",
                "interval": "month",
                "features": ["100 scans/day", "40+ probes", "Priority support", "PDF reports"],
                "tier": "pro",
                "variant_id": settings.lemonsqueezy_pro_variant_id
            },
            {
                "id": "enterprise",
                "name": "Enterprise",
                "price": 299,
                "currency": "USD",
                "interval": "month",
                "features": ["Unlimited scans", "All probes", "Custom integrations", "SLA support"],
                "tier": "enterprise",
                "variant_id": settings.lemonsqueezy_enterprise_variant_id
            }
        ]
    }

# ── Protected Endpoints ───────────────────────────────────────────────────────
@router.post("/checkout")
async def create_checkout(
    request: CheckoutRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create a Lemon Squeezy checkout session."""
    if not LEMON_SQUEEZY_API_KEY:
        raise HTTPException(status_code=500, detail="Lemon Squeezy API key not configured")
    
    try:
        from lemonsqueezy import LemonSqueezy
        
        client = LemonSqueezy(api_key=LEMON_SQUEEZY_API_KEY)
        
        # Create checkout with customer email
        checkout_data = {
            "data": {
                "type": "checkouts",
                "attributes": {
                    "custom_data": request.custom_data or {},
                    "product_options": {
                        "redirect_url": f"{settings.frontend_url}/dashboard?checkout_success=true"
                    }
                },
                "relationships": {
                    "store": {
                        "data": {
                            "type": "stores",
                            "id": LEMON_SQUEEZY_STORE_ID
                        }
                    },
                    "variant": {
                        "data": {
                            "type": "variants",
                            "id": str(request.product_variant_id)
                        }
                    }
                }
            }
        }
        
        # Add customer email if provided
        if request.customer_email:
            checkout_data["data"]["attributes"]["email"] = request.customer_email
        
        # Create checkout
        response = client.checkout.create(checkout_data)
        
        return {
            "checkout_url": response["data"]["attributes"]["url"],
            "checkout_id": response["data"]["id"]
        }
        
    except Exception as e:
        logger.error(f"Failed to create checkout: {e}")
        raise HTTPException(status_code=500, detail=f"Checkout creation failed: {str(e)}")

@router.get("/subscription")
async def get_subscription(current_user: dict = Depends(get_current_user)):
    """Get current user subscription status."""
    user_id = current_user["id"]
    
    # Get user tier from database
    tier = get_user_tier(user_id)
    
    return {
        "tier": tier,
        "user_id": user_id,
        "subscription_status": "active" if tier != "free" else "free"
    }

# ── Webhook Endpoint ───────────────────────────────────────────────────────────
@router.post("/webhook")
async def webhook_handler(
    request: Request,
    x_signature: Optional[str] = Header(None)
):
    """Handle Lemon Squeezy webhook events."""
    if not LEMON_SQUEEZY_WEBHOOK_SECRET:
        logger.warning("Lemon Squeezy webhook secret not configured")
        return JSONResponse(status_code=200, content={"status": "ignored"})
    
    # Get raw body
    raw_body = await request.body()
    
    # Verify webhook signature
    if x_signature:
        expected_signature = hmac.new(
            LEMON_SQUEEZY_WEBHOOK_SECRET.encode(),
            raw_body,
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(x_signature, expected_signature):
            logger.warning("Invalid webhook signature")
            return JSONResponse(status_code=401, content={"error": "Invalid signature"})
    
    try:
        payload = json.loads(raw_body)
        event_type = payload.get("meta", {}).get("event_name")
        
        logger.info(f"Received webhook event: {event_type}")
        
        # Handle different event types
        if event_type == "subscription_created":
            await handle_subscription_created(payload)
        elif event_type == "subscription_updated":
            await handle_subscription_updated(payload)
        elif event_type == "subscription_expired":
            await handle_subscription_expired(payload)
        elif event_type == "order_created":
            await handle_order_created(payload)
        
        return JSONResponse(status_code=200, content={"status": "processed"})
        
    except json.JSONDecodeError:
        logger.error("Invalid JSON in webhook payload")
        return JSONResponse(status_code=400, content={"error": "Invalid JSON"})
    except Exception as e:
        logger.error(f"Webhook processing error: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

# ── Webhook Handlers ───────────────────────────────────────────────────────────
async def handle_subscription_created(payload: dict):
    """Handle subscription created event."""
    try:
        attributes = payload["data"]["attributes"]
        user_email = attributes.get("user_email")
        customer_id = attributes.get("customer_id")
        subscription_id = attributes.get("subscription_id")
        plan_id = attributes.get("plan_id")
        
        # Map plan_id to tier
        tier = map_plan_to_tier(plan_id)
        
        # Update user subscription in database
        if user_email:
            supabase = get_supabase()
            if supabase:
                # Update user tier
                update_user_subscription(user_email, tier, subscription_id)
                logger.info(f"Updated subscription for {user_email} to tier {tier}")
        
    except Exception as e:
        logger.error(f"Error handling subscription_created: {e}")

async def handle_subscription_updated(payload: dict):
    """Handle subscription updated event."""
    try:
        attributes = payload["data"]["attributes"]
        user_email = attributes.get("user_email")
        subscription_id = attributes.get("subscription_id")
        status = attributes.get("status")
        
        # Map status to tier
        if status == "active":
            tier = "pro"  # Default to pro tier
        elif status == "paused":
            tier = "free"
        else:
            tier = "free"
        
        # Update user subscription
        if user_email:
            update_user_subscription(user_email, tier, subscription_id)
            logger.info(f"Updated subscription for {user_email} to tier {tier}")
            
    except Exception as e:
        logger.error(f"Error handling subscription_updated: {e}")

async def handle_subscription_expired(payload: dict):
    """Handle subscription expired event."""
    try:
        attributes = payload["data"]["attributes"]
        user_email = attributes.get("user_email")
        
        # Downgrade to free tier
        if user_email:
            update_user_subscription(user_email, "free", None)
            logger.info(f"Downgraded {user_email} to free tier")
            
    except Exception as e:
        logger.error(f"Error handling subscription_expired: {e}")

async def handle_order_created(payload: dict):
    """Handle order created event."""
    try:
        attributes = payload["data"]["attributes"]
        user_email = attributes.get("user_email")
        order_id = attributes.get("order_id")
        
        logger.info(f"Order created: {order_id} for {user_email}")
        
    except Exception as e:
        logger.error(f"Error handling order_created: {e}")

def map_plan_to_tier(plan_id: str) -> str:
    """Map Lemon Squeezy plan ID to VULNRA tier."""
    # These would be your actual Lemon Squeezy plan IDs
    plan_map = {
        "free": "free",
        "pro_monthly": "pro",
        "enterprise_monthly": "enterprise"
    }
    return plan_map.get(plan_id, "free")
