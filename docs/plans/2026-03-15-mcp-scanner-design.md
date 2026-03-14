# MCP Security Scanner Design

## Overview

This document outlines the design for the VULNRA MCP Security Scanner, a standalone feature for scanning Model Context Protocol (MCP) servers for security vulnerabilities.

## Architecture

### Backend Components

1. **MCP Scanner Service** (`app/services/mcp_scanner.py`)
   - `MCPScanner` class: Main scanning engine
   - Tool enumeration via JSON-RPC
   - Vulnerability detection algorithms
   - Risk scoring engine

2. **API Endpoints** (`app/api/endpoints/scans.py`)
   - `POST /scan/mcp`: Main scanning endpoint
   - Request validation and SSRF protection
   - Rate limiting by user tier

3. **Compliance Mapping** (`app/core/compliance.py`)
   - OWASP LLM 2025 mapping
   - MITRE ATLAS mapping
   - CVSS scoring

### Frontend Components

1. **MCP Scanner Page** (`frontend/src/app/mcp-scanner/page.tsx`)
   - Dedicated page for MCP scanning
   - Dark theme matching existing VULNRA design

2. **MCPServerScanner Component** (`frontend/src/components/mcp-scanner/MCPServerScanner.tsx`)
   - URL input and scan trigger
   - Error handling and user feedback
   - Navigation integration

3. **MCPScanResults Component** (`frontend/src/components/mcp-scanner/MCPScanResults.tsx`)
   - Tabbed interface for results
   - Vulnerability details
   - Compliance mapping display

## Data Flow

1. User enters MCP server URL
2. Frontend sends POST request to `/scan/mcp`
3. Backend validates URL and checks quotas
4. MCP scanner connects to server and enumerates tools
5. Tools are analyzed for vulnerabilities
6. Results are scored and mapped to compliance frameworks
7. Frontend displays results with tabs for different views

## Vulnerability Detection

### Tool Poisoning
- Suspicious tool names (exec, shell, system, etc.)
- Vague or missing descriptions
- Unexpected administrative operations

### Prompt Injection
- Unvalidated string parameters
- Missing parameter constraints
- Input schema analysis

### Privilege Escalation
- Administrative tool detection
- System-level operation identification
- Permission claim analysis

### Data Exfiltration
- File access operations
- Network request capabilities
- External resource fetching

## Security Considerations

- SSRF protection for private IPs
- Rate limiting by user tier
- Session-based authentication
- Error handling without information leakage

## Testing Strategy

1. Unit tests for scanner logic
2. Integration tests for API endpoints
3. Mock tests for MCP protocol interaction
4. Frontend component tests

## Deployment

- Added to existing FastAPI backend
- Frontend route at `/mcp-scanner`
- No changes to existing LLM scanner
- Separate product category as requested