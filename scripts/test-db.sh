#!/usr/bin/env bash
# Spustí integrační testy proti LOKÁLNÍ Supabase instanci (vyžaduje `supabase start`).
# Proti hostovanému projektu jen s HIDEPATH_TEST_ALLOW_REMOTE=1 a explicitními proměnnými.
set -euo pipefail
cd "$(dirname "$0")/.."
if [ -z "${HIDEPATH_TEST_SUPABASE_URL:-}" ]; then
  if ! supabase status >/dev/null 2>&1; then
    echo "Lokální Supabase neběží. Spusťte: pnpm db:start" >&2
    exit 1
  fi
  eval "$(supabase status -o env | grep -E '^(API_URL|ANON_KEY|SERVICE_ROLE_KEY)=')"
  export HIDEPATH_TEST_SUPABASE_URL="$API_URL"
  export HIDEPATH_TEST_SUPABASE_ANON_KEY="$ANON_KEY"
  export HIDEPATH_TEST_SUPABASE_SERVICE_KEY="$SERVICE_ROLE_KEY"
fi
case "$HIDEPATH_TEST_SUPABASE_URL" in
  http://127.0.0.1:*|http://localhost:*) ;;
  *)
    if [ "${HIDEPATH_TEST_ALLOW_REMOTE:-0}" != "1" ]; then
      echo "Odmítám spustit testy se service-role klíčem proti $HIDEPATH_TEST_SUPABASE_URL. Nastavte HIDEPATH_TEST_ALLOW_REMOTE=1, pokud to opravdu chcete." >&2
      exit 1
    fi
    ;;
esac
exec pnpm vitest run src/features/data/supabase-rls.test.ts "$@"
