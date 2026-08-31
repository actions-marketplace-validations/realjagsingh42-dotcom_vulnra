import time
import logging
from typing import List, Optional

from app.core.config import logger
from app.services.supabase_service import save_scan_result, get_supabase
from app.services.engine_runner import run_all_engines
from app.models.audit_event import AuditEventType
from app.services.audit_log_service import audit_log
from httpx import ConnectTimeout, ConnectError

# NOTE: All engine imports live inside engine_runner — lazy-loaded so that
# heavy ML dependencies don't block web-server startup.


def _get_org_id(user_id: str) -> Optional[str]:
    try:
        sb = get_supabase()
        if not sb:
            return None
        res = (
            sb.table("organization_members")
            .select("org_id")
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
        if res and res.data:
            return res.data.get("org_id")
    except Exception:
        pass
    return None


async def run_scan_internal(
    scan_id: str,
    url: str,
    tier: str,
    user_id: str,
    custom_probes: Optional[List[str]] = None,
    vulnerability_types: Optional[List[str]] = None,
) -> dict:
    org_id = _get_org_id(user_id)

    await audit_log.log_scan_event(
        AuditEventType.SCAN_STARTED,
        scan_id,
        org_id,
        actor=user_id,
        target=url[:200],
    )

    try:
        findings, compliance, scan_engines, max_risk = run_all_engines(
            scan_id, url, tier,
            custom_probes=custom_probes,
            vulnerability_types=vulnerability_types,
        )

        # Log vulnerability findings after Judge evaluation
        for f in (findings or []):
            await audit_log.log_scan_event(
                AuditEventType.VULNERABILITY_FOUND,
                scan_id,
                org_id,
                target=f.get("name", "")[:200],
                risk_score=float(f.get("hit_rate", 0) or 0),
                owasp_category=f.get("category", ""),
                metadata={"severity": f.get("severity")},
            )

    except (ConnectTimeout, ConnectError, Exception) as e:
        logger.error(f"Scan {scan_id} failed due to network error: {e}")
        error_msg = str(e)
        if "timeout" in error_msg.lower() or isinstance(e, ConnectTimeout):
            error_msg = "Target unreachable: connection timed out"
        else:
            error_msg = f"Target unreachable: {error_msg[:100]}"

        data = {
            "scan_id":      scan_id,
            "user_id":      user_id,
            "url":          url,
            "tier":         tier,
            "status":       "failed",
            "risk_score":   0.0,
            "findings":     [],
            "compliance":   {},
            "scan_engines": [],
            "completed_at": time.time(),
            "error":        error_msg,
        }
        save_scan_result(scan_id, url, tier, data)

        await audit_log.log_scan_event(
            AuditEventType.SCAN_COMPLETED,
            scan_id,
            org_id,
            outcome="FAIL",
            target=url[:200],
            metadata={"error": error_msg, "total_probes": 0, "vulnerabilities_found": 0},
        )
        return data

    data = {
        "scan_id":      scan_id,
        "user_id":      user_id,
        "url":          url,
        "tier":         tier,
        "status":       "complete" if scan_engines else "failed",
        "risk_score":   max_risk,
        "findings":     findings,
        "compliance":   compliance,
        "scan_engines": scan_engines,
        "completed_at": time.time(),
    }

    if not scan_engines:
        data["error"] = "All scan engines failed"

    save_scan_result(scan_id, url, tier, data)

    # Log vulnerability findings after Judge evaluation
    for f in (findings or []):
        await audit_log.log_scan_event(
            AuditEventType.VULNERABILITY_FOUND,
            scan_id,
            org_id,
            target=f.get("name", "")[:200],
            risk_score=float(f.get("hit_rate", 0) or 0),
            owasp_category=f.get("category", ""),
            metadata={"severity": f.get("severity")},
        )

    has_vulns = bool(findings)
    await audit_log.log_scan_event(
        AuditEventType.SCAN_COMPLETED,
        scan_id,
        org_id,
        outcome="PASS" if not has_vulns else "FAIL",
        target=url[:200],
        metadata={
            "total_probes": len(findings or []),
            "vulnerabilities_found": len(findings or []),
            "max_risk": max_risk,
        },
    )

    # Deliver webhooks (best-effort, never blocks scan result)
    try:
        from app.services.webhook_delivery import deliver_scan_complete
        deliver_scan_complete(user_id, {**data, "scan_id": scan_id, "url": url, "tier": tier})
    except Exception:
        pass

    return data
