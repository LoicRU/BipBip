#!/usr/bin/env python3
import httpx

url = "http://localhost:8000/api/generer-cv"

data = {
    "nom": "Jean Dupont",
    "email": "jean@email.com",
    "tel": "06 12 34 56 78",
    "adresse": "Marseille, France",
    "mobilite": "Mobile en teletravail partiel",
    "titre": "Développeur Full Stack",
    "profil": "Développeur full stack avec une forte appétence produit, habitué à livrer des interfaces fiables et des APIs robustes dans des contextes startup et PME.",
    "competences": "React, TypeScript, Node.js, Python, PostgreSQL, Docker, AWS",
    "competences_detail": """Langages: JavaScript, TypeScript, Python
Web: React, Node.js, Express, HTML, CSS
Data / Infra: PostgreSQL, Docker, AWS""",
    "langues": """Français: Langue maternelle
Anglais: Niveau professionnel""",
    "atouts": "Travail d'equipe, autonomie, sens du detail, communication",
    "interets": "Veille tech, course a pied, photographie",
    "reseaux": """LinkedIn: linkedin.com/in/jeandupont
GitHub: github.com/jeandupont""",
    "formation": """Master Informatique | Aix-Marseille Universite | 2017 - 2019 | Architecture logicielle, genie logiciel

Licence Informatique | Aix-Marseille Universite | 2014 - 2017 | Bases de donnees, algorithmique, web""",
    "experiences": """Developpeur Full Stack | TechCorp | 2021 - 2024 | Migration cloud, optimisation des performances, API metier

Developpeur Web | StartupX | 2019 - 2021 | Interfaces React, APIs REST, integration CI/CD""",
    "projets": """Plateforme RH interne
2024 | React, Node.js, PostgreSQL
- Conception d'un back-office de recrutement
- Mise en place d'un suivi des candidatures
- Deploiement Docker et supervision

Refonte portail client
2023 | React, TypeScript
- Refonte UX et amelioration des performances
- Mise en place d'un design system reutilisable""",
}

try:
    response = httpx.post(url, data=data, timeout=30)
    if response.status_code == 200:
        with open("cv.pdf", "wb") as f:
            f.write(response.content)
        print("✅ CV généré : cv.pdf")
    else:
        print(f"❌ Erreur {response.status_code}")
except Exception as e:
    print(f"❌ Erreur: {e}")
