# Job Aggregator - Assistant IA CV/Lettre

Plateforme d'agrégation d'offres d'emploi avec assistant IA intégré pour générer CV et lettres de motivation.

---

## Objectif

Aider les développeurs à :
- Explorer et comparer les offres d'emploi
- Générer automatiquement un CV personnalisé
- Générer une lettre de motivation adaptée à chaque candidature
- Utiliser des fonctions IA légères (extraction, synthèse, recommandation, etc.)

---

## Pipeline complet
```
Utilisateur → Formulaire → Backend FastAPI → IA (qwen2.5:0.5b) → PDF téléchargeable → ↓
```
---

## AI Choice : qwen2.5:0.5b

**Why this model ?**
- Taille : 398 Mo (< 500 Mo requis)
- Inférence : 2-4 secondes (< 5 secondes requis)
- Modèle open source (Apache 2.0)
- Fonctionne sans fine-tuning

**Why not TinyLlama ?**
- TinyLlama (1.1B) était initialement prévu mais trop lent (>8s)
- Qwen2.5:0.5b offre meilleur compromis taille/performance

**Trade-offs :**
- Moins précis sur le français pur que des modèles plus gros
- Contexte limité à 2048 tokens

---

## Installation

### Prérequis

```bash
# Python 3.10+
python3 --version

# Créer l'environnement virtuel
python3 -m venv venv
source venv/bin/activate  

# Installer les dépendances
pip install fastapi uvicorn weasyprint ollama python-multipart

# Télécharger le modèle IA
ollama pull qwen2.5:0.5b  # 398MB
```
---

## Structure du projet
```
.
├── app.py
├── ia
│   ├── cv_generator.py
│   ├── entretien_generator.py
│   ├── __init__.py
│   └── __pycache__
│       ├── cv_generator.cpython-312.pyc
│       └── __init__.cpython-312.pyc
├── __pycache__
│   └── app.cpython-312.pyc
├── routes
│   ├── company.py
│   └── user.py
└── tests
    ├── generer-cv.py
    └── generer-lettre.py
```
---

### Lancer le serveur
```
cd generate
    uvicorn generator:app --host 0.0.0.0 --port 8000 --reload
```
---

## Routes API
```
Route	Méthode	Description
/extraction-mots-cles	  POST	Extrait les mots-clés d'un texte
/synthese	              POST	Résume un texte
/recommandation	          POST	Recommande des offres
/classification	          POST	Classe un profil par métier
/detection-doublons	      POST	Détecte des textes similaires
/traduction	              POST	Traduit un texte
/generer-cv	              POST	Génère un CV en PDF
/generer-lettre	          POST	Génère une lettre en PDF
/health	                  GET	Vérification santé
```
---

## Test santé
```bash
    curl http://localhost:8000/health
```
---

## Voir le rendu d'un fichier PDF
```bash
xdg-open cv.pdf
```

## Génération CV 
```bash
curl -X POST http://localhost:8000/generer-cv \
  -F "nom=Jean Dupont" \
  -F "email=jean@email.com" \
  -F "tel=0612345678" \
  -F "titre=Développeur Full Stack" \
  -F "competences=React,Node.js,Python" \
  -F "formation=Master Informatique 2019" \
  -F "experiences=Développeur chez TechCorp 2021-2024" \
  --output cv.pdf
```
---
Génération Lettre -> 
```bash
curl -X POST http://localhost:8000/generer-lettre \
  -F "nom=Jean Dupont" \
  -F "email=jean@email.com" \
  -F "tel=0612345678" \
  -F "poste=Lead Développeur" \
  -F "entreprise=TechCorp" \
  -F "competences=React,Node.js,AWS" \
  -F "experiences=5 ans en développement web, Migration cloud, Management d'équipe" \
  --output lettre.pdf
```
---

## Analyse de texte (mots-clés + synthèse + traduction)
```bash
curl -X POST http://localhost:8000/analyse-texte \
  -F "texte=Recherche développeur Full Stack React/Node.js avec 3 ans d'expérience" \
  -F "langue_cible=anglais"
```
---

## Matching (classification + recommandation)

```bash
curl -X POST http://localhost:8000/matching \
  -F "profil=Développeur React avec 5 ans d'expérience et maîtrise de Node.js" \
  -F "offres=Offre1: Dev React Senior - TechCorp, Offre2: Dev Java - Autre, Offre3: Lead Tech - Startup"
```
---

## Détection de doublons
```bash
curl -X POST http://localhost:8000/detection-doublons \
  -F "texte1=Recherche développeur React H/F" \
  -F "texte2=CDI Développeur React"
```
---

## Génération questions entretien (Mode entreprise)
```bash
curl -X POST http://localhost:8000/company/generer-questions \
  -F "titre=Développeur Full Stack" \
  -F "description=Nous recherchons un développeur React/Node.js pour rejoindre notre équipe" \
  -F "competences=React,Node.js,TypeScript"
```
---

## Validation POC
```
Critère	Statut	Valeur
Modèle < 500 Mo	✅	398 Mo
Inférence < 5s	✅	2-4 secondes
Pas d'API externe	✅	Ollama local
Pas de fine-tuning	✅	Modèle chargé tel quel
Feature Data	✅	3 endpoints stats
Feature IA	✅	6 fonctions IA
Dashboard visible	✅	Routes API
```
---

## Contraintes respectées
```
Exigence	Solution
Modèle < 500 Mo	qwen2.5:0.5b (398 Mo)
Réponse < 5 secondes	Inférence locale optimisée
Pas d'API externe	Ollama en local
Pas de fine-tuning	Modèle prêt à l'emploi
```
---

## Architecture CHATBOT
```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React/Vue/HTML)               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend FastAPI (generator.py)            │
│  • Routes IA (extraction, synthèse, recommandation...)      │
│  • Routes CV/Lettre                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   IA Locale (qwen2.5:0.5b)                  │
│                   via Ollama                                │
└─────────────────────────────────────────────────────────────┘
```
---

## Architecture détaillée
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PIPELINE COMPLET                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌────────────┐ │
│  │  UTILISATEUR │ -> │  FORMULAIRE  │ -> │  generator   │ -> │    PDF     │ │
│  │  (remplit)   │    │  (frontend)  │    │   .py        │    │(télécharge)│ │
│  └──────────────┘    └──────────────┘    └──────────────┘    └────────────┘ │
│                                                    │                        │
│                                                    ▼                        │
│                                         ┌──────────────────┐               │
│                                         │ 6 fonctions IA   │                  │
│                                         │ (obligatoires)   │                  │
│                                         └──────────────────┘               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```
---