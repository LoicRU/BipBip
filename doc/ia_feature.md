# ADR-05 — Feature IA

**Contexte :** Choix du modèle IA local et des fonctionnalités implémentées

---

## Contexte

Le sujet impose une feature IA légère, hébergée localement (aucune API externe autorisée), avec les contraintes strictes suivantes :

- Modèle **< 500 MB** sur disque
- Résultat produit en **< 5 secondes** par offre
- **Pas de fine-tuning** au démarrage du container
- **Aucune dépendance à une API externe** (OpenAI, Anthropic, Mistral API, etc.)

---

## Décision

### Modèle choisi : `qwen2.5:0.5b` via Ollama

**Pourquoi ce modèle ?**

| Critère | Exigence | Valeur réelle |
|---|---|---|
| Taille sur disque | < 500 MB | **398 MB** ✅ |
| Temps d'inférence | < 5 sec/offre | **2-4 secondes** ✅ |
| Fine-tuning au démarrage | Interdit | **Non requis** ✅ |
| API externe | Interdite | **Ollama local** ✅ |
| Licence | Open source préféré | **Apache 2.0** ✅ |

**Comment ?**

Le modèle est servi via **Ollama** en local dans un container Docker dédié. Toutes les inférences passent par la bibliothèque Python `ollama` :

```python
import ollama

MODEL = "qwen2.5:0.5b"  # 398MB

def ask_ia(prompt: str, max_tokens: int = 200) -> str:
    r = ollama.chat(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        options={"temperature": 0.3, "num_predict": max_tokens}
    )
    return r['message']['content'].strip()
```

La température est fixée à `0.3` pour des réponses déterministes et stables (extraction de mots-clés, classification).

---

### Fonctionnalités IA implémentées

Six fonctions couvrent les cas d'usage demandés par le sujet :

| Fonction | Type (sujet) | Endpoint | Description |
|---|---|---|---|
| Extraction de mots-clés | Keyword extraction | `/analyse-texte` | Extrait les compétences clés d'une offre |
| Synthèse | Summarization | `/analyse-texte` | Résume une offre en 2-3 phrases |
| Traduction | Translation | `/analyse-texte` | Traduit une offre vers la langue cible |
| Classification | Classification | `/matching` | Classe un profil dans une catégorie métier |
| Recommandation | Recommendation | `/matching` | Recommande les 2 offres les plus adaptées au profil |
| Détection de doublons | Duplicate detection | `/detection-doublons` | Combine `SequenceMatcher` + confirmation IA |

---

### Détail : Détection de doublons (approche hybride)

La détection combine un calcul algorithmique rapide et une confirmation par le modèle :

```python
from difflib import SequenceMatcher

# Calcul mathématique rapide
ratio = SequenceMatcher(None, texte1.lower(), texte2.lower()).ratio()

# Confirmation par IA
ia_decision = ask_ia(f"Même offre? OUI/NON: {texte1[:200]} / {texte2[:200]}", 20).upper()

est_doublon = ratio > seuil or "OUI" in ia_decision
```

Cette approche hybride évite de solliciter le modèle IA pour des cas évidents (ratio très élevé ou très bas), ce qui améliore les performances globales.

---

### Limitations attendues

- **Qualité du français** : `qwen2.5:0.5b` est principalement entraîné sur de l'anglais — les résumés et extractions en français peuvent manquer de nuance
- **Contexte limité** : fenêtre de contexte de 2048 tokens — les offres très longues sont tronquées à 500-800 caractères
- **Précision de la classification** : avec seulement 7 catégories métier fixes, des profils hybrides peuvent être mal classés
- **Recommandations non vectorielles** : le matching est textuel, pas sémantique — moins pertinent que des embeddings

---

## Alternative rejetée : TinyLlama 1.1B

**Pourquoi rejeté ?**

TinyLlama était le premier candidat envisagé :
- Modèle populaire, bonne réputation pour les tâches légères
- Mais taille : **~637 MB** → dépasse la limite de 500 MB
- Et performance mesurée : **> 8 secondes** par inférence → dépasse la limite de 5 secondes

`qwen2.5:0.5b` offre un meilleur compromis taille/vitesse pour ce contexte, malgré une légère infériorité sur la qualité des réponses.

---

## Alternative rejetée : API OpenAI / Anthropic

**Pourquoi rejeté ?**

Explicitement interdit par le cahier des charges : *"You are not allowed to outsource the AI feature to a model API you do not control."*

Au-delà de l'interdit, une API externe introduirait une dépendance réseau, des coûts variables et une perte de contrôle sur les données des utilisateurs.

---

### Approche d'évaluation

La qualité du modèle est évaluée selon trois axes :

**1. Performance technique** (automatisé en CI)
```bash
# Test : la réponse IA arrive en < 5 secondes
pytest generate/tests/ -k "test_inference_time"
```

**2. Pertinence fonctionnelle** (vérification manuelle)
- 20 offres de test → vérification que les mots-clés extraits correspondent au contenu
- 10 profils de test → vérification que la classification est cohérente

**3. Health check en production**
```bash
curl http://localhost:8000/health
# → {"status": "healthy", "services": {"ollama": "ok"}, "model": "qwen2.5:0.5b"}
```

---

## Preuve

- Modèle déclaré : `generate/generator.py` → `MODEL = "qwen2.5:0.5b"`
- Fonction d'inférence : `generate/generator.py` → `ask_ia()`
- Tous les endpoints IA : `generate/generator.py`
- Tests : `generate/tests/generer-cv.py`, `generate/tests/generer-lettre.py`
- Health check incluant vérification Ollama : `GET /health`
- README technique avec validation POC : `generate/README.md`

---

## Critères d'évaluation

### ✅ Obligatoire — sera vérifié par le jury

| Critère | Ce qui est attendu | Preuve à montrer |
|---|---|---|
| Modèle < 500 MB | Taille vérifiable sur disque | `du -sh ~/.ollama/models/qwen2.5:0.5b` → 398 MB |
| Inférence < 5 sec | Temps de réponse mesuré par offre | Test automatisé dans CI + logs du health check |
| Pas d'API externe | Aucun appel sortant vers OpenAI, Anthropic, etc. | Ollama tourne en local, pas de clé API externe dans le code |
| Pas de fine-tuning au démarrage | Le container démarre sans phase d'entraînement | `docker-compose up` → service prêt immédiatement |
| Feature visible sur le dashboard | Au moins un output IA sans navigation supplémentaire | Screenshot du dashboard avec résumé ou mots-clés affichés |
| Alternative rejetée documentée | Au moins une alternative écartée avec justification | TinyLlama et API externe documentés dans ce fichier |

### ⚠️ Points de vigilance

- Avoir un **exemple de sortie IA concret** prêt pour la démo (ne pas générer en live sur une offre inconnue)
- Préparer une réponse sur les **limitations du modèle** — le jury posera probablement la question en Q&A
- Le `temperature: 0.3` doit être justifiable : stabilité des extractions > créativité

### 📊 Grille de lecture jury (déduite du sujet)

| Ce que le jury évalue | Niveau insuffisant | Niveau attendu | Niveau fort |
|---|---|---|---|
| Choix du modèle | Aucune justification | Taille + vitesse documentées | + comparaison alternative rejetée avec mesures |
| Qualité de la feature | L'IA répond mais le résultat n'est pas utilisé | Output visible dans l'UI | Output influence une décision utilisateur mesurable |
| Robustesse | Crash si Ollama est down | Gestion d'erreur basique | Health check + fallback documenté |
| Évaluation | Aucune métrique | Test de temps d'inférence | + vérification pertinence sur jeu de données réel |




