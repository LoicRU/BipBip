# Documentation CI- Job Aggregator


## 1. Présentation générale

Le projet utilise **GitHub Actions** comme système d'intégration continue (CI).

**Objectifs** :
- Détecter les erreurs le plus tôt possible
- Empêcher le code cassé d'atteindre la branche `main`
- Maintenir une qualité de code constante

**Fichier principal** : `.github/workflows/ci.yml`

---

## 2. Stack technique

| Composant | Version | Rôle |
| --------- | ------- | ---- |
| GitHub Actions | Latest | Orchestrateur CI |
| Ubuntu | 22.04 | Runner |
| Node.js | 18 | Runtime |
| Docker Compose | 2.20+ | Orchestration |
| curl | - | Tests HTTP |

---

## 3. Déclenchement du pipeline

| Événement | Branche | Action |
| --------- | ------- | ------ |
| Push | `main` | Exécute tous les checks |
| Pull Request | `main` | Exécute tous les checks |

**Pourquoi ?** : La branche `main` doit rester stable. Les PRs sont vérifiées avant merge.

---

## 4. Structure du pipeline

| Catégorie | Job | Description |
| --------- | --- | ----------- |
| Build | `build-backend` | Vérifie la syntaxe Node.js |
| Build | `build-frontend` | Vérifie le build Vite |
| Build | `build-docker` | Construit les images Docker |
| Lint | `lint-backend` | ESLint sur le backend |
| Lint | `lint-frontend` | console.log, fichiers volumineux |
| Lint | `lint-structure` | Dossiers, .gitignore |
| Test | `test-api-health` | GET /health |
| Test | `test-api-offers` | GET /api/offers |
| Test | `test-normalization` | Normalisation WeLoveDevs |

---

## 5. Build Checks (3 minimum)

| # | Job | Commande | Pourquoi |
| - | --- | -------- | -------- |
| 1 | `build-backend` | `node -c index.js` | Vérifie la syntaxe backend |
| 2 | `build-frontend` | `npx vite build --mode test` | Vérifie le build frontend |
| 3 | `build-docker` | `docker-compose build` | Vérifie les Dockerfiles |

---

## 6. Lint Checks (3 minimum)

| # | Job | Vérification | Bloquant |
| - | --- | ------------ | -------- |
| 1 | `lint-backend` | ESLint (variables, console.log) | Non (warning) |
| 2 | `lint-frontend` | console.log > 5, fichiers > 500KB | Non |
| 3 | `lint-structure` | Dossiers requis, fichiers > 1MB, .gitignore | Oui |

---

## 7. Tests automatisés (3 minimum)

| # | Job | Endpoint/Fonction | Attendu |
| - | --- | ----------------- | -------- |
| 1 | `test-api-health` | `GET /health` | Status 200, `{"status":"ok"}` |
| 2 | `test-api-offers` | `GET /api/offers` | Pas de status 500 |
| 3 | `test-normalization` | `normalizeOffer()` | Nettoyage HTML, champs par défaut |

---

## 8. Détail des tests API

### Test 1 : Health Endpoint

| Vérification | Attendu |
| ------------ | ------- |
| HTTP Status | 200 OK |
| Response body | `{"status":"ok"}` |

**Ce que ça prouve** : Le backend est vivant et la base de données est connectée.

### Test 2 : Offers Endpoint

| Vérification | Attendu |
| ------------ | ------- |
| HTTP Status | Pas 500 (200 ou 404 accepté) |
| Response | JSON valide |

**Ce que ça prouve** : L'endpoint principal est fonctionnel.

---

## 9. Détail du test de normalisation

| Test | Cas | Attendu |
| ---- | --- | -------- |
| 1 | Normalisation complète | Tous champs corrects |
| 2 | Champs manquants | Valeurs par défaut |
| 3 | Nettoyage HTML | Pas de balises `<script>` |

**Ce que ça prouve** : Protection contre les injections XSS.

---

## 10. Exécution locale

```bash
cd backend && node -c index.js
cd frontend && npx vite build --mode test
docker-compose build

cd backend && npx eslint .
cd frontend && grep -r "console\.log" src/

curl http://localhost:8000/health
curl http://localhost:8000/api/offers
node backend/tests/normalization.test.js