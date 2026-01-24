#!/bin/bash
# Daily JDIH UMK Monitor
# Run via cron: 0 8 * * * /path/to/daily_jdih_monitor.sh
#
# Scans JDIH APIs for new "upah minimum" documents
# Downloads PDFs automatically when detected

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LOG_FILE="$PROJECT_ROOT/data/raw/jdih_monitor.log"

cd "$PROJECT_ROOT"

echo "$(date '+%Y-%m-%d %H:%M:%S') Starting JDIH monitor..." >> "$LOG_FILE"

python tools/scripts/monitor_jdih.py --download 2>&1 | tee -a "$LOG_FILE"

echo "$(date '+%Y-%m-%d %H:%M:%S') Done" >> "$LOG_FILE"
