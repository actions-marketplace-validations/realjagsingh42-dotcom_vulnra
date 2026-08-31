"""
VULNRA — Compliance & Audit Export Endpoints
GET /api/compliance/audit-export
"""

from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse

from app.core.security import get_current_user
from app.services.audit_log_service import audit_log

router = APIRouter(tags=["Compliance"])


@router.get("/api/compliance/audit-export")
async def audit_export(
    start_date: str = Query(..., description="ISO datetime start"),
    end_date: str = Query(..., description="ISO datetime end"),
    event_types: Optional[str] = Query(None, description="Comma-separated event types"),
    format: str = Query("json", description="json or summary"),
    current_user: dict = Depends(get_current_user),
):
    """Export audit trail for compliance reporting. Admin only."""
    user_id = current_user["id"]
    user_tier = current_user.get("tier", "free")

    if user_tier not in ("pro", "enterprise"):
        raise HTTPException(status_code=403, detail="Admin access required")

    try:
        start = datetime.fromisoformat(start_date)
        end = datetime.fromisoformat(end_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use ISO 8601 (e.g. 2026-01-01T00:00:00)")

    if start >= end:
        raise HTTPException(status_code=400, detail="start_date must be before end_date")

    from app.services.supabase_service import get_supabase

    sb = get_supabase()
    org_id = None
    if sb:
        try:
            res = (
                sb.table("organization_members")
                .select("org_id")
                .eq("user_id", user_id)
                .maybe_single()
                .execute()
            )
            if res and res.data:
                org_id = res.data.get("org_id")
        except Exception:
            pass

    if not org_id:
        raise HTTPException(status_code=404, detail="No organization found for user")

    event_type_list: Optional[List[str]] = None
    if event_types:
        event_type_list = [et.strip() for et in event_types.split(",") if et.strip()]

    events = await audit_log.get_org_audit_trail(
        org_id=org_id,
        start_date=start,
        end_date=end,
        event_types=event_type_list,
    )

    if format == "summary":
        counts_by_type: dict = {}
        counts_by_owasp: dict = {}
        for e in events:
            et = e.event_type.value if e.event_type else "unknown"
            counts_by_type[et] = counts_by_type.get(et, 0) + 1
            cat = e.owasp_category or "unknown"
            counts_by_owasp[cat] = counts_by_owasp.get(cat, 0) + 1

        return JSONResponse(content={
            "org_id": org_id,
            "start_date": start_date,
            "end_date": end_date,
            "total_events": len(events),
            "summary_by_event_type": counts_by_type,
            "summary_by_owasp_category": counts_by_owasp,
        })

    return JSONResponse(content={
        "org_id": org_id,
        "start_date": start_date,
        "end_date": end_date,
        "total_events": len(events),
        "events": [e.model_dump(exclude_none=True) for e in events],
    })
