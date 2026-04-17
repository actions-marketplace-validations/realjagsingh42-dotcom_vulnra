#!/bin/bash
# ─────────────────────────────────────────────────────────────
# VULNRA — Start frontend (Next.js)
# ─────────────────────────────────────────────────────────────
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/frontend"

echo "============================================="
echo "  VULNRA — Frontend (Next.js)"
echo "  http://localhost:3000"
echo "============================================="

npm run dev
