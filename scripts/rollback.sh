#!/bin/sh
set -eu

REGISTRY="ghcr.io/m-tti/tp-devops"
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
  --format '  image={{.Config.Image}} labels={{json .Config.Labels}}' 2>/dev/null \
  || echo "  (conteneur non trouvé)"

# Vérifier que l'image cible existe dans le registry
echo "[rollback] Vérification de l'image $VERSION dans le registry..."
docker pull "$REGISTRY/api:$VERSION"
docker pull "$REGISTRY/frontend:$VERSION"

# Sauvegarder les logs avant toute modification
echo "[rollback] Export des logs API..."
mkdir -p "$PROJECT_DIR/backups"
docker logs shoplite_api 2>&1 > "$PROJECT_DIR/backups/logs_before_rollback_$(date +%Y%m%d_%H%M%S).txt" || true

# Arrêter les services SANS supprimer les volumes PostgreSQL
# INTERDIT : docker compose down -v
echo "[rollback] Arrêt des services (volumes préservés)..."
docker compose -f "$PROJECT_DIR/docker-compose.yml" down

# Redémarrer avec les images versionnées via override inline
echo "[rollback] Démarrage avec la version $VERSION..."
docker compose \
  -f "$PROJECT_DIR/docker-compose.yml" \
  -f - \
  up -d --no-build <<EOF
services:
  api:
    image: $REGISTRY/api:$VERSION
    build: {}
  frontend:
    image: $REGISTRY/frontend:$VERSION
    build: {}
EOF

echo "[rollback] Attente du démarrage des services (20s)..."
sleep 20

# Vérification post-rollback
echo "[rollback] Smoke tests..."
"$PROJECT_DIR/scripts/smoke-test.sh"

echo ""
echo "[rollback] Rollback vers $VERSION terminé."
echo "[rollback] Vérifier que les données PostgreSQL sont intactes :"
echo "  curl http://localhost:8080/api/products"
