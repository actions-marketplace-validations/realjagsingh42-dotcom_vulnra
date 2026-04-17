# VULNRA — Production-Grade AI Security Scanner

[![GitHub Marketplace](https://img.shields.io/badge/GitHub%20Marketplace-VULNRA%20LLM%20Security%20Scan-green?logo=github)](https://github.com/marketplace/actions/vulnra-llm-security-scan)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

VULNRA is an automated red-teaming platform that continuously probes LLM APIs
for exploitable vulnerabilities before attackers do. Drop it into any CI/CD
pipeline and get a risk score, categorized findings, and compliance mappings
on every push.

## What VULNRA Detects

| Attack Class | Description |
|---|---|
| **Prompt Injection** | Direct and indirect attempts to hijack model instructions |
| **Jailbreaks** | DAN variants, role-play bypasses, fictional framing attacks |
| **Multi-Turn Attacks** | Crescendo and GOAT escalation chains across conversation turns |
| **Encoding Bypasses** | Base64, leetspeak, Unicode obfuscation to evade safety filters |
| **Data Leakage** | System prompt extraction, training data reconstruction |
| **Compliance Violations** | Outputs that breach regulatory or policy constraints |

## Compliance Frameworks

VULNRA maps every finding to the frameworks your security and legal teams care about:

- **OWASP LLM Top 10** — industry-standard LLM vulnerability taxonomy
- **MITRE ATLAS** — adversarial threat landscape for AI systems
- **EU AI Act** — regulatory risk classification for high-risk AI
- **NIST AI RMF** — risk management framework alignment

## GitHub Action — Scan in CI/CD

```yaml
name: LLM Security Scan
on: [push, pull_request]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: realjagsingh42-dotcom/vulnra@v1
        with:
          api_key: ${{ secrets.VULNRA_API_KEY }}
          target_url: 'https://your-llm-api.com/v1/chat/completions'
          tier: 'pro'
          fail_on_risk_score: '70'
```

Every scan returns:
- **Risk score** (0–100) with pass/fail threshold enforcement
- **Categorized findings** with severity levels
- **PR comments** with full vulnerability report
- **Compliance mapping** across all four frameworks

Get your API key at [vulnra-production-fb23.up.railway.app](https://vulnra-production-fb23.up.railway.app)

---

## Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Start all services with one command
docker compose up --build

# Stop all services
docker compose down
```

### Option 2: Manual Setup

```bash
# 1. Clone and setup
git clone https://github.com/your-org/vulnra.git
cd vulnra
cp .env.example .env

# 2. Install dependencies
python -m venv venv
source venv/bin/activate          # Linux/macOS
pip install -r requirements.txt

cd frontend && npm install && cd ..

# 3. Configure .env
# Edit .env with your Supabase URL/keys and other credentials

# 4. Start all services
./start-all.sh
```

## Services

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Web UI |
| **Backend API** | http://localhost:8000 | REST API |
| **API Docs** | http://localhost:8000/docs | Swagger documentation |
| **Demo LLM** | http://localhost:8001 | Vulnerable target for testing |

## Testing the Scanner

### Run a Quick Scan

```bash
# Scan the demo vulnerable LLM target
curl -X POST http://localhost:8000/scan/quick \
  -H "Content-Type: application/json" \
  -d '{"target_url": "http://localhost:8001/v1/chat/completions"}'
```

### Run a Full Scan (requires authentication)

```bash
# 1. Get a session token from Supabase
# 2. POST a scan request
curl -X POST http://localhost:8000/scan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "url": "http://localhost:8001/v1/chat/completions",
    "scan_name": "My LLM Test"
  }'

# 3. Poll for results
curl http://localhost:8000/scan/SCAN_ID
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Required | Description |
|----------|----------|-------------|
| `SECRET_KEY` | Yes | Session signing key. Generate: `python -c "import secrets; print(secrets.token_urlsafe(64))"` |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Yes | Supabase service role key |
| `REDIS_URL` | Yes | Redis connection string |
| `ANTHROPIC_API_KEY` | For AI Judge | Anthropic API key for vulnerability scoring |
| `LEMONSQUEEZY_*` | For billing | Lemon Squeezy API credentials |

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend  │────▶│  FastAPI     │────▶│   Garak     │
│  (Next.js)  │◀────│  Backend     │◀────│  DeepTeam   │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    │   Celery    │
                    │   Worker    │
                    └─────────────┘
```

## Features

- **AI Risk Detection**: Prompt injection, jailbreak, encoding bypass detection
- **Multi-Turn Attacks**: Crescendo and GOAT attack chains
- **Compliance Mapping**: OWASP LLM Top 10, MITRE ATLAS, EU AI Act, NIST AI RMF
- **AI Judge**: Claude-powered vulnerability assessment
- **Scheduled Scans**: Automate recurring security tests
- **Team Management**: Organization quotas and SSO

## License

MIT License — see the [LICENSE](LICENSE) file for details.
