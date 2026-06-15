#!/bin/sh
set -eu

BACKUP_DIR="$(cd "$(dirname "$0")/.." && pwd)/backups"
CONTAINER="${DB_CONTAINER:-shoplite_db}"
POSTGRES_USER="${POSTGRES_USER:-shoplite}"
TEST_DB="shoplite_restore_test"

# Utiliser le fichier passé en argument, sinon prendre le plus récent
if [ $# -ge 1 ]; then
  DUMP_FILE="$1"
else
  DUMP_FILE=$(ls -t "$BACKUP_DIR"/backup_*.sql 2>/dev/null | head -1)
  if [ -z "$DUMP_FILE" ]; then
    echo "[restore-test] Erreur : aucun backup trouvé dans $BACKUP_DIR"
    exit 1
  fi
fi

echo "[restore-test] Fichier : $DUMP_FILE"

# Créer la base temporaire
docker exec "$CONTAINER" psql -U "$POSTGRES_USER" \
  -c "DROP DATABASE IF EXISTS $TEST_DB;" \
  -c "CREATE DATABASE $TEST_DB;"

# Restaurer
echo "[restore-test] Restauration en cours..."
docker exec -i "$CONTAINER" psql -U "$POSTGRES_USER" -d "$TEST_DB" < "$DUMP_FILE"

# Vérifier que les données sont bien là
PRODUCT_COUNT=$(docker exec "$CONTAINER" \
  psql -U "$POSTGRES_USER" -d "$TEST_DB" -tAc "SELECT COUNT(*) FROM products;")
echo "[restore-test] $PRODUCT_COUNT produit(s) trouvé(s) dans la base restaurée"

# Nettoyage
docker exec "$CONTAINER" psql -U "$POSTGRES_USER" -c "DROP DATABASE $TEST_DB;"
echo "[restore-test] Base temporaire supprimée — restauration validée"
