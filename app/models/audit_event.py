from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


class InterceptEvent(BaseModel):
    id: str
    scan_id: str
    probe_index: int
    prompt: str
    action_taken: str
    intent: Optional[str] = None
    risk_score: float = 0.0
    created_at: Optional[str] = None


class AuditEventType(str, Enum):
    SCAN_STARTED = "scan_started"
    SCAN_COMPLETED = "scan_completed"
    PROBE_SENT = "probe_sent"
    PROBE_RESULT = "probe_result"
    INTERCEPT_ALLOW = "intercept_allow"
    INTERCEPT_DENY = "intercept_deny"
    INTERCEPT_QUARANTINE = "intercept_quarantine"
    INTERCEPT_REVIEW = "intercept_review"
    VULNERABILITY_FOUND = "vulnerability_found"
    POLICY_ACTIVATED = "policy_activated"


class AuditEvent(BaseModel):
    id: Optional[str] = None
    scan_id: Optional[str] = None
    org_id: Optional[str] = None
    event_type: AuditEventType
    timestamp: datetime
    actor: Optional[str] = None
    target: Optional[str] = None
    outcome: Optional[str] = None
    risk_score: Optional[float] = None
    owasp_category: Optional[str] = None
    compliance_tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None
