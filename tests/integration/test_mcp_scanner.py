"""
Integration tests for MCP Security Scanner
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, patch, MagicMock
from app.services.mcp_scanner import (
    MCPScanner,
    MCPTool,
    MCPVulnerability,
    MCPScanResult,
    scan_mcp_server,
)


@pytest.fixture
def scanner():
    """Create a scanner instance for testing"""
    return MCPScanner()


@pytest.fixture
def mock_mcp_tools():
    """Mock MCP tools for testing"""
    return [
        MCPTool(
            name="read_file",
            description="Read a file from the file system",
            input_schema={"type": "object", "properties": {"path": {"type": "string"}}},
            server_url="https://example.com/mcp",
        ),
        MCPTool(
            name="execute_command",
            description="Execute a system command",
            input_schema={"type": "object", "properties": {"command": {"type": "string"}}},
            server_url="https://example.com/mcp",
        ),
        MCPTool(
            name="fetch_data",
            description="Fetch data from an API",
            input_schema={"type": "object", "properties": {"url": {"type": "string"}}},
            server_url="https://example.com/mcp",
        ),
    ]


class TestMCPScanner:
    """Test cases for MCPScanner class"""

    def test_scanner_initialization(self, scanner):
        """Test scanner initializes with correct defaults"""
        assert scanner.timeout == 30.0
        assert scanner.max_tools == 100

    @pytest.mark.asyncio
    async def test_enumerate_tools_success(self, scanner, mock_mcp_tools):
        """Test successful tool enumeration"""
        # Mock the streamablehttp_client and ClientSession
        mock_session = AsyncMock()
        mock_session.initialize = AsyncMock()
        mock_session.list_tools = AsyncMock()
        mock_session.list_tools.return_value = MagicMock(
            tools=[
                MagicMock(
                    name=tool.name,
                    description=tool.description,
                    inputSchema=tool.input_schema,
                )
                for tool in mock_mcp_tools
            ]
        )

        with patch("app.services.mcp_scanner.streamablehttp_client") as mock_http_client:
            mock_http_client.return_value.__aenter__.return_value = (AsyncMock(), AsyncMock())
            with patch("app.services.mcp_scanner.ClientSession") as mock_client_session:
                mock_client_session.return_value.__aenter__.return_value = mock_session

                tools = await scanner._enumerate_tools("https://example.com/mcp")

                assert len(tools) == 3
                assert tools[0].name == "read_file"
                assert tools[1].name == "execute_command"
                assert tools[2].name == "fetch_data"

    @pytest.mark.asyncio
    async def test_check_tool_poisoning(self, scanner, mock_mcp_tools):
        """Test detection of suspicious tool names"""
        suspicious_tool = MCPTool(
            name="execute_command",
            description="Execute a system command",
            input_schema={"type": "object"},
            server_url="https://example.com/mcp",
        )

        vulnerabilities = await scanner._check_tool_poisoning(
            suspicious_tool, "https://example.com/mcp"
        )

        assert len(vulnerabilities) > 0
        assert any("Administrative Tool" in v.name for v in vulnerabilities)

    @pytest.mark.asyncio
    async def test_check_prompt_injection(self, scanner, mock_mcp_tools):
        """Test detection of prompt injection vulnerabilities"""
        vulnerable_tool = MCPTool(
            name="process_text",
            description="Process text input",
            input_schema={
                "type": "object",
                "properties": {
                    "text": {"type": "string"}  # No validation constraints
                },
            },
            server_url="https://example.com/mcp",
        )

        vulnerabilities = await scanner._check_prompt_injection(
            vulnerable_tool, "https://example.com/mcp"
        )

        assert len(vulnerabilities) > 0
        assert any("Unvalidated String Parameter" in v.name for v in vulnerabilities)

    @pytest.mark.asyncio
    async def test_check_data_exfiltration(self, scanner, mock_mcp_tools):
        """Test detection of data exfiltration risks"""
        file_tool = MCPTool(
            name="read_file",
            description="Read a file",
            input_schema={"type": "object"},
            server_url="https://example.com/mcp",
        )

        vulnerabilities = await scanner._check_data_exfiltration(
            file_tool, "https://example.com/mcp"
        )

        assert len(vulnerabilities) > 0
        assert any("File Access Tool" in v.name for v in vulnerabilities)

    def test_calculate_risk_score(self, scanner):
        """Test risk score calculation"""
        vulnerabilities = [
            MCPVulnerability(
                id="test-1",
                name="Test Vulnerability",
                description="Test description",
                severity="HIGH",
                cvss_score=7.5,
                evidence={},
                remediation="Test remediation",
            )
        ]

        score = scanner._calculate_risk_score(vulnerabilities)
        assert 0 <= score <= 100
        assert score > 0

    def test_get_overall_severity(self, scanner):
        """Test overall severity determination"""
        # Test with no vulnerabilities
        assert scanner._get_overall_severity([]) == "LOW"

        # Test with critical vulnerability
        critical_vuln = MCPVulnerability(
            id="test-1",
            name="Critical",
            description="Test",
            severity="CRITICAL",
            cvss_score=10.0,
            evidence={},
            remediation="Test",
        )
        assert scanner._get_overall_severity([critical_vuln]) == "CRITICAL"

        # Test with high vulnerability
        high_vuln = MCPVulnerability(
            id="test-2",
            name="High",
            description="Test",
            severity="HIGH",
            cvss_score=8.0,
            evidence={},
            remediation="Test",
        )
        assert scanner._get_overall_severity([high_vuln]) == "HIGH"

    @pytest.mark.asyncio
    async def test_scan_server_success(self, scanner, mock_mcp_tools):
        """Test successful server scan"""
        with patch.object(scanner, "_enumerate_tools", return_value=mock_mcp_tools):
            with patch.object(scanner, "_analyze_tools", return_value=[]):
                result = await scanner.scan_server("https://example.com/mcp")

                assert result.status == "SUCCESS"
                assert result.server_url == "https://example.com/mcp"
                assert result.tools_found == 3
                assert result.risk_score == 0.0
                assert result.overall_severity == "LOW"

    @pytest.mark.asyncio
    async def test_scan_server_error(self, scanner):
        """Test server scan with error"""
        with patch.object(
            scanner, "_enumerate_tools", side_effect=Exception("Connection failed")
        ):
            result = await scanner.scan_server("https://example.com/mcp")

            assert result.status == "ERROR"
            assert result.server_url == "https://example.com/mcp"


class TestMCPScanResult:
    """Test cases for MCPScanResult model"""

    def test_scan_result_creation(self):
        """Test MCPScanResult model creation"""
        result = MCPScanResult(
            server_url="https://example.com/mcp",
            status="SUCCESS",
            tools_found=5,
            vulnerabilities=[],
            risk_score=0.0,
            overall_severity="LOW",
            scan_duration=1.5,
        )

        assert result.server_url == "https://example.com/mcp"
        assert result.status == "SUCCESS"
        assert result.tools_found == 5
        assert result.risk_score == 0.0
        assert result.overall_severity == "LOW"


class TestMCPVulnerability:
    """Test cases for MCPVulnerability model"""

    def test_vulnerability_creation(self):
        """Test MCPVulnerability model creation"""
        vuln = MCPVulnerability(
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

        assert vuln.id == "test-1"
        assert vuln.name == "Test Vulnerability"
        assert vuln.severity == "HIGH"
        assert vuln.cvss_score == 7.5
        assert vuln.owasp_category == "LLM01"
        assert vuln.mitre_technique == "T0001.001"


class TestScanMcpServer:
    """Test cases for scan_mcp_server function"""

    @pytest.mark.asyncio
    async def test_scan_mcp_server_wrapper(self):
        """Test the scan_mcp_server wrapper function"""
        with patch("app.services.mcp_scanner.scanner") as mock_scanner:
            mock_result = MCPScanResult(
                server_url="https://example.com/mcp",
                status="SUCCESS",
                tools_found=3,
                vulnerabilities=[],
                risk_score=0.0,
                overall_severity="LOW",
                scan_duration=1.0,
            )
            mock_scanner.scan_server = AsyncMock(return_value=mock_result)

            result = await scan_mcp_server("https://example.com/mcp")

            assert result.server_url == "https://example.com/mcp"
            assert result.status == "SUCCESS"
            mock_scanner.scan_server.assert_called_once_with("https://example.com/mcp")