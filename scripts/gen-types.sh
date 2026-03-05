#!/usr/bin/env bash
# gen-types.sh — Regenerate TypeScript types from remote Supabase schema
# Usage: bash scripts/gen-types.sh

set -euo pipefail

PROJECT_REF="hqiajozpurlxrfaqzbzj"
ACCESS_TOKEN="${SUPABASE_ACCESS_TOKEN:-sbp_v0_76938756309fcc244606869fe503c2093caa3e29}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Fetching types from Supabase project: $PROJECT_REF..."

TYPES=$(curl -s \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  "https://api.supabase.com/v1/projects/${PROJECT_REF}/types/typescript")

# Extract the types string
TYPES_CONTENT=$(echo "$TYPES" | python3 -c "import json,sys; print(json.load(sys.stdin)['types'])")

if [ -z "$TYPES_CONTENT" ]; then
  echo "ERROR: Failed to fetch types"
  exit 1
fi

# Write to both packages/types and apps/web
echo "$TYPES_CONTENT" > "$ROOT/packages/types/src/database.types.ts"
echo "$TYPES_CONTENT" > "$ROOT/apps/web/src/types/database.generated.ts"

LINES=$(wc -l < "$ROOT/packages/types/src/database.types.ts")
echo "✓ Generated $LINES lines of TypeScript types"
echo "  → packages/types/src/database.types.ts"
echo "  → apps/web/src/types/database.generated.ts"
