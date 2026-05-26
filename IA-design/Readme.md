# 💼 Job Aggregator

Une application de visualisation et d'analyse d'offres d'emploi construite avec **Streamlit** et **Plotly**.

## Aperçu

Job Aggregator est un tableau de bord interactif qui permet de filtrer, explorer et analyser des offres d'emploi selon différents critères (contrat, lieu, salaire, télétravail). Les données sont actuellement simulées et peuvent être remplacées par une vraie source (API, base de données, scraping, etc.).

## Fonctionnalités

- **Filtres dynamiques** — type de contrat, localisation, salaire minimum, télétravail uniquement
- **KPIs en temps réel** — nombre d'offres, salaire moyen, taux de télétravail, nombre d'entreprises
- **Visualisations interactives**
  - Répartition des contrats (camembert)
  - Salaire moyen par type de contrat (barres)
  - Salaire moyen par localisation (carte thermique)
  - Top compétences les plus demandées (barres horizontales)
- **Liste paginée des offres** avec colonnes configurées

## Stack technique

| Librairie | Usage |
|-----------|-------|
| `streamlit` | Interface web interactive |
| `pandas` | Manipulation des données |
| `numpy` | Génération de données simulées |
| `plotly` | Graphiques interactifs |

## Installation

```bash
# Cloner le dépôt
git clone git@github.com:EpitechBachelorPromo2028/B-YEP-200-MAR-2-1-jobaggregator-1.git

# Créer un environnement virtuel (recommandé)
python -m venv venv
source venv/bin/activate  # Windows : venv\Scripts\activate

# Installer les dépendances
pip install streamlit pandas numpy plotly
```

## Lancement

```bash
streamlit run job_dashboard.py
```

L'application s'ouvre automatiquement sur `http://localhost:8501`.

## Structure du projet

```
IA-design/
├── job_dashboard.py         # Application principale
├── pipeline.md
├── poc.md
└── README.md
```

## Intégrer vos propres données

La fonction `load_data()` génère actuellement des données aléatoires. Pour brancher une vraie source, remplacez son contenu :

```python
@st.cache_data
def load_data():
    # Exemple avec un fichier CSV
    return pd.read_csv("offres.csv")

    # Exemple avec une API
    # response = requests.get("https://api.example.com/jobs")
    # return pd.DataFrame(response.json())
```

Le DataFrame doit contenir les colonnes suivantes :

| Colonne | Type | Description |
|---------|------|-------------|
| `titre` | `str` | Intitulé du poste |
| `entreprise` | `str` | Nom de l'entreprise |
| `contrat` | `str` | Type de contrat (CDI, Stage, Alternance…) |
| `lieu` | `str` | Ville ou région |
| `salaire` | `int` | Salaire annuel brut en € |
| `remote` | `bool` | Télétravail possible |
| `competences` | `list[str]` | Liste de compétences requises |

## Améliorations possibles

- Connexion à une vraie API d'offres d'emploi autre que WeLoveDev (France Travail, LinkedIn, Indeed…)
- Ajout d'une barre de recherche textuelle
- Export des offres filtrées en CSV
- Système de favoris persistants
<!-- - Déploiement sur Streamlit Cloud -->