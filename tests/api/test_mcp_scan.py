"""
API tests for MCP scan endpoint
"""

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch, MagicMock
from app.main import app as production_app
from app.services.mcp_scanner import MCPScanResult, MCPVulnerability
from app.core.security import get_current_user


def create_test_app():
    """Create a test FastAPI app mirroring production routing but WITHOUT
    SlowAPIMiddleware."""
    from app.api.endpoints import (
        scans, billing, api_keys, monitor, demo, rag_scans,
        org, user, webhooks, analytics, quick_scan, scheduled_scans,
    )

    test_app = FastAPI()
    test_app.state.limiter = production_app.state.limiter

    test_app.include_router(scans.router, tags=["scans"])
    test_app.include_router(quick_scan.router, tags=["quick-scan"])
    test_app.include_router(billing.router, prefix="/billing", tags=["billing"])
    test_app.include_router(api_keys.router, tags=["api-keys"])
    test_app.include_router(monitor.router, tags=["monitor"])
    test_app.include_router(demo.router, tags=["demo"])
    test_app.include_router(rag_scans.router, prefix="/api", tags=["rag-scans"])
    test_app.include_router(org.router, prefix="/api", tags=["org"])
    test_app.include_router(user.router, tags=["user"])
    test_app.include_router(webhooks.router, tags=["webhooks"])
    test_app.include_router(analytics.router, tags=["analytics"])
    test_app.include_router(scheduled_scans.router, prefix="/api", tags=["scheduled-scans"])

    return test_app


_orig_check = production_app.state.limiter._check_request_limit


def _noop_check_request(request, endpoint_func, in_middleware=True):
    request.state.view_rate_limit = None


_disable_rate_limit_patch = patch.object(
    production_app.state.limiter,
    "_check_request_limit",
    side_effect=_noop_check_request,
)


@pytest.fixture
def client():
    """Create a test client backed by a test app without SlowAPIMiddleware.
    Rate limits are disabled via _check_request_limit patch that sets view_rate_limit."""
    with _disable_rate_limit_patch:
        test_app = create_test_app()
        yield test_app, TestClient(test_app)
        test_app.dependency_overrides.clear()


@pytest.fixture
def mock_supabase_user():
    """Create a mock Supabase user object"""
    mock_user = MagicMock()
    mock_user.id = "test-user-id"
    mock_user.email = "test@example.com"
    return mock_user


@pytest.fixture(autouse=True)
def reset_supabase_singleton():
    """Reset the Supabase singleton before each test"""
    import app.services.supabase_service as supabase_service
    supabase_service._sb = None
    yield
    supabase_service._sb = None


@pytest.fixture
def mock_scan_result():
    """Mock scan result for testing"""
    return MCPScanResult(
        server_url="https://example.com/mcp",
        status="SUCCESS",
        tools_found=3,
        vulnerabilities=[
            MCPVulnerability(
                id="test-1",
                name="Test Vulnerability",
                description="Test description",
                severity="HIGH",
                cvss_score=7.5,
                owasp_category="LLM01",
                mitre_technique="T0001.001",
                evidence={"detail": "test"},
                remediation="Test remediation",
            )
        ],
        risk_score=50.0,
        overall_severity="HIGH",
        scan_duration=1.5,
    )


