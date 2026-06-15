#!/bin/sh
set -eu

BASE_URL="${BASE_URL:-http://localhost:8080}"

echo "Running smoke tests against $BASE_URL..."

echo "Checking /api/health..."
curl -fsS --max-time 10 "$BASE_URL/api/health"
echo ""

echo "Checking /api/products..."
curl -fsS --max-time 10 "$BASE_URL/api/products"
echo ""

echo "All smoke tests passed."