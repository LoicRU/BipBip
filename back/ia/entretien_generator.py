import ollama
import json
from typing import List, Dict

MODEL = "qwen2.5:0.5b"

def generer_questions_entretien(offre: Dict) -> List[str]:
    """
    Génère 3-5 questions d'entretien à partir d'une offre d'emploi.
    """
    prompt = f"""Génère 5 questions d'entretien pertinentes pour ce poste.

Titre: {offre.get('title', '')}
Description: {offre.get('description', '')[:500]}
Compétences requises: {offre.get('skills', [])}

Règles:
- Questions techniques et comportementales
- Adaptées au niveau du poste
- Retourne uniquement la liste, une question par ligne

Questions:"""
    
    try:
        response = ollama.chat(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            options={"temperature": 0.4, "num_predict": 500}
        )
        questions = [q.strip() for q in response['message']['content'].split('\n') if q.strip()]
        return questions[:5]
    except:
        # Questions par défaut
        return [
            "Pourquoi postulez-vous à ce poste ?",
            "Quelles sont vos principales compétences techniques ?",
            "Décrivez un projet récent dont vous êtes fier.",
            "Comment gérez-vous les situations de stress ?",
            "Où vous voyez-vous dans 5 ans ?"
        ]


def evaluer_reponses_entretien(offre: Dict, reponses: List[str]) -> Dict:
    """
    Évalue les réponses du candidat et donne un score.
    """
    prompt = f"""Évalue ces réponses d'entretien pour le poste suivant.

Poste: {offre.get('title', '')}
Description: {offre.get('description', '')[:300]}

Questions et réponses du candidat:
"""
    for i, rep in enumerate(reponses):
        prompt += f"Q{i+1}: {rep.get('question', '')}\nR{i+1}: {rep.get('reponse', '')}\n\n"
    
    prompt += """
Retourne un JSON avec:
- score: (1-10)
- commentaire: (une phrase)
- points_forts: (liste)
- points_faibles: (liste)"""

    try:
        response = ollama.chat(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            options={"temperature": 0.3, "num_predict": 300}
        )
        # Essayer de parser le JSON
        import json
        return json.loads(response['message']['content'])
    except:
        return {
            "score": 7,
            "commentaire": "Réponses correctes, bon alignement avec le poste.",
            "points_forts": ["Motivation", "Compétences techniques"],
            "points_faibles": ["Manque de détails sur certains points"]
        }