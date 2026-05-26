# routes/company_routes.py
from fastapi import APIRouter, Depends, Form
from ia.entretien_generator import generer_questions_entretien 

router = APIRouter(prefix="/company", tags=["Entreprise"])

@router.post("/offres")
async def creer_offre_avec_questions(
    title: str = Form(...),
    description: str = Form(...),
    skills: str = Form(...),
    company_id: int = Form(...)
):
    """
    Une entreprise crée une offre d'emploi.
    L'IA génère automatiquement des questions d'entretien.
    """
    offre = {
        "title": title,
        "description": description,
        "skills": [s.strip() for s in skills.split(',')],
        "company_id": company_id
    }
    
    # Sauvegarde de l'offre en BDD (à implémenter)
    offre_id = sauvegarder_offre(offre)
    
    # Génération des questions IA
    questions = generer_questions_entretien(offre)
    
    # Sauvegarde des questions liées à l'offre
    sauvegarder_questions(offre_id, questions)
    
    return {
        "offre_id": offre_id,
        "message": "Offre créée avec succès",
        "questions_entretien": questions
    }


@router.get("/offres/{offre_id}/candidatures")
async def voir_candidatures_avec_reponses(offre_id: int):
    """
    L'entreprise consulte les candidatures avec les réponses.
    """
    candidatures = get_candidatures_by_offre(offre_id)
    
    resultats = []
    for cand in candidatures:
        # Évaluation IA des réponses
        evaluation = evaluer_reponses_entretien(
            get_offre(offre_id), 
            cand['reponses']
        )
        resultats.append({
            "candidat_id": cand['user_id'],
            "nom": cand['nom'],
            "cv_url": cand['cv_url'],
            "reponses": cand['reponses'],
            "evaluation_ia": evaluation
        })
    
    return {"candidatures": resultats}