"""Tests for LobsterTrapClient."""
import logging
from unittest.mock import patch, MagicMock

import httpx
import pytest

from app.services.lobster_trap_client import LobsterTrapClient


class TestLobsterTrapClient:
    def test_passthrough_mode(self):
        """When LOBSTER_TRAP_ENABLED=False, proxy_request returns ALLOW
        without making any HTTP calls."""
        with patch("app.services.lobster_trap_client.settings") as mock_settings:
            mock_settings.lobster_trap_enabled = False
            mock_settings.lobster_trap_url = "http://localhost:9090"

            client = LobsterTrapClient()
            result = client.proxy_request("hello world")

            assert result["action_taken"] == "ALLOW"
            assert result["blocked"] is False

    def test_intercept_with_deny(self):
        """When Lobster Trap returns DENY headers, proxy_request reports
        blocked=True."""
        mock_resp = MagicMock()
        mock_resp.headers = {
            "X-LT-Action": "DENY",
            "X-LT-Intent": "prompt_injection",
            "X-LT-Risk-Score": "0.95",
        }

        with (
            patch("app.services.lobster_trap_client.settings") as mock_settings,
            patch("app.services.lobster_trap_client.httpx.Client") as mock_client_cls,
        ):
            mock_settings.lobster_trap_enabled = True
            mock_settings.lobster_trap_url = "http://localhost:9090"

            mock_client = MagicMock()
            mock_client.post.return_value = mock_resp
            mock_client_cls.return_value.__enter__.return_value = mock_client

            client = LobsterTrapClient()
            result = client.proxy_request("dangerous prompt")

            assert result["blocked"] is True
            assert result["action_taken"] == "DENY"
            assert result["intent"] == "prompt_injection"
            assert result["risk_score"] == 0.95

    def test_unreachable_fallback(self, caplog):
        """When Lobster Trap is unreachable, proxy_request falls back to
        ALLOW and logs a warning."""
        with (
            patch("app.services.lobster_trap_client.settings") as mock_settings,
            patch("app.services.lobster_trap_client.httpx.Client") as mock_client_cls,
        ):
            mock_settings.lobster_trap_enabled = True
            mock_settings.lobster_trap_url = "http://localhost:9090"

            mock_client = MagicMock()
            mock_client.post.side_effect = httpx.ConnectError("connection refused")
            mock_client_cls.return_value.__enter__.return_value = mock_client

            client = LobsterTrapClient()
            with caplog.at_level(logging.WARNING):
                result = client.proxy_request("any prompt")

            assert result["blocked"] is False
            assert result["action_taken"] == "ALLOW"
            assert "Lobster Trap unreachable" in caplog.text
