#!/usr/bin/env bash
# verify-02.sh — Verifies the database schema of the Tasky monorepo
# Run from the project root: bash scripts/verify-02.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_REF="hqiajozpurlxrfaqzbzj"
ACCESS_TOKEN="sbp_v0_76938756309fcc244606869fe503c2093caa3e29"
API_URL="https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASS=0
FAIL=0

check() {
  local name="$1"
  local result="$2"
  if [ "$result" = "ok" ]; then
    echo -e "  ${GREEN}✓${NC} $name"
    PASS=$((PASS+1))
  else
    echo -e "  ${RED}✗${NC} $name ${RED}— $result${NC}"
    FAIL=$((FAIL+1))
  fi
}

db_query() {
  curl -s -X POST \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    "${API_URL}" \
    -d "{\"query\": \"$1\"}" 2>/dev/null
}

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Tasky v1 — Database Schema Verification (Prompt 02)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ── 1. Migration files ──
echo -e "${YELLOW}1. Migration Files${NC}"
MIGRATION_COUNT=$(ls "$ROOT/supabase/migrations/"*.sql 2>/dev/null | wc -l)
[ "$MIGRATION_COUNT" -ge 11 ] && check "11+ migration files present ($MIGRATION_COUNT)" "ok" || \
  check "Migration files" "only $MIGRATION_COUNT found"

# ── 2. All 30 expected tables ──
echo ""
echo -e "${YELLOW}2. Tables (30 expected)${NC}"
TABLE_COUNT=$(db_query "SELECT COUNT(*) AS n FROM pg_tables WHERE schemaname = 'public'" | \
  python3 -c "import json,sys; print(json.load(sys.stdin)[0]['n'])" 2>/dev/null || echo "0")

[ "$TABLE_COUNT" -eq 30 ] && check "30 tables in public schema" "ok" || \
  check "30 tables in public schema" "found $TABLE_COUNT"

# Check specific critical tables
CRITICAL_TABLES=(
  "profiles" "workspaces" "workspace_members"
  "nodes" "node_permissions" "user_favorites" "recent_views" "sidebar_state"
  "blocks"
  "collections" "collection_properties" "collection_views" "collection_items"
  "collection_item_values" "collection_relations"
  "template_products" "template_versions" "template_assets"
  "template_installations" "template_stats"
  "calendar_events" "event_attendees"
  "notifications" "audit_logs" "security_events"
  "user_settings" "workspace_settings" "notification_prefs"
  "api_tokens" "widget_tokens"
)

for table in "${CRITICAL_TABLES[@]}"; do
  result=$(db_query "SELECT EXISTS(SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='$table') AS exists" | \
    python3 -c "import json,sys; print(json.load(sys.stdin)[0]['exists'])" 2>/dev/null || echo "false")
  [ "$result" = "True" ] || [ "$result" = "true" ] && check "Table: $table" "ok" || check "Table: $table" "missing"
done

# ── 3. RLS enabled on all tables ──
echo ""
echo -e "${YELLOW}3. Row Level Security${NC}"
NO_RLS=$(db_query "SELECT COUNT(*) AS n FROM pg_tables WHERE schemaname='public' AND rowsecurity=false" | \
  python3 -c "import json,sys; print(json.load(sys.stdin)[0]['n'])" 2>/dev/null || echo "99")
[ "$NO_RLS" = "0" ] && check "RLS enabled on all 30 tables" "ok" || \
  check "RLS enabled on all tables" "$NO_RLS tables without RLS"

POLICY_COUNT=$(db_query "SELECT COUNT(*) AS n FROM pg_policies WHERE schemaname='public'" | \
  python3 -c "import json,sys; print(json.load(sys.stdin)[0]['n'])" 2>/dev/null || echo "0")
[ "$POLICY_COUNT" -ge 30 ] && check "30+ RLS policies defined ($POLICY_COUNT)" "ok" || \
  check "30+ RLS policies" "only $POLICY_COUNT found"

