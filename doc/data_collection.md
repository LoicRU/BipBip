# ADR-03 — Collecte de données (Data Collection)
 
**Contexte :** Pipeline d'ingestion des offres d'emploi depuis des sources externes

---

## Contexte

La plateforme doit collecter des offres d'emploi réelles depuis des sources externes, les normaliser et les stocker. WeLoveDevs est une source **obligatoire** selon le cahier des charges. La contrainte principale est une rate limit de **1 requête/seconde/étudiant**.

---

## Décision

### Source principale : WeLoveDevs API

**Pourquoi ?**
- Source imposée par le sujet Epitech — intégration non négociable
- Données réelles du marché tech français (pas de données synthétiques)
- API documentée OpenAPI 3.0, fiable et stable
- Accès garanti via clé API @epitech.eu

**Comment ?**

Le pipeline d'ingestion fonctionne en 3 étapes :

```
WeLoveDevs API → Normalisation → Stockage en base
```

1. **Collecte** : appel à `https://epi-api.welovedevs.com/` avec throttling via une queue de 1 req/sec
2. **Normalisation** : chaque offre est transformée vers le schéma commun (titre, description, entreprise, lieu, date, salaire)
3. **Stockage** : insertion en base avec déduplication (voir ADR-05)

**Gestion de la rate limit (1 req/sec/étudiant) :**

```python
import time

def fetch_with_throttle(endpoint, api_key):
    time.sleep(1)  # respect rate limit
    response = requests.get(endpoint, headers={"Authorization": api_key})
    return response.json()
```

Le trigger manuel est exposé via une route d'administration sécurisée (rôle `admin` requis).

**Trade-off :**
- On dépend d'une source externe unique obligatoire — pas de redondance si l'API est down
- Le throttling ralentit l'ingestion sur de gros volumes (ex : 100 offres = ~100 secondes minimum)
- Aucune flexibilité sur le format source : on s'adapte au schéma WeLoveDevs

---

## Alternative rejetée : scraping web (LinkedIn, Indeed)

**Pourquoi rejeté ?**
- Légalement risqué (CGU des plateformes)
- Instable (structure HTML qui change)
- Pas de garantie de données structurées (salaire, contrat)
- Maintenance élevée vs. une API documentée

---

## Champs normalisés stockés

Chaque offre ingérée est normalisée vers ce schéma minimal :

| Champ | Obligatoire | Source WeLoveDevs |
|---|---|---|
| `title` | ✅ | `title` |
| `description` | ✅ | `description` |
| `company` | ✅ | `company.name` |
| `location` | ✅ | `location` |
| `date` | ✅ | `publishedAt` |
| `contract_type` | ✅ | `contractType` |
| `salary` | Non (si disponible) | `salary` |

---

## Preuve

- Code d'ingestion : `generate/generator.py` (pipeline de normalisation)
- Test unitaire de normalisation : `generate/tests/` (couvert par CI)
<!-- - Route admin de trigger manuel : `POST /admin/ingest` (protégée par rôle `admin`) -->