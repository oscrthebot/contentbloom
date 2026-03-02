#!/usr/bin/env bash
# Generate personalised preview articles for cold outreach leads.
# Cron entry (nightly at 23:00 UTC):
#   0 23 * * * /root/.openclaw/workspace/contentbloom/scripts/generate-previews.sh >> /tmp/generate-previews.log 2>&1

set -euo pipefail
cd "$(dirname "$0")/.."

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Starting preview generation..."
npx tsx generate-previews.mts "$@"
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Done."
