"""Tests for policy pack API endpoints."""
from unittest.mock import patch

import pytest


class TestPolicyPacksAPI:

    @patch("app.services.policy_pack_service.get_available_packs")
    async def test_list_packs_returns_both_packs(self, mock_get_packs):
        """GET /api/policy-packs returns hipaa_pack and soc2_pack entries."""
        mock_get_packs.return_value = [
            {
                "name": "hipaa_pack",
                "filename": "hipaa_pack.yaml",
                "rule_count": 8,
                "description": "Protects ePHI per HIPAA Security Rule",
                "regulatory_framework": "HIPAA",
            },
            {
                "name": "soc2_pack",
                "filename": "soc2_pack.yaml",
                "rule_count": 10,
                "description": "Satisfies SOC 2 TSC criteria",
                "regulatory_framework": "SOC2",
            },
        ]
        from app.api.endpoints.policy_packs import list_policy_packs

        result = await list_policy_packs({"id": "user-1", "tier": "enterprise"})

        assert len(result["packs"]) == 2
        names = {p["name"] for p in result["packs"]}
        assert "hipaa_pack" in names
        assert "soc2_pack" in names
        for p in result["packs"]:
            assert "name" in p
            assert "filename" in p
            assert "rule_count" in p
            assert "description" in p
