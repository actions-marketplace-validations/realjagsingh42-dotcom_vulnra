#!/bin/bash
# ─────────────────────────────────────────────────────────────
# VULNRA — Start backend API server (no Docker)
# ─────────────────────────────────────────────────────────────
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "============================================="
echo "  VULNRA — Backend API Server"
echo "  http://localhost:8000/docs"
echo "============================================="

if [ ! -d "venv" ]; then
  echo "ERROR: venv not found. Run setup.sh first."
  exit 1
fi

source venv/bin/activate
export PYTHONPATH="$SCRIPT_DIR"
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
