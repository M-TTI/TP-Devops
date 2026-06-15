#!/bin/sh
set -eu

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if [ $# -ne 1 ]; then
  echo "Usage: $0 <version>"
  echo "  Ex : $0 v1.0.0"
  exit 1
fi

VERSION="$1"

# Identifier la version actuellement déployée
echo "[rollback] Version actuellement déployée :"
docker inspect shoplite_api \
  --format '  image={{.Config.Image}} sha={{.Image}}' 2>/dev/null \
  || echo "  (conteneur non trouvé)"

# Vérifier que le tag Git existe
echo "[rollback] Vérification du tag $VERSION..."
git -C "$PROJECT_DIR" fetch --tags
if ! git -C "$PROJECT_DIR" tag | grep -qx "$VERSION"; then
  echo "[rollback] Erreur : tag $VERSION introuvable"
  echo "[rollback] Tags disponibles :"
  git -C "$PROJECT_DIR" tag | sort -V
  exit 1
fi
echo "[rollback] Tag $VERSION trouvé"

# Sauvegarder les logs avant toute modification
echo "[rollback] Export des logs API..."
mkdir -p "$PROJECT_DIR/backups"
docker logs shoplite_api 2>&1 \
  > "$PROJECT_DIR/backups/logs_before_rollback_$(date +%Y%m%d_%H%M%S).txt" \
  || true

# Arrêter les services SANS supprimer les volumes PostgreSQL
# INTERDIT : docker compose down -v
echo "[rollback] Arrêt des services (volumes préservés)..."
docker compose -f "$PROJECT_DIR/docker-compose.yml" down

# Checkout du code à la version cible
echo "[rollback] Checkout vers $VERSION..."
git -C "$PROJECT_DIR" checkout "$VERSION"

# Rebuild et redémarrage avec l'image de la version cible
echo "[rollback] Rebuild et redémarrage avec $VERSION..."
docker compose -f "$PROJECT_DIR/docker-compose.yml" up -d --build

echo "[rollback] Attente du démarrage des services (20s)..."
sleep 20

# Vérification post-rollback
echo "[rollback] Smoke tests..."
"$PROJECT_DIR/scripts/smoke-test.sh"

echo ""
echo "[rollback] Rollback vers $VERSION terminé."
echo "[rollback] Vérifier que les données PostgreSQL sont intactes :"
echo "  curl http://localhost:8080/api/products"
