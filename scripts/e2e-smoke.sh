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

# Read the same port variables, with the same defaults, that docker-compose.yml
# uses. A developer with these set, or with a .env file, would otherwise get a
# run where every probe tests a port that nothing listens on.
BANK_BACKEND_PORT="${BANK_BACKEND_PORT:-8085}"
BANK_FRONTEND_PORT="${BANK_FRONTEND_PORT:-3005}"
INSURANCE_BACKEND_PORT="${INSURANCE_BACKEND_PORT:-8086}"
INSURANCE_FRONTEND_PORT="${INSURANCE_FRONTEND_PORT:-3008}"
HEALTHCARE_BACKEND_PORT="${HEALTHCARE_BACKEND_PORT:-8087}"
HEALTHCARE_FRONTEND_PORT="${HEALTHCARE_FRONTEND_PORT:-3007}"

PASS=0; FAIL=0
ok()   { echo "  PASS  $1"; PASS=$((PASS+1)); }
bad()  { echo "  FAIL  $1"; FAIL=$((FAIL+1)); }

check_code() { # url expected label
  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$1" 2>/dev/null)
  [ "$code" = "$2" ] && ok "$3 ($code)" || bad "$3 (got $code, want $2)"
}

# Assert that an API call returned real records.
#
# A weaker version of this check only tested that the body starts with [ or {.
# That passes on an empty list and on a JSON error object, so it proved that
# the proxy returns JSON and nothing more. This version requires all of:
#   - HTTP 200
#   - a body that parses as JSON
#   - no error shape (a Spring error body carries "status" and "error")
#   - at least one record
# A record is a non-empty top-level array, a non-empty list inside an object,
# or a totalCount above zero.
check_records() { # url label
  local body code parsed
  body=$(curl -s --max-time 20 -w '\n%{http_code}' "$1" 2>/dev/null)
  code=$(printf '%s' "$body" | tail -1)
  body=$(printf '%s' "$body" | sed '$d')

  if [ "$code" != "200" ]; then
    bad "$2 (HTTP $code, want 200)"; return
  fi

  parsed=$(printf '%s' "$body" | python3 -c '
import json, sys
try:
    d = json.load(sys.stdin)
except Exception as e:
    print("NOTJSON %s" % e); raise SystemExit
if isinstance(d, dict) and ("error" in d or (isinstance(d.get("status"), int) and d["status"] >= 400)):
    print("ERRORBODY %s" % json.dumps(d)[:120]); raise SystemExit
n = None
if isinstance(d, list):
    n = len(d)
elif isinstance(d, dict):
    if isinstance(d.get("totalCount"), int):
        n = d["totalCount"]
    else:
        for v in d.values():
            if isinstance(v, list):
                n = len(v); break
print("COUNT %s" % ("?" if n is None else n))
' 2>/dev/null)

  case "$parsed" in
    COUNT\ 0)   bad "$2 (HTTP 200 but zero records - the database returned nothing)" ;;
    COUNT\ \?)  bad "$2 (HTTP 200, JSON, but no recognisable record list: $(printf '%s' "$body" | head -c 100))" ;;
    COUNT\ *)   ok  "$2 (HTTP 200, ${parsed#COUNT } records)" ;;
    ERRORBODY*) bad "$2 (HTTP 200 but an error body: ${parsed#ERRORBODY })" ;;
    NOTJSON*)   bad "$2 (HTTP 200 but not JSON: $(printf '%s' "$body" | head -c 100))" ;;
    *)          bad "$2 (check failed: $parsed)" ;;
  esac
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
  echo "  t=$((i * 5))s  healthy containers: $healthy"
  [ "${healthy:-0}" -ge 6 ] && break
  sleep 5
done

echo
docker compose ps

echo
echo "=============================================="
echo "3. Backends answer directly"
echo "=============================================="
check_code "http://localhost:${BANK_BACKEND_PORT}/api-docs" 200 "bank backend /api-docs"
check_code "http://localhost:${INSURANCE_BACKEND_PORT}/api-docs" 200 "insurance backend /api-docs"
check_code "http://localhost:${HEALTHCARE_BACKEND_PORT}/api-docs" 200 "healthcare backend /api-docs"

echo
echo "=============================================="
echo "4. Frontends serve the Vite bundle"
echo "=============================================="
for pair in "${BANK_FRONTEND_PORT}:bank" "${INSURANCE_FRONTEND_PORT}:insurance" "${HEALTHCARE_FRONTEND_PORT}:healthcare"; do
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
check_code "http://localhost:${BANK_FRONTEND_PORT}/customers"      200 "bank SPA route /customers"
check_code "http://localhost:${INSURANCE_FRONTEND_PORT}/claims"    200 "insurance SPA route /claims"
check_code "http://localhost:${HEALTHCARE_FRONTEND_PORT}/patients" 200 "healthcare SPA route /patients"

echo
echo "=============================================="
echo "6. Frontend nginx proxies /api to the backend"
echo "=============================================="
# This is the real integration proof: a browser-origin path reaches the database.
#
# The SEED database is the one that all three applications populate. The bank
# application seeds only its _seed and _prod databases, so bank_testing holds
# the schema and no rows. That is by design, not a fault, so a records check
# against TESTING would fail for the bank application only.
check_records "http://localhost:${BANK_FRONTEND_PORT}/api/branches?database=SEED"       "bank /api/branches via frontend proxy"
check_records "http://localhost:${INSURANCE_FRONTEND_PORT}/api/policies?database=SEED"  "insurance /api/policies via frontend proxy"
check_records "http://localhost:${HEALTHCARE_FRONTEND_PORT}/api/patients?database=SEED" "healthcare /api/patients via frontend proxy"

# Also prove that the route answers cleanly on TESTING. Do not assert records:
# bank_testing holds the schema and no rows.
#
# Note: the three applications do not agree on a default database. Bank starts
# on TESTING, healthcare on PROD, and insurance on SEED. See the useState call
# in each src/context/DatabaseContext.jsx.
check_code "http://localhost:${BANK_FRONTEND_PORT}/api/branches?database=TESTING"       200 "bank /api/branches on TESTING"
check_code "http://localhost:${INSURANCE_FRONTEND_PORT}/api/policies?database=TESTING"  200 "insurance /api/policies on TESTING"
check_code "http://localhost:${HEALTHCARE_FRONTEND_PORT}/api/patients?database=TESTING" 200 "healthcare /api/patients on TESTING"

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
