#!/bin/bash
set -e
DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$DIR"

export SUPABASE_URL="https://wolktxrncwskkimgouwc.supabase.co"
export SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvbGt0eHJuY3dza2tpbWdvdXdjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjkwMjIxNCwiZXhwIjoyMDg4NDc4MjE0fQ.JWjHn28-fO2KCS5-suwTFlIZnJjCy9dj5vRET7hfEsE"

echo "=== WooNews Daily Pipeline $(date) ==="
node scripts/collect-rss.js
node scripts/collect-twitter.js
node scripts/merge-topics.js
node scripts/interpret.js
node scripts/simulate-personas.js
node scripts/push-to-supabase.js
echo "=== 完成 ==="
