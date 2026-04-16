# VULNRA

VULNRA is an AI Risk Scanner & Compliance Reporter designed to automatically find jailbreaks, prompt injections, and encoding bypasses in any LLM endpoint. It maps vulnerabilities to the EU AI Act & NIST frameworks in real-time.

## Features

### AI Risk Detection
- **Prompt Injection Detection**: Identify direct and indirect chains.
- **Jailbreak Detection**: Recognize DAN, AutoDAN, and HijackKill styles.
- **Encoding Bypasses**: Catch Base64, ROT13, and Unicode obfuscated inputs.
- **Multi-Turn Attack Chains**: Crescendo (5-turn escalating) and GOAT (autonomous) attacks.

### Compliance & Frameworks
- **OWASP LLM 2025**: Complete coverage of all 10 OWASP LLM Top 10 categories.
- **MITRE ATLAS Mapping**: Tactical framework for AI security attacks (T0001-T0048).
- **Real-time Compliance Mapping**: Map risks to EU AI Act, NIST AI RMF, and DPDP.

### Platform Features
- **Rate Limiting**: Tier-based API rate limiting with Redis backend.
- **Multi-Engine Support**: Garak and DeepTeam scanning engines.
- **AI Judge Evaluation**: Claude-powered vulnerability assessment.

---

## Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js 20+
- Redis (running on localhost:6379)
- Docker & Docker Compose (optional)

### Option 1: Docker Compose (Recommended)

```bash
# Start all services (backend, worker, Redis, frontend)
./start.sh

# Or on Windows:
start.bat
```

### Option 2: Manual Start

```bash
# 1. Set up Python environment
python -m venv venv
source venv/bin/activate      # Linux/macOS
# venv\Scripts\activate       # Windows
pip install -r requirements.txt

# 2. Configure environment
# Edit .env with your Supabase, Anthropic, Lemon Squeezy, and Resend credentials

# 3. Start Redis (if not running)
docker run -d -p 6379:6379 redis:7-alpine

# 4. Start backend (Terminal 1)
./start-backend.sh
# Or: source venv/bin/activate && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 5. Start Celery worker (Terminal 2)
./start-worker.sh
# Or: source venv/bin/activate && celery -A app.worker worker --loglevel=info

# 6. Start frontend (Terminal 3)
cd frontend && npm install && npm run dev
```

### Services

| Service | URL |
|---------|-----|
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| Frontend | http://localhost:3000 |

### Environment Variables

Copy `.env.example` to `.env` and fill in your credentials. Required variables:
- `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` — Supabase project
- `ANTHROPIC_API_KEY` — For AI Judge (Claude 3 Haiku)
- `SECRET_KEY` — Generate with: `python -c "import secrets; print(secrets.token_urlsafe(64))"`

### Scan Engines

- **Garak**: Install at `garak_env/` or set `GARAK_VENV_PATH` in `.env`
- **DeepTeam**: Included in requirements
- **PyRIT / EasyJailbreak**: Reference implementations

## License

MIT License — see the [LICENSE](LICENSE) file for details.
