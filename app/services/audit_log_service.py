import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from app.core.config import logger as app_logger
from app.models.audit_event import AuditEvent, AuditEventType
from app.models.audit_event import InterceptEvent
from app.services.supabase_service import get_supabase

logger = logging.getLogger("vulnra.audit_log")

_INTENT_TO_OWASP = {
    "prompt_injection": "LLM01",
    "insecure_output": "LLM02",
    "training_data_poisoning": "LLM03",
    "model_dos": "LLM04",
    "supply_chain": "LLM05",
    "sensitive_info_disclosure": "LLM06",
    "insecure_plugin": "LLM07",
    "excessive_agency": "LLM08",
    "overreliance": "LLM09",
    "model_theft": "LLM10",
    "pii_detected": "PII_LEAK",
    "data_exfiltration": "DATA_EXFIL",
    "jailbreak": "JAILBREAK",
    "credential_leakage": "CREDENTIAL_LEAK",
}

_ACTION_TO_EVENT_TYPE = {
    "ALLOW": AuditEventType.INTERCEPT_ALLOW,
    "DENY": AuditEventType.INTERCEPT_DENY,
    "QUARANTINE": AuditEventType.INTERCEPT_QUARANTINE,
    "HUMAN_REVIEW": AuditEventType.INTERCEPT_REVIEW,
    "LOG": AuditEventType.INTERCEPT_ALLOW,
}

_HIPAA_INTENTS = frozenset({
    "prompt_injection", "jailbreak", "pii_detected",
    "sensitive_info_disclosure", "data_exfiltration",
    "credential_leakage", "excessive_agency",
})

_SOC2_INTENTS = frozenset({
    "prompt_injection", "credential_leakage", "jailbreak",
    "insecure_plugin", "data_exfiltration", "model_theft",
    "model_dos", "excessive_agency", "insecure_output",
})


def _get_compliance_tags(intent: str) -> List[str]:
    tags = []
    if intent in _HIPAA_INTENTS:
        tags.append("HIPAA")
    if intent in _SOC2_INTENTS:
        tags.append("SOC2")
    return tags


class AuditLogService:

    async def log_event(self, event: AuditEvent) -> None:
        try:
            sb = get_supabase()
            if not sb:
                return
            row = event.model_dump(exclude_none=True)
            if "id" not in row or not row["id"]:
                from uuid import uuid4
                row["id"] = str(uuid4())
            row["timestamp"] = row["timestamp"].isoformat() if hasattr(row["timestamp"], "isoformat") else row["timestamp"]
            sb.table("audit_events").insert(row).execute()
        except Exception as exc:
            logger.warning("Failed to log audit event: %s", exc)

    async def log_intercept(
        self,
        intercept_event: InterceptEvent,
        scan_id: str,
        org_id: str,
    ) -> None:
        event_type = _ACTION_TO_EVENT_TYPE.get(
            intercept_event.action_taken,
            AuditEventType.INTERCEPT_ALLOW,
        )
        owasp = _INTENT_TO_OWASP.get(intercept_event.intent or "") if intercept_event.intent else None
        tags = _get_compliance_tags(intercept_event.intent or "")

        event = AuditEvent(
            scan_id=scan_id,
            org_id=org_id,
            event_type=event_type,
            timestamp=datetime.utcnow(),
            target=intercept_event.prompt[:200],
            outcome=intercept_event.action_taken,
            risk_score=intercept_event.risk_score,
            owasp_category=owasp,
            compliance_tags=tags or None,
            metadata={"intercept_event_id": intercept_event.id},
        )
        await self.log_event(event)

    async def log_scan_event(
        self,
        event_type: AuditEventType,
        scan_id: str,
        org_id: str,
        **kwargs: Any,
    ) -> None:
        event = AuditEvent(
            scan_id=scan_id,
            org_id=org_id,
            event_type=event_type,
            timestamp=datetime.utcnow(),
            actor=kwargs.get("actor"),
            target=kwargs.get("target"),
            outcome=kwargs.get("outcome"),
            risk_score=kwargs.get("risk_score"),
            owasp_category=kwargs.get("owasp_category"),
            compliance_tags=kwargs.get("compliance_tags"),
            metadata=kwargs.get("metadata"),
        )
        await self.log_event(event)

    async def get_audit_trail(
        self,
        scan_id: str,
        limit: int = 100,
    ) -> List[AuditEvent]:
        try:
            sb = get_supabase()
            if not sb:
                return []
            res = (
                sb.table("audit_events")
                .select("*")
                .eq("scan_id", scan_id)
                .order("timestamp", ascending=True)
                .limit(limit)
                .execute()
            )
            return [AuditEvent(**row) for row in (res.data or [])]
        except Exception as exc:
            logger.warning("Failed to fetch audit trail: %s", exc)
            return []

    async def get_org_audit_trail(
        self,
        org_id: str,
        start_date: datetime,
        end_date: datetime,
        event_types: Optional[List[str]] = None,
        limit: int = 500,
    ) -> List[AuditEvent]:
        try:
            sb = get_supabase()
            if not sb:
                return []
            query = (
                sb.table("audit_events")
                .select("*")
                .eq("org_id", org_id)
                .gte("timestamp", start_date.isoformat())
                .lte("timestamp", end_date.isoformat())
                .order("timestamp", ascending=True)
                .limit(limit)
            )
            if event_types:
                query = query.in_("event_type", event_types)
            res = query.execute()
            return [AuditEvent(**row) for row in (res.data or [])]
        except Exception as exc:
            logger.warning("Failed to fetch org audit trail: %s", exc)
            return []


audit_log = AuditLogService()
