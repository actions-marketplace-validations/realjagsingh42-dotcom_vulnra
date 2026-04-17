#!/bin/bash
# ─────────────────────────────────────────────────────────────
# VULNRA — Start all services with Docker Compose
# ─────────────────────────────────────────────────────────────
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "============================================="
echo "  VULNRA — Starting with Docker Compose"
echo "============================================="
docker-compose down
docker-compose up --build
