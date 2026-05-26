# routes/user_routes.py
from fastapi import APIRouter, Form, File, UploadFile

router = APIRouter(prefix="/user", tags=["Utilisateur"])

@router.get("/offres/{offre_id}/questions")
async def get_questions_entretien(offre_id: int):
    """
    L'utilisateur voit les questions avant de postuler.
    """
    questions = get_questions_by_offre(offre_id)
    return {"offre_id": offre_id, "questions": questions}


@router.post("/offres/{offre_id}/postuler")
async def postuler_avec_reponses(
    offre_id: int,
    nom: str = Form(...),
    email: str = Form(...),
    cv: UploadFile = File(...),
    reponses: str = Form(...)  # JSON: [{"question": "...", "reponse": "..."}]
):
    """
    L'utilisateur postule et répond aux questions.
    """
    import json
    reponses_liste = json.loads(reponses)
    
    # Sauvegarde du CV
    cv_path = f"/tmp/cv_{nom.replace(' ', '_')}.pdf"
    with open(cv_path, "wb") as f:
        f.write(await cv.read())
    
    # Sauvegarde de la candidature
    candidature_id = sauvegarder_candidature(
        offre_id=offre_id,
        nom=nom,
        email=email,
        cv_path=cv_path,
        reponses=reponses_liste
    )
    
    return {
        "status": "success",
        "candidature_id": candidature_id,
        "message": "Candidature envoyée avec succès"
    }