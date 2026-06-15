#!/bin/sh
set -eu

BASE_URL="${BASE_URL:-http://localhost:8080}"
PASS=0
FAIL=0

check() {
  LABEL="$1"
  URL="$2"
  printf "[smoke] %-30s ... " "$LABEL"
  if curl -fsS --max-time 10 "$URL" > /dev/null 2>&1; then
    echo "OK"
    PASS=$((PASS + 1))
  else
    echo "FAIL"
    FAIL=$((FAIL + 1))
  fi
}

echo "[smoke] Tests against $BASE_URL"
echo ""

check "GET /api/health"   "$BASE_URL/api/health"
check "GET /api/ready"    "$BASE_URL/api/ready"
check "GET /api/products" "$BASE_URL/api/products"

echo ""
echo "[smoke] Résultat : $PASS OK, $FAIL FAIL"

if [ "$FAIL" -gt 0 ]; then
  echo "[smoke] Échec — le service n'est pas prêt"
  exit 1
fi

echo "[smoke] Tous les tests sont passés"
