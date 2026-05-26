# ADR-04 — Feature Data
  
**Contexte :** Fonctionnalité orientée données pour améliorer l'exploration et la prise de décision

---

## Contexte

Le sujet impose une **feature data** qui améliore concrètement l'exploration des offres ou la prise de décision de l'utilisateur. Elle doit être visible sur le dashboard sans navigation supplémentaire.

---

## Décision

### Feature choisie : Analyse de texte d'offre (extraction + synthèse + matching)

La feature data regroupe trois capacités complémentaires exposées via l'endpoint `/analyse-texte` et le système de matching `/matching`.

---

### Problème utilisateur adressé

Un développeur qui cherche un emploi est confronté à des offres longues, rédigées dans des langues différentes, avec des formats hétérogènes. Il lui est difficile de :
- Identifier rapidement les compétences requises
- Comparer des offres entre elles
- Filtrer les offres qui correspondent à son profil

---

### Hypothèse de feature

> "Si on extrait automatiquement les mots-clés et qu'on résume chaque offre, l'utilisateur prend sa décision de candidature plus vite et avec plus de confiance."

---

### Pourquoi cette approche est pertinente

Les trois briques data s'appuient sur des traitements légers et directs :

**1. Extraction de mots-clés**

```python
prompt_mots = f"""Extrais les mots-clés importants de ce texte. 
Retourne uniquement une liste séparée par des virgules.
Texte: {texte_echappe[:500]}"""
```

Permet d'afficher en un coup d'œil les compétences requises sur la fiche offre.

**2. Synthèse automatique**

```python
prompt_synthese = f"Résume ce texte en 2-3 phrases maximum.\nTexte: {texte_echappe[:800]}"
```

Réduit une offre de 800 mots à 2-3 phrases lisibles sur le dashboard.

**3. Scoring de pertinence / Matching profil → offres**

```python
prompt_rec = f"""Analyse ce profil et ces offres. Recommande les 2 offres les plus adaptées.
Profil: {profil_echappe[:500]}
Offres: {offres_echappees[:500]}"""
```

Classe les offres par adéquation avec le profil de l'utilisateur.

---

### Comment le succès est mesuré

| Métrique | Cible | Méthode de mesure |
|---|---|---|
| Temps de lecture d'une offre | Réduit de >50% | Comparaison résumé vs. description brute (longueur) |
| Pertinence des mots-clés extraits | Cohérents avec le contenu | Vérification manuelle sur 20 offres de test |
| Temps de réponse | < 5 secondes | Mesuré dans les tests `generate/tests/` |
| Couverture des offres | 100% des offres ingérées | Vérifié via le health check `/health` |

---

### Trade-off

- La qualité des extractions dépend de `qwen2.5:0.5b` — un modèle plus grand donnerait de meilleurs résumés
- Le matching est textuel (pas vectoriel) — moins précis qu'un système d'embeddings
- Les résultats en français peuvent être moins fidèles qu'en anglais (limitation du modèle)

---

### Composant dashboard visible

Conformément au cahier des charges, le dashboard affiche sans navigation supplémentaire :
- Les **mots-clés extraits** pour chaque offre (badges visuels)
- Le **résumé IA** en 2-3 phrases sous le titre
- Le **score de matching** si l'utilisateur a renseigné son profil

---

## Preuve

- Endpoint `/analyse-texte` : `generate/generator.py` lignes `analyse_texte()`
- Endpoint `/matching` : `generate/generator.py` lignes `matching()`
- Tests : `generate/tests/generer-cv.py`, `generate/tests/generer-lettre.py`
- Dashboard : résultats visibles directement sur la fiche offre (composant React/Vue frontend)