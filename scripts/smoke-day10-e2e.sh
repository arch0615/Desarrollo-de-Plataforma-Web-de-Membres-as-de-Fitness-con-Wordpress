#!/usr/bin/env bash
# End-to-end member flow smoke test using real Auth.js credentials.
# Tests: csrf → login → access protected page → access library → cancel sub
# Requires the dev server up on localhost:3000 and seed-day5 + day-7 already run.

set -euo pipefail
BASE="${BASE:-http://localhost:3000}"
EMAIL="${EMAIL:-test-member@milagros.local}"
PASSWORD="${PASSWORD:-test1234}"
COOKIE_JAR="$(mktemp)"
trap 'rm -f "$COOKIE_JAR"' EXIT

step() {
  printf "\n=== %s ===\n" "$1"
}

step "1. fetch CSRF token"
CSRF=$(curl -s -c "$COOKIE_JAR" -b "$COOKIE_JAR" "$BASE/api/auth/csrf" | python3 -c "import sys,json;print(json.load(sys.stdin)['csrfToken'])")
echo "csrf token length: ${#CSRF}"

step "2. credentials login"
HTTP=$(curl -s -o /tmp/login_resp.txt -w "%{http_code}" -c "$COOKIE_JAR" -b "$COOKIE_JAR" \
  -X POST -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "csrfToken=$CSRF" \
  --data-urlencode "email=$EMAIL" \
  --data-urlencode "password=$PASSWORD" \
  --data-urlencode "redirect=false" \
  --data-urlencode "callbackUrl=$BASE/app" \
  "$BASE/api/auth/callback/credentials")
echo "login http: $HTTP"
echo "session cookie present?"
grep -c "authjs.session-token\|next-auth.session-token" "$COOKIE_JAR" || true

step "3. fetch /api/auth/session (should now return user)"
curl -s -b "$COOKIE_JAR" "$BASE/api/auth/session" | python3 -c "import sys,json;d=json.load(sys.stdin);print('user:',d.get('user',{}).get('email'),'role:',d.get('user',{}).get('role'))"

step "4. fetch /app dashboard (200 if access OK)"
HTTP=$(curl -s -L -o /tmp/dash.html -w "%{http_code}" -b "$COOKIE_JAR" "$BASE/app")
SIZE=$(wc -c </tmp/dash.html)
echo "dashboard http: $HTTP, $SIZE bytes"
echo "contains 'Hola, Test'? $(grep -c 'Hola, Test' /tmp/dash.html)"
echo "contains 'Continuar viendo'? $(grep -c 'Continuar viendo' /tmp/dash.html)"

step "5. fetch /app/clases?q=movilidad"
curl -s -b "$COOKIE_JAR" "$BASE/app/clases?q=movilidad" -o /tmp/lib.html
echo "result count text: $(grep -oE '[0-9]+ (clase|clases)' /tmp/lib.html | head -1)"
echo "Movilidad de cadera present? $(grep -c 'Movilidad de cadera' /tmp/lib.html)"

step "6. fetch class detail"
curl -s -b "$COOKIE_JAR" "$BASE/app/clase/movilidad-cadera-y-columna" -o /tmp/det.html
echo "title rendered? $(grep -c 'Movilidad de cadera y columna' /tmp/det.html)"
echo "favorite button? $(grep -c 'Favorito' /tmp/det.html)"
echo "video placeholder (no Bunny)? $(grep -c 'Video aún no disponible' /tmp/det.html)"

step "7. fetch /app/suscripcion (cancel button visible since member is active)"
curl -s -b "$COOKIE_JAR" "$BASE/app/suscripcion" -o /tmp/sub.html
echo "shows plan? $(grep -c 'Mensual' /tmp/sub.html)"
echo "cancel button? $(grep -c 'Cancelar suscripci' /tmp/sub.html)"

step "8. progress API (POST 15s position)"
CLS_ID=$(sudo -u postgres psql -At milagros_dev -c "SELECT id FROM \"Class\" WHERE slug='movilidad-cadera-y-columna';")
echo "class id: $CLS_ID"
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -b "$COOKIE_JAR" -X POST \
  -H "Content-Type: application/json" \
  -d "{\"classId\":\"$CLS_ID\",\"positionSeconds\":120}" \
  "$BASE/api/progress")
echo "progress POST http: $HTTP"

step "9. /api/playlists list"
curl -s -b "$COOKIE_JAR" "$BASE/api/playlists" | head -c 200; echo

step "10. logout sanity (clear cookie + verify redirect)"
HTTP_NEW=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/app")
echo "/app without cookie: $HTTP_NEW"

echo
echo "=== E2E SMOKE COMPLETE ==="
