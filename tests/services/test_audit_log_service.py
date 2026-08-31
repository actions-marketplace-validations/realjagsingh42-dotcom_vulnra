"""Tests for AuditLogService."""
import logging
from unittest.mock import patch, MagicMock, AsyncMock, ANY
from datetime import datetime

import pytest

from app.models.audit_event import AuditEvent, AuditEventType, InterceptEvent
from app.services.audit_log_service import AuditLogService


class TestAuditLogService:

    async def test_log_intercept_maps_deny_correctly(self):
        """log_intercept maps DENY action_taken to INTERCEPT_DENY,
        LLM01 owasp_category, and both HIPAA+SOC2 compliance tags."""
        intercept = InterceptEvent(
            id="evt-001",
            scan_id="scan-001",
            probe_index=1,
            prompt="test prompt",
            action_taken="DENY",
            intent="prompt_injection",
            risk_score=0.95,
        )

        with patch.object(AuditLogService, "log_event", new_callable=AsyncMock) as mock_log:
            svc = AuditLogService()
            await svc.log_intercept(intercept, scan_id="scan-001", org_id="org-001")

            mock_log.assert_called_once()
            event: AuditEvent = mock_log.call_args[0][0]

            assert event.event_type == AuditEventType.INTERCEPT_DENY
            assert event.owasp_category == "LLM01"
            assert "HIPAA" in (event.compliance_tags or [])
            assert "SOC2" in (event.compliance_tags or [])

    async def test_log_event_never_raises(self, caplog):
        """log_event catches all exceptions and logs a warning — never raises."""
        event = AuditEvent(
            event_type=AuditEventType.SCAN_STARTED,
            timestamp=datetime.utcnow(),
        )

        with (
            patch("app.services.audit_log_service.get_supabase", side_effect=Exception("DB down")),
            caplog.at_level(logging.WARNING),
        ):
            svc = AuditLogService()
            await svc.log_event(event)

        assert "Failed to log audit event" in caplog.text


class TestPolicyPackActivate:

    def test_activate_pack_switches_active_policy(self):
        """activate_pack copies hipaa_pack.yaml to active_policy.yaml."""
        from app.services.policy_pack_service import activate_pack, get_pack_content

        result = activate_pack("hipaa_pack")
        assert result is True

        import os
        active_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "lobster_trap", "policies", "active_policy.yaml",
        )
        assert os.path.exists(active_path)

        with open(active_path) as f:
            active_content = f.read()

        expected = get_pack_content("hipaa_pack")
        assert active_content == expected
