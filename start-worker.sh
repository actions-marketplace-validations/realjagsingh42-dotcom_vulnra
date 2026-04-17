#!/bin/bash
# ─────────────────────────────────────────────────────────────
# VULNRA — Start Celery worker (no Docker)
# ─────────────────────────────────────────────────────────────
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "============================================="
echo "  VULNRA — Celery Worker"
echo "============================================="

if [ ! -d "venv" ]; then
  echo "ERROR: venv not found. Run setup.sh first."
  exit 1
fi

source venv/bin/activate
export PYTHONPATH="$SCRIPT_DIR"
python -m celery -A app.worker worker --loglevel=info --pool=solo -Q scans,sentinel