# ── 4. Triggers ──
echo ""
echo -e "${YELLOW}4. Triggers & Functions${NC}"
TRIGGER_COUNT=$(db_query "SELECT COUNT(*) AS n FROM information_schema.triggers WHERE trigger_schema='public' OR event_object_schema='auth'" | \
  python3 -c "import json,sys; print(json.load(sys.stdin)[0]['n'])" 2>/dev/null || echo "0")
[ "$TRIGGER_COUNT" -ge 10 ] && check "10+ triggers defined ($TRIGGER_COUNT)" "ok" || \
  check "10+ triggers" "only $TRIGGER_COUNT found"

# Check handle_new_user trigger specifically
HNU=$(db_query "SELECT EXISTS(SELECT 1 FROM pg_trigger WHERE tgname='on_auth_user_created') AS exists" | \
  python3 -c "import json,sys; print(json.load(sys.stdin)[0]['exists'])" 2>/dev/null || echo "false")
[ "$HNU" = "True" ] || [ "$HNU" = "true" ] && check "Trigger: on_auth_user_created" "ok" || \
  check "Trigger: on_auth_user_created" "missing"

# Check key functions
for fn in "handle_new_user" "cascade_soft_delete" "compute_node_position" "is_workspace_member" "is_workspace_admin"; do
  FN_EXISTS=$(db_query "SELECT EXISTS(SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE p.proname='$fn' AND n.nspname='public') AS exists" | \
    python3 -c "import json,sys; print(json.load(sys.stdin)[0]['exists'])" 2>/dev/null || echo "false")
  [ "$FN_EXISTS" = "True" ] || [ "$FN_EXISTS" = "true" ] && check "Function: $fn()" "ok" || \
    check "Function: $fn()" "missing"
done

# ── 5. Indexes ──
echo ""
echo -e "${YELLOW}5. Indexes${NC}"
INDEX_COUNT=$(db_query "SELECT COUNT(*) AS n FROM pg_indexes WHERE schemaname='public'" | \
  python3 -c "import json,sys; print(json.load(sys.stdin)[0]['n'])" 2>/dev/null || echo "0")
[ "$INDEX_COUNT" -ge 25 ] && check "25+ indexes created ($INDEX_COUNT)" "ok" || \
  check "25+ indexes" "only $INDEX_COUNT found"

# ── 6. TypeScript types generated ──
echo ""
echo -e "${YELLOW}6. TypeScript Types${NC}"
[ -f "$ROOT/packages/types/src/database.types.ts" ] && \
  check "packages/types/src/database.types.ts generated" "ok" || \
  check "database.types.ts" "not found"

[ -f "$ROOT/apps/web/src/types/database.generated.ts" ] && \
  check "apps/web/src/types/database.generated.ts synced" "ok" || \
  check "database.generated.ts" "not found"

# Verify TypeScript compiles
cd "$ROOT/apps/web"
if ../../node_modules/.bin/tsc --noEmit > /tmp/tsc_output.txt 2>&1; then
  check "TypeScript — no errors with new types" "ok"
else
  check "TypeScript" "ERRORS — $(cat /tmp/tsc_output.txt | head -1)"
fi
cd "$ROOT"

# ── 7. Supabase API connectivity ──
echo ""
echo -e "${YELLOW}7. Supabase API${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxaWFqb3pwdXJseHJmYXF6YnpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MzA3MDAsImV4cCI6MjA4ODEwNjcwMH0.-XO7bBwGYHuURt9-wNaG6XNYGheS2zngpjDj_ksDetQ" \
  "https://hqiajozpurlxrfaqzbzj.supabase.co/rest/v1/profiles" 2>/dev/null || echo "000")
# 401 is expected (not authenticated), but proves the endpoint works
[ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "200" ] && \
  check "REST API for profiles reachable (HTTP $HTTP_CODE)" "ok" || \
  check "REST API reachable" "HTTP $HTTP_CODE"

# ── Summary ──
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
TOTAL=$((PASS+FAIL))
if [ $FAIL -eq 0 ]; then
  echo -e "  ${GREEN}All $TOTAL checks passed!${NC} 🎉"
else
  echo -e "  ${GREEN}$PASS passed${NC}, ${RED}$FAIL failed${NC} (total: $TOTAL)"
fi
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

[ $FAIL -eq 0 ] && exit 0 || exit 1
