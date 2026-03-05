#!/usr/bin/env bash
# apply-migrations.sh — Apply migration files to remote Supabase via Management API
# Usage: bash scripts/apply-migrations.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MIGRATIONS_DIR="$ROOT/supabase/migrations"
PROJECT_REF="hqiajozpurlxrfaqzbzj"
ACCESS_TOKEN="sbp_v0_76938756309fcc244606869fe503c2093caa3e29"
API_URL="https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

apply_sql() {
  local label="$1"
  local sql="$2"
  local response
  local http_code

  # Escape SQL for JSON (use python3 for reliable escaping)
  local json_payload
  json_payload=$(python3 -c "
import json, sys
sql = sys.stdin.read()
print(json.dumps({'query': sql}))
" <<< "$sql")

  response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    "${API_URL}" \
    -d "$json_payload" 2>&1)

  http_code=$(echo "$response" | tail -1)
  body=$(echo "$response" | head -n -1)

  if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    echo -e "  ${GREEN}✓${NC} $label"
    return 0
  else
    echo -e "  ${RED}✗${NC} $label (HTTP $http_code)"
    echo "    Error: $(echo "$body" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get("message","unknown error"))' 2>/dev/null || echo "$body" | head -2)"
    return 1
  fi
}

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Applying Tasky migrations to Supabase${NC}"
echo -e "${BLUE}  Project: ${PROJECT_REF}${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

PASS=0
FAIL=0

for migration_file in $(ls "$MIGRATIONS_DIR"/*.sql | sort); do
  filename=$(basename "$migration_file")
  sql_content=$(cat "$migration_file")

  if apply_sql "$filename" "$sql_content"; then
    PASS=$((PASS+1))
  else
    FAIL=$((FAIL+1))
    echo -e "  ${YELLOW}⚠${NC} Continuing despite error in $filename"
  fi
done

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ $FAIL -eq 0 ]; then
  echo -e "  ${GREEN}All $PASS migrations applied successfully!${NC}"
else
  echo -e "  ${GREEN}$PASS applied${NC}, ${RED}$FAIL failed${NC}"
fi
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

[ $FAIL -eq 0 ] && exit 0 || exit 1
