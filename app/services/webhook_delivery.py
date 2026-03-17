"""
VULNRA — Webhook Delivery Service
Sends signed HTTP POST payloads to user-configured webhook URLs.
Uses HMAC-SHA256 for request signing (header: X-VULNRA-Signature).
"""

import hashlib
import hmac
import json
import logging
import time
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

# ── Tier limits ───────────────────────────────────────────────────────────────
WEBHOOK_LIMITS = {"free": 0, "pro": 3, "enterprise": 20}


def get_webhook_limit(tier: str) -> int:
    return WEBHOOK_LIMITS.get(tier.lower(), 0)


# ── HMAC signing ─────────────────────────────────────────────────────────────

def _sign_payload(secret: str, body: bytes) -> str:
    """Return 'sha256=<hex>' signature."""
    sig = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    return f"sha256={sig}"


# ── Delivery ─────────────────────────────────────────────────────────────────

def deliver_webhook(webhook: dict, payload: dict) -> tuple[bool, int]:
    """
    POST `payload` JSON to webhook['url'] with HMAC signature.
    Returns (success: bool, status_code: int).
    """
    body = json.dumps(payload, default=str).encode()
    signature = _sign_payload(webhook["secret"], body)

    headers = {
        "Content-Type": "application/json",
        "X-VULNRA-Signature": signature,
        "X-VULNRA-Event": payload.get("event", "unknown"),
        "X-VULNRA-Delivery": payload.get("delivery_id", ""),
        "User-Agent": "VULNRA-Webhook/1.0",
    }

    try:
        with httpx.Client(timeout=10.0) as client:
            resp = client.post(webhook["url"], content=body, headers=headers)
        success = 200 <= resp.status_code < 300
        logger.info(
            "Webhook delivery %s → %s [%d]",
            webhook["id"],
            webhook["url"],
            resp.status_code,
        )
        return success, resp.status_code
    except Exception as exc:
        logger.warning("Webhook delivery failed for %s: %s", webhook["id"], exc)
        return False, 0


def deliver_scan_complete(user_id: str, scan_data: dict) -> None:
    """
    Fire all active 'scan.complete' webhooks for user_id.
    Called from scan_service after a scan finishes.
    """
    try:
        from app.services.supabase_service import list_webhooks_for_user, update_webhook_status

        hooks = list_webhooks_for_user(user_id, event="scan.complete")
        if not hooks:
            return

        import uuid
        payload = {
            "event": "scan.complete",
            "delivery_id": str(uuid.uuid4()),
            "timestamp": int(time.time()),
            "data": {
                "scan_id": scan_data.get("scan_id"),
                "target_url": scan_data.get("url"),
                "risk_score": scan_data.get("risk_score"),
                "status": scan_data.get("status"),
                "findings_count": len(scan_data.get("findings", [])),
                "owasp_categories": scan_data.get("owasp_categories", []),
                "tier": scan_data.get("tier"),
            },
        }

        for hook in hooks:
            ok, code = deliver_webhook(hook, payload)
            update_webhook_status(hook["id"], ok, code)

    except Exception as exc:
        logger.error("deliver_scan_complete error: %s", exc)


def deliver_sentinel_alert(user_id: str, alert_data: dict) -> None:
    """
    Fire all active 'sentinel.alert' webhooks for user_id.
    Called from worker.sentinel_check after alert threshold exceeded.
    """
    try:
        from app.services.supabase_service import list_webhooks_for_user, update_webhook_status

        hooks = list_webhooks_for_user(user_id, event="sentinel.alert")
        if not hooks:
            return

        import uuid
        payload = {
            "event": "sentinel.alert",
            "delivery_id": str(uuid.uuid4()),
            "timestamp": int(time.time()),
            "data": alert_data,
        }

        for hook in hooks:
            ok, code = deliver_webhook(hook, payload)
            update_webhook_status(hook["id"], ok, code)

    except Exception as exc:
        logger.error("deliver_sentinel_alert error: %s", exc)
