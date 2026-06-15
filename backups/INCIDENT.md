# Tag v1.1.0 cassé :
```
mtti  …/TP-Devops   feature/rollback   ♥ 23:43  curl http://localhost:8080/api/products
<html>
<head><title>502 Bad Gateway</title></head>
<body>
<center><h1>502 Bad Gateway</h1></center>
<hr><center>nginx/1.27.5</center>
</body>
</html>

mtti  …/TP-Devops   feature/rollback   ♥ 23:43  docker compose logs --tail=50 api
shoplite_api  | {"level":"info","message":"ShopLite API started","port":3000,"timestamp":"2026-06-15T21:43:19.064Z"}
shoplite_api  | {"level":"INFO","message":"incoming request","request_id":"0b8e154c-6a06-4faa-9119-3019a14515a1","method":"GET","path":"/ready","headers":{"host":"127.0.0.1:3000","user-agent":"Wget","accept":"*/*","connection":"close"},"timestamp":"2026-06-15T21:43:23.979Z"}
shoplite_api  | {"level":"info","message":"request completed","request_id":"0b8e154c-6a06-4faa-9119-3019a14515a1","method":"GET","path":"/ready","status":200,"duration_ms":25,"timestamp":"2026-06-15T21:43:24.004Z"}
shoplite_api  | {"level":"INFO","message":"incoming request","request_id":"fa51688d-fc88-4074-9583-87198934b05e","method":"GET","path":"/products","headers":{"host":"localhost","x-forwarded-for":"172.18.0.1","x-request-id":"ff2c3cf60ad40d5209d4eee41a6fce63","connection":"close","user-agent":"curl/8.18.0","accept":"*/*"},"timestamp":"2026-06-15T21:43:33.920Z"}
shoplite_api  | /app/src/routes/products.js:7
shoplite_api  |   throw new Error("Incident v1.1.0");
shoplite_api  |         ^
shoplite_api  |
shoplite_api  | Error: Incident v1.1.0
shoplite_api  |     at /app/src/routes/products.js:7:9
shoplite_api  |     at Layer.handle [as handle_request] (/app/node_modules/express/lib/router/layer.js:95:5)
shoplite_api  |     at next (/app/node_modules/express/lib/router/route.js:149:13)
shoplite_api  |     at Route.dispatch (/app/node_modules/express/lib/router/route.js:119:3)
shoplite_api  |     at Layer.handle [as handle_request] (/app/node_modules/express/lib/router/layer.js:95:5)
shoplite_api  |     at /app/node_modules/express/lib/router/index.js:284:15
shoplite_api  |     at Function.process_params (/app/node_modules/express/lib/router/index.js:346:12)
shoplite_api  |     at next (/app/node_modules/express/lib/router/index.js:280:10)
shoplite_api  |     at Function.handle (/app/node_modules/express/lib/router/index.js:175:3)
shoplite_api  |     at router (/app/node_modules/express/lib/router/index.js:47:12)
shoplite_api  |
shoplite_api  | Node.js v20.20.2
shoplite_api  | {"level":"info","message":"ShopLite API started","port":3000,"timestamp":"2026-06-15T21:43:34.424Z"}
shoplite_api  | {"level":"INFO","message":"incoming request","request_id":"aa19b947-a002-4397-9998-3cdcebb83951","method":"GET","path":"/ready","headers":{"host":"127.0.0.1:3000","user-agent":"Wget","accept":"*/*","connection":"close"},"timestamp":"2026-06-15T21:43:39.337Z"}
shoplite_api  | {"level":"info","message":"request completed","request_id":"aa19b947-a002-4397-9998-3cdcebb83951","method":"GET","path":"/ready","status":200,"duration_ms":25,"timestamp":"2026-06-15T21:43:39.362Z"}
```

# La modif en question
```
diff --git a/api/src/routes/products.js b/api/src/routes/products.js
index 048c78a..1e9434f 100644
--- a/api/src/routes/products.js
+++ b/api/src/routes/products.js
@@ -4,6 +4,7 @@ const db = require("../db");
const router = express.Router();

router.get("/", async (req, res, next) => {
+  throw new Error("Incident v1.1.0");
   try {
   const result = await db.query(
   "SELECT id, name, description, price_cents FROM products ORDER BY id",
```




