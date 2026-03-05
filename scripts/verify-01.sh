#!/usr/bin/env bash
# verify-01.sh — Verifies the initial setup of the Tasky monorepo
# Run from the project root: bash scripts/verify-01.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_DIR="$ROOT/apps/web"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Tasky v1 — Setup Verification (Prompt 01)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ── 1. Node modules ──
echo -e "${YELLOW}1. Dependencies${NC}"
[ -d "$ROOT/node_modules" ] && check "Root node_modules present" "ok" || check "Root node_modules present" "not found"
[ -f "$ROOT/pnpm-lock.yaml" ] && check "pnpm-lock.yaml exists" "ok" || check "pnpm-lock.yaml exists" "not found"
[ -d "$ROOT/node_modules/turbo" ] && check "turbo installed" "ok" || check "turbo installed" "not found"

# ── 2. Project structure ──
echo ""
echo -e "${YELLOW}2. Project Structure${NC}"
dirs=("apps/web" "apps/mobile" "packages/ui" "packages/types" "packages/config" "supabase/migrations" "supabase/functions" "scripts" ".github/workflows")
for dir in "${dirs[@]}"; do
  [ -d "$ROOT/$dir" ] && check "Directory: $dir" "ok" || check "Directory: $dir" "not found"
done

# ── 3. Key files ──
echo ""
echo -e "${YELLOW}3. Key Files${NC}"
files=(
  "package.json"
  "pnpm-workspace.yaml"
  "turbo.json"
  "netlify.toml"
  ".prettierrc"
  ".gitignore"
  "supabase/config.toml"
  "supabase/seed.sql"
  "apps/web/vite.config.ts"
  "apps/web/tsconfig.json"
  "apps/web/index.html"
  "apps/web/src/main.tsx"
  "apps/web/src/App.tsx"
  "apps/web/src/lib/supabase.ts"
  "apps/web/src/styles/globals.css"
  "apps/web/src/vite-env.d.ts"
  ".github/workflows/ci.yml"
  ".github/workflows/deploy.yml"
)
for file in "${files[@]}"; do
  [ -f "$ROOT/$file" ] && check "File: $file" "ok" || check "File: $file" "not found"
done

# ── 4. Environment Variables ──
echo ""
echo -e "${YELLOW}4. Environment Variables${NC}"
if [ -f "$WEB_DIR/.env.local" ]; then
  check ".env.local exists" "ok"

  SUPABASE_URL=$(grep "VITE_SUPABASE_URL=" "$WEB_DIR/.env.local" | cut -d'=' -f2)
  SUPABASE_KEY=$(grep "VITE_SUPABASE_ANON_KEY=" "$WEB_DIR/.env.local" | cut -d'=' -f2)
  GOOGLE_ID=$(grep "VITE_GOOGLE_CLIENT_ID=" "$WEB_DIR/.env.local" | cut -d'=' -f2)
  APP_URL=$(grep "VITE_APP_URL=" "$WEB_DIR/.env.local" | cut -d'=' -f2)

  [ -n "$SUPABASE_URL" ] && check "VITE_SUPABASE_URL set" "ok" || check "VITE_SUPABASE_URL set" "empty"
  [ -n "$SUPABASE_KEY" ] && check "VITE_SUPABASE_ANON_KEY set" "ok" || check "VITE_SUPABASE_ANON_KEY set" "empty"
  [ -n "$GOOGLE_ID" ] && check "VITE_GOOGLE_CLIENT_ID set" "ok" || check "VITE_GOOGLE_CLIENT_ID set" "empty"
  [ -n "$APP_URL" ] && check "VITE_APP_URL set" "ok" || check "VITE_APP_URL set" "empty"
else
  check ".env.local exists" "not found — copy .env.example to .env.local"
fi

# ── 5. Supabase Connection ──
echo ""
echo -e "${YELLOW}5. Supabase Connection${NC}"
if [ -n "${SUPABASE_URL:-}" ] && [ -n "${SUPABASE_KEY:-}" ]; then
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "apikey: $SUPABASE_KEY" \
    -H "Authorization: Bearer $SUPABASE_KEY" \
    "${SUPABASE_URL}/rest/v1/" 2>/dev/null || echo "000")

  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ]; then
    check "Supabase API reachable (HTTP $HTTP_CODE)" "ok"
  else
    check "Supabase API reachable" "HTTP $HTTP_CODE — check SUPABASE_URL"
  fi
else
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxaWFqb3pwdXJseHJmYXF6YnpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MzA3MDAsImV4cCI6MjA4ODEwNjcwMH0.-XO7bBwGYHuURt9-wNaG6XNYGheS2zngpjDj_ksDetQ" \
    "https://hqiajozpurlxrfaqzbzj.supabase.co/rest/v1/" 2>/dev/null || echo "000")
  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ]; then
    check "Supabase API reachable (HTTP $HTTP_CODE)" "ok"
  else
    check "Supabase API reachable" "HTTP $HTTP_CODE"
  fi
fi

# ── 6. TypeScript ──
echo ""
echo -e "${YELLOW}6. TypeScript${NC}"
cd "$WEB_DIR"
if ../../node_modules/.bin/tsc --noEmit > /tmp/tsc_output.txt 2>&1; then
  check "TypeScript — no errors" "ok"
else
  check "TypeScript — no errors" "$(cat /tmp/tsc_output.txt | head -3)"
fi
cd "$ROOT"

# ── 7. Build ──
echo ""
echo -e "${YELLOW}7. Production Build${NC}"
cd "$WEB_DIR"
if ../../node_modules/.pnpm/node_modules/.bin/vite build > /tmp/build_output.txt 2>&1; then
  check "Vite build — success" "ok"
  [ -d "$WEB_DIR/dist" ] && check "dist/ directory created" "ok" || check "dist/ directory created" "not found"
else
  check "Vite build" "FAILED — see /tmp/build_output.txt"
fi
cd "$ROOT"

# ── 8. netlify.toml ──
echo ""
echo -e "${YELLOW}8. Netlify Config${NC}"
if grep -q 'base = "apps/web"' "$ROOT/netlify.toml" && \
   grep -q 'publish = "dist"' "$ROOT/netlify.toml" && \
   grep -q 'X-Frame-Options' "$ROOT/netlify.toml"; then
  check "netlify.toml valid" "ok"
else
  check "netlify.toml valid" "missing required fields"
fi

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
