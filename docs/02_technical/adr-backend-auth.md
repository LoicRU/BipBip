# 🔐 Backend & Authentication Documentation

## 🎯 Scope

Cette partie couvre :

* Authentification (register / login / me)
* Gestion des rôles (user / admin)
* Sécurisation des routes
* Middleware (validation + erreurs)
* Base API REST propre
* Tests backend minimum requis

---

# 1. 🧠 Product Decision – Authentication & Roles

## Pourquoi

L’application manipule :

* des données utilisateurs
* des actions sensibles (admin, modération)

👉 Il est donc obligatoire de :

* différencier les utilisateurs
* protéger certaines routes
* sécuriser l’accès aux données

## Comment

* Authentification par token (JWT ou session sécurisée)
* 2 rôles minimum :

  * `user` : accès standard
  * `admin` : accès modération / gestion
* Routes protégées via middleware

## Trade-offs

| Choix   | Avantage                   | Inconvénient             |
| ------- | -------------------------- | ------------------------ |
| JWT     | simple, scalable           | gestion expiration/token |
| Session | plus sécurisé côté serveur | moins scalable           |

👉 Choix recommandé : **JWT + refresh token (si temps)**

---

# 2. 🏗️ Architecture Backend

## Structure

```
backend/
 ├── src/
 │   ├── routes/
 │   ├── controllers/
 │   ├── services/
 │   ├── middleware/
 │   ├── models/
 │   ├── utils/
 │   └── config/
```

## Séparation des responsabilités

* **Routes** → définition endpoints
* **Controllers** → logique HTTP
* **Services** → logique métier
* **Middleware** → sécurité / validation
* **Models (Prisma)** → accès DB

---

# 3. 🔑 Authentication API

## Endpoints

### POST `/auth/register`

Créer un utilisateur

**Validation :**

* email valide
* password sécurisé (min length, etc.)

**Response :**

* 201 Created
* 400 Bad Request
* 409 Conflict (email déjà existant)

---

### POST `/auth/login`

Connexion utilisateur

**Flow :**

* vérification email/password
* génération token

**Response :**

* 200 OK + token
* 401 Unauthorized

---

### GET `/auth/me`

Récupérer user connecté

**Protection :**

* middleware auth obligatoire

**Response :**

* 200 OK
* 401 Unauthorized

---

# 4. 🛡️ RBAC (Role-Based Access Control)

## Why

Certaines fonctionnalités doivent être restreintes :

* admin dashboard
* modération offres
* gestion utilisateurs

## How

* Champ `role` dans DB (`USER`, `ADMIN`)
* Middleware `requireRole("ADMIN")`

```js
if (req.user.role !== "ADMIN") {
  return res.status(403).json({ error: "Forbidden" });
}
```

## Trade-offs

* Simple à implémenter
* Suffisant pour MVP
* Peu flexible (pas de rôles avancés)

---

# 5. ⚙️ Middleware

## 5.1 Validation Middleware

## Why

Éviter :

* injections
* données invalides
* crash backend

## How

* Validation centralisée (ex: Zod / Joi)

```js
validate(schema)
```

---

## 5.2 Error Middleware

## Why

* éviter duplication try/catch
* réponse uniforme

## How

```js
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message
  });
});
```

---

## 5.3 Auth Middleware

* Vérifie token
* Injecte `req.user`

---

# 6. 🔒 Security Implementation

## ✔ Secret Management

* `.env`
* jamais hardcodé

## ✔ Protection injection

* ORM Prisma → protège SQL injection
* validation inputs

## ✔ Brute-force mitigation

* rate limiting (ex: express-rate-limit)

## ✔ Token Security

* expiration JWT
* HTTP-only cookies (option)

## ✔ Routes sécurisées

* `/admin/*` → ADMIN only
* `/auth/me` → authenticated only

---

# 7. 🧪 Tests

## Minimum requis (PDF)

> 2 routes API testées

## Implémentation

* test `/auth/register`
* test `/auth/login`

Exemple :

```js
expect(response.status).toBe(201);
```

## Bonus

* test middleware auth
* test accès admin refusé

---

# 8. 📡 API Standards

## Bonnes pratiques respectées

* codes HTTP corrects :

  * 200 OK
  * 201 Created
  * 400 Bad Request
  * 401 Unauthorized
  * 403 Forbidden
  * 500 Internal Error

* format JSON standard :

```json
{
  "data": {},
  "error": null
}
```

---

# 9. 🔗 Intégration avec autres parties

## Avec P3 (Data)

* user peut accéder aux offres
* admin peut modérer

## Avec P1 (Frontend)

* login/register UI
* dashboard protégé

## Avec P5 (DevOps/Sécu)

* partage config `.env`
* sécurisation globale

---

# 10. 📊 Evidence (à fournir dans repo)

À ajouter :

* ✅ code routes (`/auth`)
* ✅ middleware auth / validation / error
* ✅ tests backend
* ✅ schéma Prisma user/role
* ✅ screenshots Postman ou frontend
* ✅ config `.env.example`

---

# 11. 🚀 Possible Improvements

* refresh tokens
* OAuth (Google, GitHub)
* password reset
* audit logs

---

# 12. 📌 Conclusion

Cette partie garantit :

* une API sécurisée
* une gestion des accès claire
* une base solide pour tout le projet

👉 C’est le **cœur sécurisé** de la plateforme.
