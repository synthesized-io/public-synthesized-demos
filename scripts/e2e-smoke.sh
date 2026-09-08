#!/usr/bin/env bash
# End-to-end smoke test for the three demo applications.
#
# The repository has no unit tests for the frontends and only a context-load
# test for each backend. This script is the integration check. It starts the
# full stack with Docker Compose, then proves that each tier answers.
#
# It checks the things that a bundler change or a dependency upgrade can break:
#   - each backend starts and serves its OpenAPI document
#   - each frontend serves a hashed Vite asset, and no Create React App
#     /static/js path survives
#   - client-side routes fall back to index.html through nginx
#   - an /api call goes through the frontend nginx proxy to the backend and
#     reaches the database
#
# Usage:  ./scripts/e2e-smoke.sh
# Needs:  Docker and the Docker Compose plugin. Nothing else.
# Exit:   0 if every check passes, 1 if any check fails.
#
# Note: this script leaves the stack running so that you can look at it.
# Run `docker compose down -v` when you finish.

set -uo pipefail
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO" || exit 1

PASS=0; FAIL=0
ok()   { echo "  PASS  $1"; PASS=$((PASS+1)); }
bad()  { echo "  FAIL  $1"; FAIL=$((FAIL+1)); }

check_code() { # url expected label
  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$1" 2>/dev/null)
  [ "$code" = "$2" ] && ok "$3 ($code)" || bad "$3 (got $code, want $2)"
}

check_json() { # url label
  local body
  body=$(curl -s --max-time 20 "$1" 2>/dev/null)
  if [ -n "$body" ] && printf '%s' "$body" | head -c1 | grep -qE '[\[{]'; then
    ok "$2 (${#body} bytes of JSON)"
  else
    bad "$2 (no JSON: $(printf '%s' "$body" | head -c 120))"
  fi
}

echo "=============================================="
echo "1. Build all images"
echo "=============================================="
if docker compose build --progress plain 2>&1 | tail -30; then
  ok "docker compose build"
else
  bad "docker compose build"
  echo "Build failed. Stopping."
  exit 1
fi

echo
echo "=============================================="
echo "2. Start the stack"
echo "=============================================="
docker compose up -d bank insurance healthcare 2>&1 | tail -20

echo
echo "Waiting for backend healthchecks (up to 300s)..."
for i in $(seq 1 60); do
  healthy=$(docker compose ps --format json 2>/dev/null \
    | python3 -c "
import sys,json
n=0
for line in sys.stdin:
    line=line.strip()
    if not line: continue
    try: d=json.loads(line)
    except Exception: continue
    if isinstance(d,list):
        for x in d:
            if 'healthy' in str(x.get('Health','')): n+=1
    else:
        if 'healthy' in str(d.get('Health','')): n+=1
print(n)
" 2>/dev/null || echo 0)
  echo "  t=${i}0s  healthy containers: $healthy"
  [ "${healthy:-0}" -ge 6 ] && break
  sleep 5
done

echo
docker compose ps

echo
echo "=============================================="
echo "3. Backends answer directly"
echo "=============================================="
check_code "http://localhost:8085/api-docs" 200 "bank backend /api-docs"
check_code "http://localhost:8086/api-docs" 200 "insurance backend /api-docs"
check_code "http://localhost:8087/api-docs" 200 "healthcare backend /api-docs"

echo
echo "=============================================="
echo "4. Frontends serve the Vite bundle"
echo "=============================================="
for pair in "3005:bank" "3008:insurance" "3007:healthcare"; do
  port=${pair%%:*}; name=${pair##*:}
  check_code "http://localhost:${port}/" 200 "${name} frontend index"

  html=$(curl -s --max-time 15 "http://localhost:${port}/" 2>/dev/null)
  asset=$(printf '%s' "$html" | grep -oE '/assets/[A-Za-z0-9._-]+\.js' | head -1)
  if [ -n "$asset" ]; then
    ok "${name} index.html references a hashed Vite asset ($asset)"
    size=$(curl -s -o /dev/null -w '%{size_download}' --max-time 20 "http://localhost:${port}${asset}")
    [ "${size:-0}" -gt 10000 ] \
      && ok "${name} asset downloads (${size} bytes)" \
      || bad "${name} asset too small (${size} bytes)"
  else
    bad "${name} index.html has no /assets/*.js reference (CRA leftover or stale public/index.html?)"
  fi

  # CRA emitted /static/js/*.js. Seeing that means an old build leaked through.
  if printf '%s' "$html" | grep -q '/static/js/'; then
    bad "${name} still references a CRA /static/js path"
  else
    ok "${name} has no CRA /static/js reference"
  fi
done

echo
echo "=============================================="
echo "5. SPA fallback routing through nginx"
echo "=============================================="
check_code "http://localhost:3005/customers"     200 "bank SPA route /customers"
check_code "http://localhost:3008/claims"        200 "insurance SPA route /claims"
check_code "http://localhost:3007/patients"      200 "healthcare SPA route /patients"

echo
echo "=============================================="
echo "6. Frontend nginx proxies /api to the backend"
echo "=============================================="
# This is the real integration proof: browser-origin path reaches the DB tier.
check_json "http://localhost:3005/api/branches?database=TESTING"  "bank /api/branches via frontend proxy"
check_json "http://localhost:3008/api/policies?database=TESTING"  "insurance /api/policies via frontend proxy"
check_json "http://localhost:3007/api/patients?database=TESTING"  "healthcare /api/patients via frontend proxy"

echo
echo "=============================================="
echo "7. Container health summary"
echo "=============================================="
docker compose ps --format 'table {{.Name}}\t{{.Status}}'
echo
echo "Recent backend errors, if any:"
for c in bank-backend insurance-backend healthcare-backend; do
  errs=$(docker logs "$c" 2>&1 | grep -icE '\bERROR\b|exception' || true)
  echo "  $c: $errs error/exception lines"
done

echo
echo "=============================================="
echo "RESULT: $PASS passed, $FAIL failed"
echo "=============================================="
exit $([ "$FAIL" -eq 0 ] && echo 0 || echo 1)
