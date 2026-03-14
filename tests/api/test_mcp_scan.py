"""
API tests for MCP scan endpoint
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch, MagicMock
from app.main import app
from app.services.mcp_scanner import MCPScanResult, MCPVulnerability


@pytest.fixture
def client():
    """Create a test client"""
    return TestClient(app)


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
        response = client.post("/scan/mcp")
        # Should get 422 (validation error) or 401 (unauthorized) rather than 404
        assert response.status_code in [422, 401, 403]

    @pytest.mark.asyncio
    async def test_mcp_scan_success(self, client, mock_scan_result):
        """Test successful MCP scan"""
        with patch("app.api.endpoints.scans.scan_mcp_server") as mock_scan:
            mock_scan.return_value = mock_scan_result

            with patch("app.api.endpoints.scans.check_scan_quota") as mock_quota:
                mock_quota.return_value = {"allowed": True}

                with patch("app.api.endpoints.scans.get_current_user") as mock_user:
                    mock_user.return_value = {
                        "id": "test-user-id",
                        "email": "test@example.com",
                        "tier": "pro"
                    }

                    response = client.post(
                        "/scan/mcp",
                        json={"server_url": "https://example.com/mcp"},
                        headers={"Authorization": "Bearer test-token"}
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
        with patch("app.api.endpoints.scans.get_current_user") as mock_user:
            mock_user.return_value = {
                "id": "test-user-id",
                "email": "test@example.com",
                "tier": "pro"
            }

            response = client.post(
                "/scan/mcp",
                json={"server_url": "not-a-url"},
                headers={"Authorization": "Bearer test-token"}
            )

            assert response.status_code == 422  # Validation error

    def test_mcp_scan_private_ip_blocked(self, client):
        """Test that private IPs are blocked"""
        with patch("app.api.endpoints.scans.get_current_user") as mock_user:
            mock_user.return_value = {
                "id": "test-user-id",
                "email": "test@example.com",
                "tier": "pro"
            }

            response = client.post(
                "/scan/mcp",
                json={"server_url": "http://192.168.1.1/mcp"},
                headers={"Authorization": "Bearer test-token"}
            )

            assert response.status_code == 400
            assert "private IPs" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_mcp_scan_quota_exceeded(self, client):
        """Test MCP scan with quota exceeded"""
        with patch("app.api.endpoints.scans.check_scan_quota") as mock_quota:
            mock_quota.return_value = {"allowed": False, "reason": "Daily limit exceeded"}

            with patch("app.api.endpoints.scans.get_current_user") as mock_user:
                mock_user.return_value = {
                    "id": "test-user-id",
                    "email": "test@example.com",
                    "tier": "free"
                }

                response = client.post(
                    "/scan/mcp",
                    json={"server_url": "https://example.com/mcp"},
                    headers={"Authorization": "Bearer test-token"}
                )

                assert response.status_code == 429
                data = response.json()
                assert data["error"] == "quota_exceeded"

    @pytest.mark.asyncio
    async def test_mcp_scan_error_handling(self, client):
        """Test error handling in MCP scan"""
        with patch("app.api.endpoints.scans.scan_mcp_server") as mock_scan:
            mock_scan.side_effect = Exception("Scan failed")

            with patch("app.api.endpoints.scans.check_scan_quota") as mock_quota:
                mock_quota.return_value = {"allowed": True}

                with patch("app.api.endpoints.scans.get_current_user") as mock_user:
                    mock_user.return_value = {
                        "id": "test-user-id",
                        "email": "test@example.com",
                        "tier": "pro"
                    }

                    response = client.post(
                        "/scan/mcp",
                        json={"server_url": "https://example.com/mcp"},
                        headers={"Authorization": "Bearer test-token"}
                    )

                    assert response.status_code == 500
                    assert "Scan failed" in response.json()["detail"]


class TestMCPSchema:
    """Test cases for MCP request schema"""

    def test_mcp_request_valid_url(self, client):
        """Test valid URL in MCP request"""
        with patch("app.api.endpoints.scans.get_current_user") as mock_user:
            mock_user.return_value = {
                "id": "test-user-id",
                "email": "test@example.com",
                "tier": "pro"
            }

            # This will fail due to missing quota check, but we're testing schema validation
            response = client.post(
                "/scan/mcp",
                json={"server_url": "https://example.com/mcp"},
                headers={"Authorization": "Bearer test-token"}
            )

            # Should not be 422 (validation error)
            assert response.status_code != 422

    def test_mcp_request_missing_url(self, client):
        """Test MCP request without URL"""
        with patch("app.api.endpoints.scans.get_current_user") as mock_user:
            mock_user.return_value = {
                "id": "test-user-id",
                "email": "test@example.com",
                "tier": "pro"
            }

            response = client.post(
                "/scan/mcp",
                json={},
                headers={"Authorization": "Bearer test-token"}
            )

            assert response.status_code == 422