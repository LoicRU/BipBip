#!/usr/bin/env python3
import httpx

url = "http://localhost:8000/api/generer-lettre"

data = {
    "nom": "Jean Dupont",
    "email": "jean@email.com",
    "tel": "06 12 34 56 78",
    "poste": "Lead Développeur Full Stack",
    "entreprise": "TechCorp",
    "competences": "React, Node.js, AWS, TypeScript",
    "experiences": "5 ans en développement web, Migration cloud, Management d'équipe",
    "extra": "Passionné par les nouvelles technologies"
}

try:
    response = httpx.post(url, data=data, timeout=30)
    if response.status_code == 200:
        with open("lettre.pdf", "wb") as f:
            f.write(response.content)
        print("✅ Lettre générée : lettre.pdf")
    else:
        print(f"❌ Erreur {response.status_code}")
except Exception as e:
    print(f"❌ Erreur: {e}")