class TestMCPEndpoint:
    """Test cases for /scan/mcp endpoint"""

    def test_mcp_scan_endpoint_exists(self, client):
        """Test that the MCP scan endpoint exists"""
        test_app, test_client = client
        test_app.dependency_overrides[get_current_user] = lambda: {
            "id": "test-user", "email": "test@example.com", "tier": "free"
        }
        response = test_client.post("/scan/mcp")
        assert response.status_code in [401, 403, 422]

    def test_mcp_scan_success(self, client, mock_scan_result):
        """Test successful MCP scan"""
        test_app, test_client = client
        test_app.dependency_overrides[get_current_user] = lambda: {
            "id": "test-user-id", "email": "test@example.com", "tier": "pro"
        }

        with patch("app.api.endpoints.scans.scan_mcp_server", return_value=mock_scan_result):
            with patch("app.api.endpoints.scans.check_scan_quota", return_value={"allowed": True}):
                response = test_client.post(
                    "/scan/mcp",
                    json={"server_url": "https://example.com/mcp"},
                    headers={"Authorization": "Bearer test-token"},
                )

                assert response.status_code == 200
                data = response.json()
                assert data["server_url"] == "https://example.com/mcp"
                assert data["status"] == "SUCCESS"
                assert data["risk_score"] == 50.0
                assert data["overall_severity"] == "HIGH"
                assert len(data["vulnerabilities"]) == 1

    def test_mcp_scan_invalid_url(self, client):
        """Test MCP scan with invalid URL"""
        test_app, test_client = client
        test_app.dependency_overrides[get_current_user] = lambda: {
            "id": "test-user-id", "email": "test@example.com", "tier": "pro"
        }

        with patch("app.api.endpoints.scans.check_scan_quota", return_value={"allowed": True}):
            response = test_client.post(
                "/scan/mcp",
                json={"server_url": "not-a-url"},
                headers={"Authorization": "Bearer test-token"},
            )

            assert response.status_code == 422

    def test_mcp_scan_private_ip_blocked(self, client):
        """Test that private IPs are blocked"""
        test_app, test_client = client
        test_app.dependency_overrides[get_current_user] = lambda: {
            "id": "test-user-id", "email": "test@example.com", "tier": "pro"
        }

        with patch("app.api.endpoints.scans.check_scan_quota", return_value={"allowed": True}):
            response = test_client.post(
                "/scan/mcp",
                json={"server_url": "http://192.168.1.1/mcp"},
                headers={"Authorization": "Bearer test-token"},
            )

            assert response.status_code == 400
            assert "private IPs" in response.json()["detail"]

    def test_mcp_scan_quota_exceeded(self, client):
        """Test MCP scan with quota exceeded"""
        test_app, test_client = client
        test_app.dependency_overrides[get_current_user] = lambda: {
            "id": "test-user-id", "email": "test@example.com", "tier": "pro"
        }

        with patch("app.api.endpoints.scans.check_scan_quota", return_value={
            "allowed": False, "reason": "Daily limit exceeded"
        }):
            response = test_client.post(
                "/scan/mcp",
                json={"server_url": "https://example.com/mcp"},
                headers={"Authorization": "Bearer test-token"},
            )

            assert response.status_code == 429
            assert response.json()["error"] == "quota_exceeded"

    def test_mcp_scan_error_handling(self, client):
        """Test error handling in MCP scan"""
        test_app, test_client = client
        test_app.dependency_overrides[get_current_user] = lambda: {
            "id": "test-user-id", "email": "test@example.com", "tier": "pro"
        }

        with patch("app.api.endpoints.scans.scan_mcp_server") as mock_scan:
            mock_scan.side_effect = Exception("Scan failed")

            with patch("app.api.endpoints.scans.check_scan_quota", return_value={"allowed": True}):
                response = test_client.post(
                    "/scan/mcp",
                    json={"server_url": "https://example.com/mcp"},
                    headers={"Authorization": "Bearer test-token"},
                )

                assert response.status_code == 500
                assert "Scan failed" in response.json()["detail"]


class TestMCPSchema:
    """Test cases for MCP request schema"""

    def test_mcp_request_valid_url(self, client):
        """Test valid URL in MCP request"""
        test_app, test_client = client
        test_app.dependency_overrides[get_current_user] = lambda: {
            "id": "test-user-id", "email": "test@example.com", "tier": "pro"
        }

        with patch("app.api.endpoints.scans.check_scan_quota", return_value={"allowed": True}):
            response = test_client.post(
                "/scan/mcp",
                json={"server_url": "https://example.com/mcp"},
                headers={"Authorization": "Bearer test-token"},
            )

            assert response.status_code != 422

    def test_mcp_request_missing_url(self, client):
        """Test MCP request without URL"""
        test_app, test_client = client
        test_app.dependency_overrides[get_current_user] = lambda: {
            "id": "test-user-id", "email": "test@example.com", "tier": "pro"
        }

        response = test_client.post(
            "/scan/mcp",
            json={},
            headers={"Authorization": "Bearer test-token"},
        )

        assert response.status_code == 422
