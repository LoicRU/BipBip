# Analyse des Menaces - Job Aggregator


## 1. Périmètre de l'analyse

### Composants concernés

| Composant | Description | Périmètre sécurité |
|-----------|-------------|-------------------|
| **Frontend** | React/Vite (port 3000) | XSS, CSRF, expositions |
| **Backend API** | Node.js/Express (port 8000) | Auth, rate limiting, injections |
| **Base de données** | PostgreSQL (port 5432) | Injections SQL, accès non autorisés |
| **Réseau** | Communication inter-services | Interception (MITM) |
| **CI/CD** | GitHub Actions | Secrets exposés, pipeline compromis |

### Hors périmètre (pour ce projet)

- Attaques physiques sur les serveurs
- Attaques réseau avancées (DDoS volumétrique)
- Social engineering

---

## 2. Acteurs et rôles

| Acteur | Rôle | Privilèges |
|--------|------|-----------|
| **Utilisateur non authentifié** | Visiteur non connecté | Lecture des offres publiques |
| **Utilisateur authentifié (user)** | Candidat recherchant un emploi | Lecture, favoris, dashboard |
| **Administrateur (admin)** | Modérateur des offres | Lecture, écriture, suppression, gestion users |
| **Attaquant externe** | Hacker cherchant à exploiter des failles | Aucun (par défaut) |

---

## 3. Identification des menaces (STRIDE)

STRIDE = **S**poofing, **T**ampering, **R**epudiation, **I**nformation disclosure, **D**oS, **E**levation of privilege

### 3.1 Spoofing (Usurpation d'identité)

| Menace | Où ? | Sévérité |
|--------|------|----------|
| Un attaquant utilise un token JWT volé | Backend | Haute |
| Un attaquant se fait passer pour l'API WeLoveDevs | Ingestion | Moyenne |
| Un attaquant forge un cookie de session | Backend | Haute |

### 3.2 Tampering (Altération des données)

| Menace | Où ? | Sévérité |
|--------|------|----------|
| Injection SQL pour modifier/supprimer des offres | DB | Critique |
| Modification des données en transit (MITM) | Réseau | Haute |
| Un utilisateur modifie les offres d'un autre | API | Haute |

### 3.3 Repudiation (Non-répudiation)

| Menace | Où ? | Sévérité |
|--------|------|----------|
| Un admin modère une offre sans trace | Backend | Moyenne |
| Absence de logs des actions critiques | Backend | Moyenne |

### 3.4 Information Disclosure (Fuite d'information)

| Menace | Où ? | Sévérité |
|--------|------|----------|
| Mot de passe stocké en clair | DB | Critique |
| Clé API WeLoveDevs exposée dans le code | Repo GitHub | Critique |
| Stack trace exposée à l'utilisateur | Backend | Moyenne |
| Données sensibles dans les logs | Backend | Moyenne |

### 3.5 Denial of Service (Déni de service)

| Menace | Où ? | Sévérité |
|--------|------|----------|
| Brute force sur /login (millions de requêtes) | Backend | Haute |
| Scraping agressif de l'API | Backend | Moyenne |
| Requête SQL sans limite qui surcharge la DB | Backend | Haute |

### 3.6 Elevation of Privilege (Élévation de privilèges)

| Menace | Où ? | Sévérité |
|--------|------|----------|
| Un user accède à une route admin | Backend | Critique |
| Un user modifie son rôle dans le token JWT | Backend | Critique |
| Un user accède aux offres d'un autre user | API | Haute |

---

## 4. Menaces prioritaires

### Top 5 des menaces à traiter ABSOLUMENT

| # | Menace | Impact | Probabilité | Priorité |
|---|--------|--------|-------------|----------|
| 1 | Injection SQL | Critique | Élevée | **P0** |
| 2 | Mots de passe en clair | Critique | Élevée | **P0** |
| 3 | Élévation de privilèges (user → admin) | Critique | Moyenne | **P0** |
| 4 | Brute force sur login | Haute | Élevée | **P1** |
| 5 | Fuite clé API WeLoveDevs | Critique | Faible | **P1** |

