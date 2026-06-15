# Checklist Sécurité — ShopLite

## Secrets

| Vérification | Statut | Notes |
|---|---|---|
| Aucun secret dans le code source | ✅ | `.gitignore` couvre `.env` |
| Aucun secret dans les Dockerfiles | ✅ | Variables injectées via `environment:` dans Compose |
| Aucun secret dans les logs | ✅ | Middleware sanitize `authorization`, `password`, `token`, `secret`, `x-api-key` |
| `.env.example` présent et complet | ✅ | Toutes les variables documentées avec valeurs d'exemple |
| Secrets CI/CD dans GitHub Secrets | ✅ | `POSTGRES_PASSWORD`, `DATABASE_URL` en secrets GitHub |

## Ports exposés

| Port | Service | Justification |
|---|---|---|
| 8080 | nginx (proxy) | Point d'entrée unique, exposé publiquement |
| 3000 | API Node.js | Interne uniquement (réseau Docker `shoplite_net`) |
| 5432 | PostgreSQL | Interne uniquement (réseau Docker `shoplite_net`) |

Seul le port **8080** est exposé à l'extérieur — les autres restent sur le réseau interne Docker.

## Dépendances

### npm audit (2026-06-15)

| Sévérité | Nombre | Détail | Action |
|---|---|---|---|
| Critique | 0 | — | — |
| High | 0 | — | — |
| Modérée | 18 | js-yaml via Jest (devDep) | Pas d'action — devDep non embarquée en prod |
| Faible | 0 | — | — |

Le CI bloque sur `--audit-level=high` : aucune vulnérabilité high/critique ne peut être mergée.

### npm outdated (2026-06-15)

| Package | Actuel | Dernière | Type | Risque |
|---|---|---|---|---|
| `prettier` | 3.8.3 | 3.8.4 | patch | Faible |
| `express` | 4.22.2 | 5.2.1 | majeur | Moyen — migration Express 5 non prioritaire |
| `dotenv` | 16.6.1 | 17.4.2 | majeur | Faible — API stable |
| `jest` | 29.7.0 | 30.4.2 | majeur | Faible — devDep |
| `eslint` | 9.39.4 | 10.5.0 | majeur | Faible — devDep |

## Scan image Docker — Trivy

Trivy est intégré en CI sur l'image `shoplite-api`. Le build échoue si une vulnérabilité **HIGH** ou **CRITICAL** non corrigée est détectée (`ignore-unfixed: true`).

## Classement des risques

| Risque | Niveau | Mesure en place |
|---|---|---|
| Secret commité dans Git | Critique | `.gitignore`, revue de code obligatoire en PR |
| Vulnérabilité HIGH/CRITICAL dans l'image | Critique | Trivy bloquant en CI |
| Vulnérabilité modérée dans devDeps | Faible | Surveillance `npm audit`, non embarqué en prod |
| Port DB exposé publiquement | Faible | Réseau Docker interne uniquement |
| Dépendances majeures en retard | Moyen | Suivi `npm outdated` en CI, mise à jour planifiée |
| Logs exposant des données sensibles | Critique | Sanitization activée dans le middleware logger |