# Exécution du script rollback pour revenir sur v1.0.0
```
mtti  …/TP-Devops   feature/rollback   ♥ 23:49  ./scripts/rollback.sh v1.0.0
[rollback] Version actuellement déployée :
image=tp-devops-api sha=sha256:06c357495bdf25fa58c25de03def57c4369a16c1b391baa173ae16970080ce50
[rollback] Vérification du tag v1.0.0...
remote: Enumerating objects: 3, done.
remote: Counting objects: 100% (1/1), done.
remote: Total 3 (delta 0), reused 0 (delta 0), pack-reused 2 (from 1)
Dépaquetage des objets: 100% (3/3), 2.71 KiO | 2.71 MiO/s, fait.
Depuis github.com:M-TTI/TP-Devops
b9b4818..3889d6f  develop    -> origin/develop
[rollback] Tag v1.0.0 trouvé
[rollback] Export des logs API...
/app/src/routes/products.js:7
throw new Error("Incident v1.1.0");
^

Error: Incident v1.1.0
at /app/src/routes/products.js:7:9
at Layer.handle [as handle_request] (/app/node_modules/express/lib/router/layer.js:95:5)
at next (/app/node_modules/express/lib/router/route.js:149:13)
at Route.dispatch (/app/node_modules/express/lib/router/route.js:119:3)
at Layer.handle [as handle_request] (/app/node_modules/express/lib/router/layer.js:95:5)
at /app/node_modules/express/lib/router/index.js:284:15
at Function.process_params (/app/node_modules/express/lib/router/index.js:346:12)
at next (/app/node_modules/express/lib/router/index.js:280:10)
at Function.handle (/app/node_modules/express/lib/router/index.js:175:3)
at router (/app/node_modules/express/lib/router/index.js:47:12)

Node.js v20.20.2
[rollback] Arrêt des services (volumes préservés)...
[+] down 5/5
✔ Container shoplite_proxy       Removed                                                                                                                                                                                       0.3s
✔ Container shoplite_api         Removed                                                                                                                                                                                      10.2s
✔ Container shoplite_frontend    Removed                                                                                                                                                                                       0.2s
✔ Container shoplite_db          Removed                                                                                                                                                                                       0.2s
✔ Network tp-devops_shoplite_net Removed                                                                                                                                                                                       0.1s
[rollback] Checkout vers v1.0.0...
M       scripts/rollback.sh
Note : basculement sur 'v1.0.0'.

Vous êtes dans l'état « HEAD détachée ». Vous pouvez visiter, faire des modifications
expérimentales et les valider. Il vous suffit de faire un autre basculement pour
abandonner les commits que vous faites dans cet état sans impacter les autres branches

Si vous voulez créer une nouvelle branche pour conserver les commits que vous créez,
il vous suffit d'utiliser l'option -c de la commande switch comme ceci :

git switch -c <nom-de-la-nouvelle-branche>

Ou annuler cette opération avec :

git switch -

Désactivez ce conseil en renseignant la variable de configuration advice.detachedHead à false

HEAD est maintenant sur 71203ff fix(docker): fixed health check pointing on 127.0.0.1 instead of localhost
[rollback] Rebuild et redémarrage avec v1.0.0...
[+] Building 1.0s (23/23) FINISHED                                                                                                                                                                                                  
=> [internal] load local bake definitions                                                                                                                                                                                     0.0s
=> => reading from stdin 943B                                                                                                                                                                                                 0.0s
=> [frontend internal] load build definition from Dockerfile                                                                                                                                                                  0.0s
=> => transferring dockerfile: 306B                                                                                                                                                                                           0.0s
=> [api internal] load build definition from Dockerfile                                                                                                                                                                       0.0s
=> => transferring dockerfile: 638B                                                                                                                                                                                           0.0s
=> [api internal] load metadata for docker.io/library/node:20-alpine                                                                                                                                                          0.6s
=> [frontend internal] load metadata for docker.io/library/nginx:1.27-alpine                                                                                                                                                  0.0s
=> [frontend internal] load .dockerignore                                                                                                                                                                                     0.0s
=> => transferring context: 114B                                                                                                                                                                                              0.0s
=> [frontend 1/3] FROM docker.io/library/nginx:1.27-alpine@sha256:65645c7bb6a0661892a8b03b89d0743208a18dd2f3f17a54ef4b76fb8e2f2a10                                                                                            0.1s
=> => resolve docker.io/library/nginx:1.27-alpine@sha256:65645c7bb6a0661892a8b03b89d0743208a18dd2f3f17a54ef4b76fb8e2f2a10                                                                                                     0.0s
=> [frontend internal] load build context                                                                                                                                                                                     0.0s
=> => transferring context: 447B                                                                                                                                                                                              0.0s
=> CACHED [frontend 2/3] COPY nginx.conf /etc/nginx/conf.d/default.conf                                                                                                                                                       0.0s
=> CACHED [frontend 3/3] COPY src /usr/share/nginx/html                                                                                                                                                                       0.0s
=> [frontend] exporting to image                                                                                                                                                                                              0.1s
=> => exporting layers                                                                                                                                                                                                        0.0s
=> => exporting manifest sha256:5c7b1d7cdceb085e0e05ccd27efc17e7f027bdd24259afb28f928e488ea896a4                                                                                                                              0.0s
=> => exporting config sha256:135edfa5d7a702b86259897a4efff95f4c706bbb17838fc9867c9511df75cbbc                                                                                                                                0.0s
=> => exporting attestation manifest sha256:885a94ce5a90127e93c0ea959bfdcf3c9cfa6b5cc718171d517a38974d0cbc7a                                                                                                                  0.0s
=> => exporting manifest list sha256:4416ab26ceadd0a6dab1e2e41e264e8a8df951b767e7db794a9c44edef1692a0                                                                                                                         0.0s
=> => naming to docker.io/library/tp-devops-frontend:latest                                                                                                                                                                   0.0s
=> => unpacking to docker.io/library/tp-devops-frontend:latest                                                                                                                                                                0.0s
=> [frontend] resolving provenance for metadata file                                                                                                                                                                          0.0s
=> [api internal] load .dockerignore                                                                                                                                                                                          0.0s
=> => transferring context: 162B                                                                                                                                                                                              0.0s
=> [api deps 1/4] FROM docker.io/library/node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293                                                                                               0.1s
=> => resolve docker.io/library/node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293                                                                                                        0.0s
=> [api internal] load build context                                                                                                                                                                                          0.0s
=> => transferring context: 2.00kB                                                                                                                                                                                            0.0s
=> CACHED [api deps 2/4] WORKDIR /app                                                                                                                                                                                         0.0s
=> CACHED [api runner 3/5] RUN apk --no-cache upgrade     && rm -rf /usr/local/lib/node_modules/npm     && rm -f /usr/local/bin/npm /usr/local/bin/npx                                                                        0.0s
=> CACHED [api deps 3/4] COPY package*.json ./                                                                                                                                                                                0.0s
=> CACHED [api deps 4/4] RUN npm ci --omit=dev                                                                                                                                                                                0.0s
=> CACHED [api runner 4/5] COPY --from=deps /app/node_modules ./node_modules                                                                                                                                                  0.0s
=> CACHED [api runner 5/5] COPY src ./src                                                                                                                                                                                     0.0s
=> [api] exporting to image                                                                                                                                                                                                   0.1s
=> => exporting layers                                                                                                                                                                                                        0.0s
=> => exporting manifest sha256:52670d93e4d0a5c2ea8c81d925b38277247b9ec3b793efb77948f8f584bb50dc                                                                                                                              0.0s
=> => exporting config sha256:e348a78d8be7d31f56871d75729d34a56033d8c35168c427901600fc86159aee                                                                                                                                0.0s
=> => exporting attestation manifest sha256:a10268ba8b71306c71f5dd03ddcaa978bd4d136d134fc26f6cf223dd5aeb8a45                                                                                                                  0.0s
=> => exporting manifest list sha256:704f4bab62abd2a270f82f0c6aad3deb14f8985f508dbd4fbd2706ff89c1e26f                                                                                                                         0.0s
=> => naming to docker.io/library/tp-devops-api:latest                                                                                                                                                                        0.0s
=> => unpacking to docker.io/library/tp-devops-api:latest                                                                                                                                                                     0.0s
=> [api] resolving provenance for metadata file                                                                                                                                                                               0.0s
[+] up 7/7                                                                                                                                                                                                                          
✔ Image tp-devops-frontend       Built                                                                                                                                                                                         1.1s
✔ Image tp-devops-api            Built                                                                                                                                                                                         1.1s
✔ Network tp-devops_shoplite_net Created                                                                                                                                                                                       0.1s
✔ Container shoplite_frontend    Started                                                                                                                                                                                       0.5s
✔ Container shoplite_db          Healthy                                                                                                                                                                                      11.0s
✔ Container shoplite_api         Healthy                                                                                                                                                                                      16.5s
✔ Container shoplite_proxy       Started                                                                                                                                                                                      16.6s
[rollback] Attente du démarrage des services (20s)...
[rollback] Smoke tests...
[smoke] Tests against http://localhost:8080

[smoke] GET /api/health                ... OK
[smoke] GET /api/ready                 ... OK
[smoke] GET /api/products              ... OK

[smoke] Résultat : 3 OK, 0 FAIL
[smoke] Tous les tests sont passés

[rollback] Rollback vers v1.0.0 terminé.
[rollback] Vérifier que les données PostgreSQL sont intactes :
curl http://localhost:8080/api/products
```