# ShopLite - Starter TP final DevOps

ShopLite est un projet de base pour un TP final DevOps.

Les etudiants recoivent uniquement ce socle applicatif :

- API Node.js / Express
- Frontend HTML / CSS / JS
- Script SQL PostgreSQL
- Un test de sante minimal
- Une configuration Docker minimale pour lancer le projet

Le travail du TP consiste a construire progressivement :

- Git propre et strategie de branches
- Ameliorer les Dockerfile API et frontend
- Ameliorer docker-compose dev / staging / prod
- CI/CD GitHub Actions
- tests automatises
- logs propres
- securite container
- backup PostgreSQL
- rollback sans perte de donnees
- documentation professionnelle

## Lancement rapide avec Docker

```bash
docker compose up -d --build
```

Ouvrir :

```text
http://localhost:8080
```

Tester :

```bash
curl http://localhost:8080/api/health
curl http://localhost:8080/api/products
```

Arreter sans supprimer les donnees :

```bash
docker compose down
```

## Lancement hors Docker pour prise en main

```bash
cd api
npm install
npm test
npm start
```

API :

```text
http://localhost:3000/health
http://localhost:3000/products
```

Frontend :

Ouvrir `frontend/src/index.html` dans un navigateur ou le servir avec un serveur statique.

## Diagnostic

```bash
docker compose ps
docker compose logs --tail=100 api
curl http://localhost:8080/api/health
curl http://localhost:8080/api/ready
docker inspect shoplite_api
```

## Centralisation des logs

En local, les logs sont écrits sur stdout/stderr et capturés par Docker (driver `json-file`, rotation 10 Mo / 3 fichiers).

En production, les logs JSON structurés seraient acheminés vers un système centralisé :

- **ELK Stack** (Elasticsearch + Logstash + Kibana) — collecte via Filebeat ou Fluentd
- **Grafana Loki** — agrégation légère, requêtes LogQL
- **AWS CloudWatch Logs** — si déploiement sur EC2/ECS

Le champ `request_id` présent dans chaque log permet de corréler toutes les lignes d'une même requête dans ces outils.

## Suivi d'incident

| Symptôme | Heure | Cause | Commande utilisée | Résultat |
|---|---|---|---|---|
| `GET /api/products` retourne 500 | J8 14:32 | Exception non gérée dans `products.js` après merge | `docker compose logs --tail=50 api` | Stacktrace visible, origine identifiée |
| CI rouge sur `feature/products` | J8 14:35 | Test `products.test.js` échoue (500 au lieu de 200) | GitHub Actions → onglet Tests | Confirmation de la régression |
| Rollback vers v1.0.0 | J8 14:50 | `./scripts/rollback.sh v1.0.0` | `curl /api/products` + `npm test` | Tests verts, données PostgreSQL intactes |
