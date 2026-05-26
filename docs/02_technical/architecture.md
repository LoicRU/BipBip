# 📄 architecture.md

---

## 🏗️ Architecture globale

Le système repose sur 3 services :

* frontend
* backend
* database

---

## ⚙️ Backend

Responsabilités :

* API REST
* auth
* ingestion
* logique métier

---

## 🖥️ Frontend

Responsabilités :

* affichage
* interactions
* UX

---

## 🗄️ Base de données

Choix : PostgreSQL

---

## 📦 Modèle principal

### Users

* email
* password
* role

---

### Offers

* source
* title
* description
* company
* location
* salary

---

### Ingestion

* status
* stats

---

## 🔄 Flux global

API → traitement → DB → API → frontend

---

## ⚖️ Trade-offs

* simple > scalable au début
* monolithique backend > microservices