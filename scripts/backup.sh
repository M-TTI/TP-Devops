#!/bin/sh
set -eu

BACKUP_DIR="$(cd "$(dirname "$0")/.." && pwd)/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="backup_${TIMESTAMP}.sql"

POSTGRES_USER="${POSTGRES_USER:-shoplite}"
POSTGRES_DB="${POSTGRES_DB:-shoplite}"
CONTAINER="${DB_CONTAINER:-shoplite_db}"

mkdir -p "$BACKUP_DIR"

echo "[backup] Dump de $POSTGRES_DB → $FILENAME"
docker exec "$CONTAINER" pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "$BACKUP_DIR/$FILENAME"

SIZE=$(du -sh "$BACKUP_DIR/$FILENAME" | cut -f1)
echo "[backup] Fichier créé : $BACKUP_DIR/$FILENAME ($SIZE)"

# Rétention : conserver les 7 derniers dumps
STALE=$(ls -t "$BACKUP_DIR"/backup_*.sql 2>/dev/null | tail -n +8)
if [ -n "$STALE" ]; then
  echo "$STALE" | xargs rm -f
  echo "[backup] Anciens dumps supprimés"
fi

COUNT=$(ls "$BACKUP_DIR"/backup_*.sql 2>/dev/null | wc -l)
echo "[backup] $COUNT backup(s) conservé(s) dans $BACKUP_DIR"