### Menaces secondaires (à traiter si possible)

| # | Menace | Impact | Priorité |
|---|--------|--------|----------|
| 6 | XSS (Cross-Site Scripting) | Moyenne | P2 |
| 7 | MITM (attaque réseau) | Haute | P2 |
| 8 | Absence de logs | Faible | P3 |

---

## 5. Contrôles de sécurité prévus

### 5.1 Contrôles techniques (code)

| Menace ciblée | Contrôle | Où ? | Qui implémente |
|---------------|----------|------|----------------|
| Injection SQL | Requêtes paramétrées (`$1, $2`) | Backend | Dev 3 |
| Mots de passe clairs | bcrypt (hash + salt, 10 rounds) | Backend | Dev 2 |
| Élévation privilèges | JWT + middleware `adminMiddleware` | Backend | Dev 2 + Dev 5 |
| Brute force | `express-rate-limit` (5 tentatives/15min) | Backend | Dev 5 |
| Fuite secrets | `.env` + `.gitignore` | Global | Dev 5 |
| XSS | Échappement HTML sur inputs utilisateur | Backend | Dev 2 |
| MITM | HTTPS en prod + documentation | Infra | Dev 5 |
| Exposition erreurs | Middleware erreur centralisé (pas de stack trace) | Backend | Dev 2 |

### 5.2 Contrôles organisationnels (process)

| Contrôle | Description | Responsable |
|----------|-------------|-------------|
| Revue de code obligatoire (PR) | Chaque PR relue par au moins 1 membre | Tous |
| Protection branche `main` | PR obligatoire + checks CI | Dev 5 |
| Secrets scannés | GitHub Actions détecte les commits de secrets | Dev 5 |
| Tests sécurité | Tests d'intégration sur auth et SQL | Dev 5 + Dev 2 |

---

## 6. Matrice risque / impact

### Niveaux
- **Critique** : Arrêt total, perte de données, compromission totale
- **Haute** : Impact majeur sur la confidentialité/intégrité
- **Moyenne** : Impact limité, contournement possible
- **Faible** : Impact mineur

### Matrice

| Probabilité \ Impact | Faible | Moyenne | Haute | Critique |
|---------------------|--------|---------|-------|----------|
| **Très élevée** | - | - | Brute force | - |
| **Élevée** | - | XSS | - | Injection SQL, MDP clair |
| **Moyenne** | - | - | - | Élévation privilèges |
| **Faible** | Absence logs | - | MITM | Fuite clé API |

### Seuil d'acceptabilité
- **Rouge (Critique)** : Doit être traité avant mise en production → **Tous traités**
- **Orange (Haute)** : Doit être traité si possible → **Tous traités**
- **Jaune (Moyenne)** : Acceptable avec documentation → **Documentés**
- **Verte (Faible)** : Acceptable → **Documentés**

---

## 7. Plan de validation

### Tests à exécuter (avant rendu)

| Test | Description | Méthode | Attend |
|------|-------------|---------|--------|
| **T1 - Injection SQL** | Tenter `'; DROP TABLE offers; --` dans les champs | Requête manuelle | Pas d'exécution |
| **T2 - Brute force** | 6 tentatives de login fausses | Script ou manuel | Blocage après 5 |
| **T3 - Élévation privilèges** | User tente d'accéder à `/admin` | Token user modifié | 403 Forbidden |
| **T4 - MDP en clair** | Vérifier table `users` | `SELECT * FROM users` | Champ `password_hash` uniquement |
| **T5 - XSS** | Injecter `<script>alert(1)</script>` | Formulaire recherche | Affiché comme texte, non exécuté |
| **T6 - Secrets exposés** | Scanner le repo | `git grep` + GitHub | Aucun secret |
| **T7 - Rate limiting** | 60 requêtes en 1 minute sur `/api/offers` | Script | Blocage temporaire |

