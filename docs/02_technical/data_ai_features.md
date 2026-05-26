# 📄 data_ai_features.md

---

## 📡 Collecte de données

### Source principale

* WeLoveDevs (obligatoire)

---

## 🔄 Pipeline de données

1. Trigger manuel admin
2. Appel API (1 req/sec)
3. Nettoyage des données
4. Normalisation
5. Stockage

---

## 🧹 Normalisation

Chaque offre devient :

* titre
* description
* entreprise
* localisation
* type de contrat
* date
* salaire (si dispo)

👉 Objectif : rendre toutes les offres comparables

---

## 📊 Feature Data

### 🎯 Objectif

Aider l’utilisateur à comprendre le marché rapidement

---

### 💡 Choix retenu

Dashboard avec :

* répartition contrats
* remote vs onsite
* salaires
* volume d’offres

---

### ✅ Pourquoi c’est pertinent

* visible immédiatement
* utile pour décision
* simple à implémenter

---

## 🤖 Feature IA

### 🎯 Objectif

Réduire le bruit

---

### 💡 Choix retenu

Détection de doublons (TF-IDF)

---

### ⚙️ Fonctionnement

* vectorisation du texte
* calcul de similarité
* détection de proximité

---

### ✅ Avantages

* léger
* rapide
* explicable

---

### ⚠️ Limites

* sensible à la qualité texte
* pas parfait

---

## 🚀 Impact utilisateur

* moins d’offres dupliquées
* meilleure lisibilité
* gain de temps