"""
MCP Security Scanner Service

Scans MCP servers for vulnerabilities including:
- Tool poisoning
- Prompt injection via sampling
- Privilege escalation
- Data exfiltration
"""

import asyncio
import json
import logging
import re
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urlparse

import httpx
from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client
from pydantic import BaseModel, Field

from app.core.compliance import (
    MITRE_ATLAS_TECHNIQUES,
    OWASP_LLM_CATEGORIES,
)

logger = logging.getLogger(__name__)


class MCPTool(BaseModel):
    """Represents an MCP tool definition"""
    name: str
    description: str
    input_schema: Dict[str, Any]
    server_url: str


class MCPVulnerability(BaseModel):
    """Represents a detected vulnerability"""
    id: str
    name: str
    description: str
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL
    cvss_score: float
    owasp_category: Optional[str]
    mitre_technique: Optional[str]
    evidence: Dict[str, Any]
    remediation: str


class MCPScanResult(BaseModel):
    """Complete scan result for an MCP server"""
    server_url: str
    status: str  # SUCCESS, ERROR, TIMEOUT
    tools_found: int
    vulnerabilities: List[MCPVulnerability]
    risk_score: float
    overall_severity: str
    scan_duration: float


class MCPScanner:
    """Main MCP scanner class"""

    def __init__(self):
        self.timeout = 30.0
        self.max_tools = 100

    async def scan_server(self, server_url: str) -> MCPScanResult:
        """Scan an MCP server for vulnerabilities"""
        start_time = asyncio.get_event_loop().time()

        try:
            # Step 1: Connect to MCP server
            tools = await self._enumerate_tools(server_url)

            # Step 2: Analyze tools for vulnerabilities
            vulnerabilities = await self._analyze_tools(tools, server_url)

            # Step 3: Calculate risk score
            risk_score = self._calculate_risk_score(vulnerabilities)

            # Step 4: Determine overall severity
            overall_severity = self._get_overall_severity(vulnerabilities)

            scan_duration = asyncio.get_event_loop().time() - start_time

            return MCPScanResult(
                server_url=server_url,
                status="SUCCESS",
                tools_found=len(tools),
                vulnerabilities=vulnerabilities,
                risk_score=risk_score,
                overall_severity=overall_severity,
                scan_duration=scan_duration,
            )

        except Exception as e:
            logger.error(f"Error scanning MCP server {server_url}: {e}")
            scan_duration = asyncio.get_event_loop().time() - start_time
            return MCPScanResult(
                server_url=server_url,
                status="ERROR",
                tools_found=0,
                vulnerabilities=[],
                risk_score=0.0,
                overall_severity="UNKNOWN",
                scan_duration=scan_duration,
            )

    async def _enumerate_tools(self, server_url: str) -> List[MCPTool]:
        """Enumerate tools from MCP server"""
        tools = []

        try:
            # Connect to MCP server using streamable HTTP
            async with streamablehttp_client(url=server_url) as (read_stream, write_stream):
                async with ClientSession(
                    read_stream=read_stream,
                    write_stream=write_stream,
                ) as session:
                    # Initialize session
                    await session.initialize()

                    # List available tools
                    response = await session.list_tools()

                    for tool in response.tools:
                        tools.append(
                            MCPTool(
                                name=tool.name,
                                description=tool.description,
                                input_schema=tool.inputSchema if tool.inputSchema else {},
                                server_url=server_url,
                            )
                        )

                    logger.info(f"Found {len(tools)} tools from {server_url}")

        except Exception as e:
            logger.error(f"Failed to enumerate tools from {server_url}: {e}")
            raise

        return tools

    async def _analyze_tools(
        self, tools: List[MCPTool], server_url: str
    ) -> List[MCPVulnerability]:
        """Analyze tools for vulnerabilities"""
        vulnerabilities = []

        for tool in tools:
            # Check for tool poisoning indicators
            tool_vulns = await self._check_tool_poisoning(tool, server_url)
            vulnerabilities.extend(tool_vulns)

            # Check for prompt injection vectors
            injection_vulns = await self._check_prompt_injection(tool, server_url)
            vulnerabilities.extend(injection_vulns)

            # Check for privilege escalation
            priv_vulns = await self._check_privilege_escalation(tool, server_url)
            vulnerabilities.extend(priv_vulns)

            # Check for data exfiltration risks
            exfil_vulns = await self._check_data_exfiltration(tool, server_url)
            vulnerabilities.extend(exfil_vulns)

        return vulnerabilities

    async def _check_tool_poisoning(
        self, tool: MCPTool, server_url: str
    ) -> List[MCPVulnerability]:
        """Check for tool poisoning vulnerabilities"""
        vulnerabilities = []

        # Check for suspicious tool names
        suspicious_patterns = [
            r"read.*file",
            r"download",
            r"exec",
            r"system",
            r"shell",
            r"cmd",
            r"powershell",
            r"bash",
        ]

        for pattern in suspicious_patterns:
            if re.search(pattern, tool.name, re.IGNORECASE):
                vulnerabilities.append(
                    MCPVulnerability(
                        id=f"TOOL-POISON-{tool.name}",
                        name="Suspicious Tool Name",
                        description=f"Tool '{tool.name}' has a suspicious name that may indicate malicious intent",
                        severity="MEDIUM",
                        cvss_score=5.0,
                        owasp_category=OWASP_LLM_CATEGORIES["LLM01"],
                        mitre_technique=MITRE_ATLAS_TECHNIQUES["T0001.001"],
                        evidence={"tool_name": tool.name, "pattern": pattern},
                        remediation="Review tool definitions and ensure they match expected functionality",
                    )
                )

        # Check for overly broad descriptions
        if len(tool.description) < 10:
            vulnerabilities.append(
                MCPVulnerability(
                    id=f"TOOL-DESC-{tool.name}",
                    name="Vague Tool Description",
                    description=f"Tool '{tool.name}' has a vague description",
                    severity="LOW",
                    cvss_score=2.0,
                    owasp_category=OWASP_LLM_CATEGORIES["LLM02"],
                    mitre_technique=MITRE_ATLAS_TECHNIQUES["T0001.002"],
                    evidence={"tool_name": tool.name, "description_length": len(tool.description)},
                    remediation="Provide detailed descriptions for all tools",
                )
            )

        return vulnerabilities

    async def _check_prompt_injection(
        self, tool: MCPTool, server_url: str
    ) -> List[MCPVulnerability]:
        """Check for prompt injection vulnerabilities"""
        vulnerabilities = []

        # Check if tool accepts string parameters that could be injected
        if "properties" in tool.input_schema:
            for param_name, param_def in tool.input_schema["properties"].items():
                if param_def.get("type") == "string":
                    # Check if parameter has no validation
                    if "minLength" not in param_def and "maxLength" not in param_def:
                        vulnerabilities.append(
                            MCPVulnerability(
                                id=f"PROMPT-INJ-{tool.name}-{param_name}",
                                name="Unvalidated String Parameter",
                                description=f"Tool '{tool.name}' accepts unvalidated string parameter '{param_name}' which could be vulnerable to prompt injection",
                                severity="MEDIUM",
                                cvss_score=6.0,
                                owasp_category=OWASP_LLM_CATEGORIES["LLM01"],
                                mitre_technique=MITRE_ATLAS_TECHNIQUES["T0001.001"],
                                evidence={
                                    "tool_name": tool.name,
                                    "parameter": param_name,
                                    "schema": param_def,
                                },
                                remediation="Add validation constraints to string parameters",
                            )
                        )

        return vulnerabilities

    async def _check_privilege_escalation(
        self, tool: MCPTool, server_url: str
    ) -> List[MCPVulnerability]:
        """Check for privilege escalation vulnerabilities"""
        vulnerabilities = []

        # Check for administrative or system-level operations
        admin_patterns = [
            r"admin",
            r"root",
            r"sudo",
            r"privileged",
            r"system",
            r"delete",
            r"modify",
            r"update",
            r"write",
        ]

        for pattern in admin_patterns:
            if re.search(pattern, tool.name, re.IGNORECASE):
                vulnerabilities.append(
                    MCPVulnerability(
                        id=f"PRIV-ESC-{tool.name}",
                        name="Administrative Tool",
                        description=f"Tool '{tool.name}' appears to perform administrative operations",
                        severity="HIGH",
                        cvss_score=7.5,
                        owasp_category=OWASP_LLM_CATEGORIES["LLM05"],
                        mitre_technique=MITRE_ATLAS_TECHNIQUES["T0005.001"],
                        evidence={"tool_name": tool.name, "pattern": pattern},
                        remediation="Ensure proper authorization checks are in place",
                    )
                )

        return vulnerabilities

    async def _check_data_exfiltration(
        self, tool: MCPTool, server_url: str
    ) -> List[MCPVulnerability]:
        """Check for data exfiltration risks"""
        vulnerabilities = []

        # Check for file access operations
        file_patterns = [
            r"read.*file",
            r"download",
            r"fetch",
            r"get.*content",
        ]

        for pattern in file_patterns:
            if re.search(pattern, tool.name, re.IGNORECASE):
                vulnerabilities.append(
                    MCPVulnerability(
                        id=f"EXFIL-{tool.name}",
                        name="File Access Tool",
                        description=f"Tool '{tool.name}' can access files which could lead to data exfiltration",
                        severity="MEDIUM",
                        cvss_score=5.5,
                        owasp_category=OWASP_LLM_CATEGORIES["LLM02"],
                        mitre_technique=MITRE_ATLAS_TECHNIQUES["T0003.001"],
                        evidence={"tool_name": tool.name, "pattern": pattern},
                        remediation="Implement proper file access controls and sandboxing",
                    )
                )

        # Check for network access operations
        network_patterns = [
            r"http",
            r"request",
            r"api",
            r"fetch",
            r"download",
        ]

        for pattern in network_patterns:
            if re.search(pattern, tool.name, re.IGNORECASE):
                vulnerabilities.append(
                    MCPVulnerability(
                        id=f"NET-ACCESS-{tool.name}",
                        name="Network Access Tool",
                        description=f"Tool '{tool.name}' can access network resources",
                        severity="MEDIUM",
                        cvss_score=5.5,
                        owasp_category=OWASP_LLM_CATEGORIES["LLM02"],
                        mitre_technique=MITRE_ATLAS_TECHNIQUES["T0003.001"],
                        evidence={"tool_name": tool.name, "pattern": pattern},
                        remediation="Implement network access controls and rate limiting",
                    )
                )

        return vulnerabilities

    def _calculate_risk_score(self, vulnerabilities: List[MCPVulnerability]) -> float:
        """Calculate overall risk score based on vulnerabilities"""
        if not vulnerabilities:
            return 0.0

        # Weight vulnerabilities by severity
        severity_weights = {
            "CRITICAL": 10.0,
            "HIGH": 7.0,
            "MEDIUM": 4.0,
            "LOW": 2.0,
        }

        total_score = 0.0
        for vuln in vulnerabilities:
            weight = severity_weights.get(vuln.severity, 1.0)
            total_score += weight * (vuln.cvss_score / 10.0)

        # Normalize to 0-100 scale
        max_possible = len(vulnerabilities) * 10.0
        risk_score = (total_score / max_possible) * 100 if max_possible > 0 else 0.0

        return min(risk_score, 100.0)

    def _get_overall_severity(self, vulnerabilities: List[MCPVulnerability]) -> str:
        """Determine overall severity based on vulnerabilities"""
        if not vulnerabilities:
            return "LOW"

        severities = [v.severity for v in vulnerabilities]

        if "CRITICAL" in severities:
            return "CRITICAL"
        elif "HIGH" in severities:
            return "HIGH"
        elif "MEDIUM" in severities:
            return "MEDIUM"
        else:
            return "LOW"


# Singleton instance
scanner = MCPScanner()


async def scan_mcp_server(server_url: str) -> MCPScanResult:
    """Convenience function to scan an MCP server"""
    return await scanner.scan_server(server_url)
