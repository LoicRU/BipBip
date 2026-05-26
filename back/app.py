"""
ASSISTANT IA - GÉNÉRATION CV/LETTRES
Modèle: qwen2.5:0.5b (398MB < 500MB)
"""

import html
import json
import logging
import os
import re
import shutil
import tempfile
import threading
import time
from datetime import datetime
from difflib import SequenceMatcher
from typing import List

import ollama
from fastapi import FastAPI, Form, HTTPException
from fastapi.background import BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, EmailStr, Field
from weasyprint import HTML

# Import des fonctions de génération CV/lettre depuis le module séparé
from ia.cv_generator import generer_cv_pdf, generer_lettre_pdf

# ==================== CONFIGURATION LOGGING ====================
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== CONFIGURATION ====================
app = FastAPI()

# CORS restreint - À modifier selon les besoins en production
ALLOWED_ORIGINS = [
    "http://localhost:5173",  # FRONTEND
    "http://localhost:8000",  # BACKEND
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:0.5b")  # Modèle IA local (<500 Mo)
DISK_WARN_THRESHOLD = 10  # Pourcentage d'espace libre minimum avant alerte
DEFAULT_SYSTEM_PROMPT = (
    "Tu es un assistant RH et recrutement francophone, rigoureux, concret et utile. "
    "Tu n'inventes jamais d'information absente du contexte. "
    "Tu privilégies la précision, la clarté et les sorties faciles à parser."
)


# ==================== NETTOYAGE FICHIERS TEMPORAIRES ====================
def cleanup_old_files(directory="/tmp", prefix="", max_age_seconds=3600):
    """Supprime les fichiers temporaires vieux de plus d'1 heure"""
    while True:
        try:
            now = time.time()
            for filename in os.listdir(directory):
                if filename.startswith(prefix):
                    filepath = os.path.join(directory, filename)
                    if now - os.path.getmtime(filepath) > max_age_seconds:
                        os.unlink(filepath)
                        logger.info(f"Nettoyage: {filepath}")
        except Exception as e:
            logger.error(f"Erreur nettoyage: {e}")
        time.sleep(600)


# Threads de nettoyage en arrière-plan
threading.Thread(target=cleanup_old_files, args=("/tmp", "cv_"), daemon=True).start()
threading.Thread(target=cleanup_old_files, args=("/tmp", "lettre_"), daemon=True).start()


def sanitize_text(value: str) -> str:
    """Échappe et nettoie un texte utilisateur avant insertion HTML."""
    return html.escape((value or "").strip())


def temp_pdf_response(path: str, filename: str) -> FileResponse:
    """Retourne un FileResponse (nettoyage fait par le thread cleanup)"""
    return FileResponse(path, filename=filename)


def split_skills(value: str) -> List[str]:
    return [entry.strip() for entry in re.split(r"[,\n]", value or "") if entry.strip()]


def extract_json_block(content: str) -> str:
    fenced = re.search(r"```json\s*([\s\S]*?)```", content or "", flags=re.IGNORECASE)
    if fenced:
        return fenced.group(1).strip()

    match = re.search(r"\{[\s\S]*\}", content or "")
    if match:
        return match.group(0)

    return content


def normalize_text_list(value, fallback: List[str] | None = None) -> List[str]:
    if isinstance(value, list):
        cleaned = [str(item).strip() for item in value if str(item).strip()]
        if cleaned:
            return cleaned

    if isinstance(value, str):
        cleaned = [
            item.strip(" -0123456789.)")
            for item in re.split(r"[\n,;]", value)
            if item.strip()
        ]
        cleaned = [item.strip() for item in cleaned if item.strip()]
        if cleaned:
            return cleaned

    return list(fallback or [])


def dedupe_keep_order(items: List[str]) -> List[str]:
    seen = set()
    result = []

    for item in items:
        key = item.strip().lower()
        if not key or key in seen:
            continue
        seen.add(key)
        result.append(item.strip())

    return result


def limit_sentences(text: str, max_sentences: int = 3) -> str:
    parts = [part.strip() for part in re.split(r"(?<=[.!?])\s+", text or "") if part.strip()]
    if not parts:
        return text.strip()
    return " ".join(parts[:max_sentences]).strip()


def pad_list(items: List[str], fallback: List[str], limit: int) -> List[str]:
    return dedupe_keep_order([*items, *fallback])[:limit]


def safe_score(value, fallback: int) -> int:
    try:
        return max(0, min(100, round(float(value))))
    except (TypeError, ValueError):
        return fallback


def build_job_brief(title: str, company: str, description: str, requirements: List[str], experience: str, job_type: str) -> str:
    return f"""Poste: {title}
Entreprise: {company or "Non précisée"}
Type: {job_type or "Non précisé"}
Expérience attendue: {experience or "Non précisée"}
Compétences clés: {', '.join(requirements) or "Non précisées"}
Description: {description}"""


def build_interview_metrics(payload) -> str:
    answers_text = " ".join(answer.answer.lower() for answer in payload.answers)
    matched_count, matched_requirements = score_keyword_coverage(answers_text, payload.requirements)
    average_length = sum(len(answer.answer.strip()) for answer in payload.answers) / len(payload.answers)
    concrete_answers = sum(
        1
        for answer in payload.answers
        if re.search(r"\b(j'ai|nous avons|par exemple|résultat|impact|mesuré|mesurable)\b", answer.answer.lower())
    )
    return (
        f"Compétences couvertes explicitement: {matched_count}/{len(payload.requirements)}\n"
        f"Compétences détectées: {', '.join(matched_requirements) or 'Aucune'}\n"
        f"Longueur moyenne des réponses: {round(average_length)} caractères\n"
        f"Réponses avec exemples concrets détectés: {concrete_answers}/{len(payload.answers)}"
    )


def score_keyword_coverage(answers_text: str, requirements: List[str]) -> tuple[int, List[str]]:
    matched = []

    for requirement in requirements:
        normalized = requirement.lower().strip()
        if normalized and normalized in answers_text:
            matched.append(requirement)

    return len(matched), matched


def clean_generated_document(content: str) -> str:
    cleaned = content.strip()
    cleaned = re.sub(r"```[\s\S]*?```", "", cleaned).strip()
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned


def build_cv_fallback(payload) -> str:
    competences = ", ".join(split_skills(payload.skills)) or payload.skills
    return f"""{payload.name}
{payload.title}

Email : {payload.email}
Téléphone : {payload.phone or "Non renseigné"}

━━━━━━━━━━━━━━━━━━━
PROFIL PROFESSIONNEL
━━━━━━━━━━━━━━━━━━━

{payload.experience}

━━━━━━━━━━━━━━━━━━━
COMPÉTENCES
━━━━━━━━━━━━━━━━━━━

{competences}

━━━━━━━━━━━━━━━━━━━
FORMATION
━━━━━━━━━━━━━━━━━━━

{payload.education}
"""


def build_cover_letter_fallback(payload) -> str:
    intro = f"Actuellement {payload.title}, " if payload.title else ""
    return f"""Madame, Monsieur,

Je vous adresse ma candidature pour le poste de {payload.position} au sein de {payload.company}.

{intro}je suis particulièrement motivé(e) par cette opportunité.

{payload.motivation}

{payload.experience if payload.experience else "Mon parcours me permet d'aborder ce poste avec sérieux et autonomie."}

Je serais ravi(e) d'échanger avec vous afin de vous présenter plus en détail ma manière de travailler et ma motivation.

Dans l'attente de votre retour, veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

{payload.name}
"""


def build_interview_question_fallback(payload) -> List[str]:
    description = payload.description.lower()
    requirement_questions = [
        f"Pouvez-vous décrire une situation concrète où vous avez utilisé {requirement} avec impact mesurable ?"
        for requirement in payload.requirements[:3]
    ]

    architecture_question = None
    if "react" in description:
        architecture_question = "Comment structurez-vous une application React maintenable et testable dans la durée ?"
    elif "node" in description or "api" in description or "backend" in description:
        architecture_question = "Comment concevez-vous une API fiable, testée et sécurisée dans un contexte de production ?"
    elif "sql" in description or "data" in description or "database" in description:
        architecture_question = "Comment garantissez-vous la qualité des données et la performance des requêtes dans vos projets ?"

    questions = [
        f"Qu'est-ce qui vous motive dans le poste de {payload.title} et en quoi votre parcours vous y prépare-t-il ?",
        "Parlez-nous d'un projet récent dont vous êtes fier(e), en détaillant votre rôle personnel, les contraintes et le résultat.",
        *requirement_questions,
        architecture_question,
        "Racontez une difficulté technique ou organisationnelle que vous avez rencontrée et la manière dont vous l'avez résolue.",
        "Pourquoi pensez-vous être la bonne personne pour ce poste par rapport aux attentes du recruteur ?",
    ]

    return dedupe_keep_order([question for question in questions if question])[:5]


def build_interview_evaluation_fallback(payload):
    answers_text = " ".join(answer.answer.lower() for answer in payload.answers)
    total_answers = len(payload.answers)
    matched_count, matched_requirements = score_keyword_coverage(answers_text, payload.requirements)
    average_length = sum(len(answer.answer.strip()) for answer in payload.answers) / len(payload.answers)
    detailed_answers = sum(1 for answer in payload.answers if len(answer.answer.strip()) >= 120)
    concrete_answers = sum(
        1
        for answer in payload.answers
        if re.search(r"\b(j'ai|nous avons|par exemple|résultat|impact|mesuré|mesurable)\b", answer.answer.lower())
    )
    varied_vocabulary = len(set(re.findall(r"[a-zA-ZÀ-ÿ]{4,}", answers_text)))

    score = 42
    score += min(matched_count * 9, 27)
    score += min(round(average_length / 18), 18)
    score += min(detailed_answers * 4, 16)
    score += min(concrete_answers * 4, 16)
    score += 5 if varied_vocabulary >= 35 else 0
    score = min(100, max(0, round(score)))

    strengths = []
    if matched_requirements:
        strengths.append(
            "Bonne couverture des attentes autour de " + ", ".join(matched_requirements[:2])
        )
    if detailed_answers >= max(1, total_answers // 2):
        strengths.append("Réponses détaillées et argumentées")
    if concrete_answers >= max(1, total_answers // 2):
        strengths.append("Exemples concrets et crédibles pour illustrer l'expérience")
    if not strengths:
        strengths.append("Motivation visible dans les réponses")

    weaknesses = []
    if matched_count < min(2, len(payload.requirements)):
        weaknesses.append("Certaines compétences clés pourraient être davantage illustrées")
    if average_length < 80:
        weaknesses.append("Quelques réponses gagneraient à être plus concrètes")
    if concrete_answers == 0:
        weaknesses.append("Les réponses manquent d'exemples précis ou de résultats observables")
    if not weaknesses:
        weaknesses.append("Approfondir quelques exemples métier pendant l'entretien final")

    return {
        "provider": "fallback",
        "model": None,
        "score": score,
        "feedback": f"Profil {'solide' if score >= 78 else 'prometteur'} pour {payload.title}. {strengths[0]}. {weaknesses[0]}.",
        "strengths": strengths,
        "weaknesses": weaknesses,
        "summary": "Évaluation générée côté service Python en mode fallback, à partir de la couverture des compétences, du niveau de détail et du caractère concret des réponses.",
    }


class CvDraftPayload(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: str = Field(default="", max_length=40)

    city: str = Field(default="", max_length=120)
    mobility: str = Field(default="", max_length=120)

    github: str = Field(default="", max_length=120)
    linkedin: str = Field(default="", max_length=120)

    title: str = Field(min_length=2, max_length=120)

    summary: str = Field(default="", max_length=3000)

    experience: str = Field(min_length=10, max_length=4000)

    projects: str = Field(default="", max_length=4000)

    skills: str = Field(min_length=2, max_length=1000)

    education: str = Field(min_length=2, max_length=2000)

    languages: str = Field(default="", max_length=1000)

    softSkills: str = Field(default="", max_length=1000)

    interests: str = Field(default="", max_length=1000)


class CoverLetterPayload(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    title: str = Field(default="", max_length=120)
    company: str = Field(min_length=2, max_length=120)
    position: str = Field(min_length=2, max_length=120)
    motivation: str = Field(min_length=10, max_length=3000)
    skills: str = Field(default="", max_length=1000)
    experience: str = Field(default="", max_length=4000)
    education: str = Field(default="", max_length=2000)


class InterviewQuestionPayload(BaseModel):
    title: str = Field(min_length=2, max_length=160)
    description: str = Field(min_length=10, max_length=5000)
    requirements: List[str] = Field(default_factory=list)
    experience: str = Field(default="", max_length=120)
    company: str = Field(default="", max_length=120)
    type: str = Field(default="", max_length=80)


class InterviewAnswerPayload(BaseModel):
    question: str = Field(min_length=1, max_length=500)
    answer: str = Field(min_length=1, max_length=4000)
    timestamp: str | None = None


class InterviewEvaluationPayload(BaseModel):
    jobId: str | None = None
    title: str = Field(min_length=2, max_length=160)
    description: str = Field(min_length=10, max_length=5000)
    requirements: List[str] = Field(default_factory=list)
    answers: List[InterviewAnswerPayload] = Field(min_length=1, max_length=20)


# ==================== FONCTION IA ====================
def ask_ia(prompt: str, max_tokens: int = 200, temperature: float = 0.3) -> str:
    """Interroge le modèle IA local"""
    try:
        logger.debug(f"Appel IA - tokens max: {max_tokens}")
        r = ollama.chat(
            model=MODEL,
            messages=[
                {"role": "system", "content": DEFAULT_SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            options={
                "temperature": temperature,
                "num_predict": max_tokens,
                "top_k": 30,
                "top_p": 0.9,
                "repeat_penalty": 1.08,
            }
        )
        content = r.get('message', {}).get('content', '')
        if not content.strip():
            raise RuntimeError("Réponse vide de l'IA")
        return content.strip()
    except Exception as e:
        logger.exception("Erreur ask_ia")
        raise HTTPException(status_code=500, detail="Erreur lors de l'appel à l'IA") from e


def ask_ia_with_repair(prompt: str, max_tokens: int = 200, temperature: float = 0.3) -> str:
    first_pass = ask_ia(prompt, max_tokens=max_tokens, temperature=temperature)
    if first_pass.strip():
        return first_pass

    repair_prompt = (
        "La première réponse était vide ou inutilisable. "
        "Recommence en respectant strictement la consigne et sans ajouter de préambule.\n\n"
        + prompt
    )
    return ask_ia(repair_prompt, max_tokens=max_tokens, temperature=temperature)


def ask_ia_json(prompt: str, *, max_tokens: int = 300, temperature: float = 0.15):
    content = ""
    try:
        content = ask_ia_with_repair(prompt, max_tokens=max_tokens, temperature=temperature)
        return json.loads(extract_json_block(content))
    except (ValueError, TypeError, json.JSONDecodeError):
        if not content.strip():
            raise
        repair_prompt = f"""Transforme le contenu suivant en JSON valide strict, sans commentaire ni markdown.

Contenu source:
{content}
"""
        repaired = ask_ia(repair_prompt, max_tokens=max_tokens, temperature=0.05)
        return json.loads(extract_json_block(repaired))


@app.post("/internal/ai/cv")
async def internal_generate_cv(payload: CvDraftPayload):
    """Génère un CV texte pour le backend principal."""
    fallback = build_cv_fallback(payload)

    try:
        content = ask_ia_with_repair(
            f"""Rédige un CV professionnel en français, clair, crédible et directement exploitable.

Contraintes :
- n'utilise que les informations fournies
- n'invente ni entreprise, ni diplôme, ni dates, ni résultats
- pas de markdown, pas d'emojis
- structure attendue : titre, profil, compétences, expérience, formation
- ton professionnel, précis, concret

Informations candidat :
Nom: {payload.name}
Email: {payload.email}
Téléphone: {payload.phone or "Non renseigné"}
Titre: {payload.title}
Expérience: {payload.experience}
Compétences: {payload.skills}
Formation: {payload.education}
Ville: {payload.city}
Mobilité: {payload.mobility}
GitHub: {payload.github}
LinkedIn: {payload.linkedin}
Présentation: {payload.summary}
Projets: {payload.projects}
Langues: {payload.languages}
Atouts: {payload.softSkills}
Centres d'intérêt: {payload.interests}
""",
            650,
            0.2,
        )
        return JSONResponse({"provider": "ollama", "model": MODEL, "content": clean_generated_document(content)})
    except HTTPException:
        logger.warning("Fallback CV activé")
        return JSONResponse({"provider": "fallback", "model": None, "content": fallback})


@app.post("/internal/ai/cover-letter")
async def internal_generate_cover_letter(payload: CoverLetterPayload):
    """Génère une lettre de motivation texte pour le backend principal."""
    fallback = build_cover_letter_fallback(payload)

    try:
        content = ask_ia_with_repair(
            f"""Rédige une lettre de motivation professionnelle en français, naturelle et personnalisée.

Contraintes :
- n'utilise que les informations fournies
- pas de markdown
- 220 à 320 mots environ
- montre le lien entre le parcours du candidat et les besoins du poste
- évite les formules creuses et génériques

Informations candidat :
Nom: {payload.name}
Titre actuel: {payload.title or "Non précisé"}
Entreprise ciblée: {payload.company}
Poste visé: {payload.position}
Motivation: {payload.motivation}
Compétences: {payload.skills or "Non précisées"}
Expérience: {payload.experience or "Non précisée"}
Formation: {payload.education or "Non précisée"}
""",
            700,
            0.25,
        )
        return JSONResponse({"provider": "ollama", "model": MODEL, "content": clean_generated_document(content)})
    except HTTPException:
        logger.warning("Fallback lettre activé")
        return JSONResponse({"provider": "fallback", "model": None, "content": fallback})


@app.post("/internal/ai/interview/questions")
async def internal_generate_interview_questions(payload: InterviewQuestionPayload):
    """Prépare les questions d'entretien IA pour le backend principal."""
    fallback = build_interview_question_fallback(payload)

    try:
        parsed = ask_ia_json(
            f"""Tu es un recruteur technique exigeant.
Génère 5 questions d'entretien en français, utiles pour différencier un bon candidat d'un candidat moyen.

Objectif :
- obtenir des réponses concrètes, détaillées et révélatrices
- éviter les questions vagues ou trop scolaires
- couvrir motivation, expérience, maîtrise technique, résolution de problème et qualité d'exécution
- si des compétences sont données, au moins 2 questions doivent s'appuyer dessus

Contexte du poste :
{build_job_brief(payload.title, payload.company, payload.description, payload.requirements, payload.experience, payload.type)}

Retourne uniquement un JSON strict :
{{
  "questions": [
    "question 1",
    "question 2",
    "question 3",
    "question 4",
    "question 5"
  ]
}}""",
            max_tokens=450,
            temperature=0.15,
        )
        questions = normalize_text_list(parsed.get("questions"), fallback)
        questions = pad_list(questions, fallback, 5)

        if len(questions) < 3:
            raise HTTPException(status_code=500, detail="Réponse vide pour les questions")

        return JSONResponse({"provider": "ollama", "model": MODEL, "questions": questions})
    except HTTPException:
        logger.warning("Fallback questions activé")
        return JSONResponse({"provider": "fallback", "model": None, "questions": fallback})


@app.post("/internal/ai/interview/evaluate")
async def internal_evaluate_interview(payload: InterviewEvaluationPayload):
    """Évalue les réponses d'entretien pour le backend principal."""
    fallback = build_interview_evaluation_fallback(payload)
    prompt = f"""Tu es un recruteur senior chargé d'évaluer un mini-entretien.
Tu dois produire une évaluation stricte, réaliste et utile, sans complaisance.

Barème :
- compréhension du poste et des attentes
- couverture des compétences clés
- précision technique
- qualité des exemples concrets
- clarté et structure des réponses

Règles :
- score sur 100
- n'invente aucune expérience absente des réponses
- pénalise les réponses vagues, génériques ou hors sujet
- valorise les exemples précis, l'impact, les arbitrages techniques et la capacité d'explication
- retourne uniquement un JSON valide

Contexte du poste :
{build_job_brief(payload.title, "", payload.description, payload.requirements, "", "")}

Réponses du candidat :
"""

    for index, answer in enumerate(payload.answers, start=1):
        prompt += (
            f"Question {index}: {answer.question}\n"
            f"Réponse {index}: {answer.answer}\n"
            f"Longueur réponse {index}: {len(answer.answer.strip())} caractères\n\n"
        )

    prompt += """Format JSON attendu :
{
  "score": 0,
  "feedback": "2 à 4 phrases maximum",
  "strengths": ["point fort 1", "point fort 2", "point fort 3"],
  "weaknesses": ["point faible 1", "point faible 2", "point faible 3"],
  "summary": "verdict synthétique en une phrase"
}"""

    prompt += f"\n\nSignaux objectifs observés:\n{build_interview_metrics(payload)}"

    try:
        parsed = ask_ia_json(prompt, max_tokens=500, temperature=0.1)
        llm_score = safe_score(parsed.get("score"), fallback["score"])
        score = round(llm_score * 0.72 + fallback["score"] * 0.28)
        strengths = pad_list(
            normalize_text_list(parsed.get("strengths"), fallback["strengths"]),
            fallback["strengths"],
            3,
        )
        weaknesses = pad_list(
            normalize_text_list(parsed.get("weaknesses"), fallback["weaknesses"]),
            fallback["weaknesses"],
            3,
        )
        feedback = limit_sentences(
            str(parsed.get("feedback", fallback["feedback"])).strip() or fallback["feedback"],
            4,
        )
        summary = limit_sentences(
            str(parsed.get("summary", fallback["summary"])).strip() or fallback["summary"],
            2,
        )
        return JSONResponse(
            {
                "provider": "ollama",
                "model": MODEL,
                "score": score,
                "feedback": feedback,
                "strengths": strengths,
                "weaknesses": weaknesses,
                "summary": summary,
            }
        )
    except (HTTPException, ValueError, TypeError, json.JSONDecodeError):
        logger.warning("Fallback evaluation activé")
        return JSONResponse(fallback)


# ==================== BRIQUE 1 : ANALYSE DE TEXTE/OFFRE ====================
@app.post("/analyse-texte")
async def analyse_texte(
    texte: str = Form(...),
    langue_cible: str = Form("anglais")
):
    """Extraction mots-clés + synthèse + traduction"""
    try:
        texte_echappe = sanitize_text(texte)
        langue_cible = sanitize_text(langue_cible) or "anglais"

        prompt_mots = f"""Extrais les mots-clés importants de ce texte. Retourne uniquement une liste séparée par des virgules.
Texte: {texte_echappe[:500]}
Mots-clés:"""
        resultat_mots = ask_ia(prompt_mots, 100)
        mots_cles = [m.strip() for m in resultat_mots.split(',') if m.strip()]

        prompt_synthese = f"Résume ce texte en 2-3 phrases maximum.\nTexte: {texte_echappe[:800]}\nRésumé:"
        synthese = ask_ia(prompt_synthese, 150)

        prompt_trad = f"Traduis ce texte en {langue_cible}.\nTexte: {texte_echappe[:500]}\nTraduction:"
        traduction = ask_ia(prompt_trad, 300)

        return JSONResponse({
            "mots_cles": mots_cles if mots_cles else ["aucun"],
            "synthese": synthese if synthese else texte[:200],
            "traduction": traduction if traduction else None
        })
    except Exception:
        logger.exception("Erreur analyse-texte")
        raise HTTPException(status_code=500, detail="Erreur lors de l'analyse du texte")


# ==================== BRIQUE 2 : MATCHING ====================
@app.post("/matching")
async def matching(profil: str = Form(...), offres: str = Form(...)):
    """Classification + recommandation d'offres"""
    try:
        profil_echappe = sanitize_text(profil)
        offres_echappees = sanitize_text(offres)

        categories = ["Développeur", "Designer", "Product Manager", "Data Scientist", "Marketing", "Commercial", "Autre"]

        prompt_class = f"Classe ce profil dans: {', '.join(categories)}.\nTexte: {profil_echappe[:500]}\nCatégorie:"
        categorie = ask_ia(prompt_class, 50)
        if categorie not in categories:
            categorie = "Autre"

        prompt_rec = f"""Analyse ce profil et ces offres. Recommande les 2 offres les plus adaptées.
Profil: {profil_echappe[:500]}
Offres: {offres_echappees[:500]}
Réponse: titre + pourquoi"""
        recommandations = ask_ia(prompt_rec, 200)

        return JSONResponse({
            "categorie": categorie,
            "recommandations": recommandations if recommandations else "Aucune"
        })
    except Exception:
        logger.exception("Erreur matching")
        raise HTTPException(status_code=500, detail="Erreur lors du matching")


# ==================== BRIQUE 3 : DÉTECTION DOUBLONS ====================
@app.post("/detection-doublons")
async def detection_doublons(
    texte1: str = Form(...),
    texte2: str = Form(...),
    seuil: float = Form(0.8)
):
    """Détecte si deux offres sont similaires (combine calcul + IA)"""
    try:
        ratio = SequenceMatcher(None, texte1.lower(), texte2.lower()).ratio()
        prompt = f"Même offre? OUI/NON: {sanitize_text(texte1)[:200]} / {sanitize_text(texte2)[:200]}"
        ia_decision = ask_ia(prompt, 20).upper().strip()
        est_doublon = ratio > seuil or "OUI" in ia_decision

        return JSONResponse({
            "est_doublon": est_doublon,
            "similarite": round(ratio, 2),
            "confirmation_ia": ia_decision[:10]
        })
    except Exception:
        logger.exception("Erreur detection-doublons")
        raise HTTPException(status_code=500, detail="Erreur lors de la détection")


# ==================== CALCUL ANNÉES EXPÉRIENCE ====================
def calculer_annees_experience(experiences: str) -> str:
    """Calcule une estimation d'années d'expérience à partir des dates trouvées."""
    dates = re.findall(r'\d{4}', experiences)
    if len(dates) >= 2:
        try:
            diff = int(max(dates)) - int(min(dates))
            if diff < 0:
                diff = 0
            return f"{diff}"
        except ValueError:
            pass
    return "plusieurs"


# ==================== ROUTE CV (utilise cv_generator) ====================
@app.post("/generer-cv")
async def generer_cv(
    nom: str = Form(...), email: str = Form(...), tel: str = Form(...),
    titre: str = Form(...), competences: str = Form(...), formation: str = Form(...),
    experiences: str = Form(...), adresse: str = Form(""), profil: str = Form(""),
    langues: str = Form(""), atouts: str = Form(""), interets: str = Form(""),
    reseaux: str = Form(""), projets: str = Form(""),
    competences_detail: str = Form(""), mobilite: str = Form("")
):
    """Génère un CV en PDF à partir des données du formulaire"""
    try:
        pdf_path = generer_cv_pdf(
            nom=nom, email=email, tel=tel,
            titre=titre, competences=competences,
            formation=formation, experiences=experiences,
            adresse=adresse, profil=profil, langues=langues,
            atouts=atouts, interets=interets, reseaux=reseaux,
            projets=projets, competences_detail=competences_detail,
            mobilite=mobilite,
        )
        return temp_pdf_response(pdf_path, filename=f"CV_{nom.replace(' ', '_')}.pdf")
    except Exception:
        logger.exception("Erreur generer_cv")
        raise HTTPException(status_code=500, detail="Erreur lors de la génération du CV")


# ==================== ROUTE LETTRE (utilise cv_generator) ====================
@app.post("/generer-lettre")
async def generer_lettre(
    nom: str = Form(...), email: str = Form(...), tel: str = Form(...),
    poste: str = Form(...), entreprise: str = Form(...),
    competences: str = Form(...), experiences: str = Form(...),
    extra: str = Form("")
):
    """Génère une lettre de motivation en PDF"""
    try:
        pdf_path = generer_lettre_pdf(
            nom=nom, email=email, tel=tel,
            poste=poste, entreprise=entreprise,
            competences=competences, experiences=experiences,
            extra=extra
        )
        return temp_pdf_response(pdf_path, filename=f"Lettre_{nom.replace(' ', '_')}.pdf")
    except Exception:
        logger.exception("Erreur generer_lettre")
        raise HTTPException(status_code=500, detail="Erreur lors de la génération de la lettre")


# ==================== MODE ENTREPRISE : MINI-ENTRETIEN ====================
@app.post("/company/generer-questions")
async def generer_questions_entretien(
    titre: str = Form(...),
    description: str = Form(...),
    competences: str = Form(...)
):
    """Génère des questions d'entretien pour une offre (Mode Entreprise)"""
    requirements = split_skills(competences)
    fallback_payload = type("Payload", (), {
        "title": titre,
        "description": description,
        "requirements": requirements,
        "company": "",
        "experience": "",
        "type": "",
    })()
    fallback_questions = build_interview_question_fallback(fallback_payload)

    try:
        parsed = ask_ia_json(
            f"""Tu es un recruteur technique exigeant.
Génère 5 questions d'entretien en français, concrètes et discriminantes.

Contexte du poste :
{build_job_brief(titre, "", description[:1200], requirements, "", "")}

Retourne uniquement un JSON strict :
{{
  "questions": [
    "question 1",
    "question 2",
    "question 3",
    "question 4",
    "question 5"
  ]
}}""",
            max_tokens=450,
            temperature=0.15,
        )
        liste_questions = pad_list(
            normalize_text_list(parsed.get("questions"), fallback_questions),
            fallback_questions,
            5,
        )
        return JSONResponse({"questions": liste_questions})
    except Exception:
        logger.exception("Erreur generation questions")
        raise HTTPException(500, "Erreur génération questions")


@app.post("/company/evaluer-reponses")
async def evaluer_reponses_entretien(
    offre_titre: str = Form(...),
    offre_description: str = Form(...),
    reponses_json: str = Form(...)
):
    """Évalue les réponses d'un candidat (Mode Entreprise)"""
    try:
        reponses = json.loads(reponses_json)
        prompt = f"""Tu es un recruteur senior. Évalue ces réponses avec exigence.

Poste: {offre_titre}
Description: {offre_description[:600]}

Questions et réponses:
"""
        for i, r in enumerate(reponses):
            prompt += (
                f"Q{i+1}: {r.get('question', '')}\n"
                f"R{i+1}: {r.get('reponse', '')}\n\n"
            )

        prompt += """Retourne uniquement un JSON strict :
{
  "score_sur_10": 0,
  "commentaire": "2 phrases maximum",
  "points_forts": ["point 1", "point 2"],
  "points_a_approfondir": ["point 1", "point 2"]
}"""

        parsed = ask_ia_json(prompt, max_tokens=260, temperature=0.1)
        return JSONResponse({
            "evaluation": {
                "score_sur_10": max(0, min(10, round(float(parsed.get("score_sur_10", 5))))),
                "commentaire": limit_sentences(str(parsed.get("commentaire", "")).strip(), 2),
                "points_forts": normalize_text_list(parsed.get("points_forts"))[:2],
                "points_a_approfondir": normalize_text_list(parsed.get("points_a_approfondir"))[:2],
            }
        })
    except Exception:
        logger.exception("Erreur evaluation")
        raise HTTPException(500, "Erreur évaluation")


# ==================== ROUTE POSTULATION ====================
@app.post("/user/postuler")
async def postuler_offre(
    offre_id: int = Form(...),
    nom: str = Form(...),
    email: str = Form(...),
    reponses_json: str = Form(...)
):
    """Le candidat postule à une offre avec ses réponses"""
    # TODO: Sauvegarde en BDD (à implémenter)
    return JSONResponse({"status": "success", "message": "Candidature envoyée"})


# ==================== HEALTH CHECK ====================
@app.get("/health")
def health():
    """Vérifie que l'IA, WeasyPrint et l'espace disque sont disponibles"""
    status = {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {}
    }

    # Vérification d'Ollama (service critique)
    try:
        ollama.list()
        status["services"]["ollama"] = "ok"
        status["model"] = MODEL
    except Exception as e:
        status["services"]["ollama"] = f"error: {str(e)}"
        status["status"] = "degraded"

    # Vérification de WeasyPrint
    try:
        HTML(string="<html></html>").write_pdf()
        status["services"]["weasyprint"] = "ok"
    except Exception as e:
        status["services"]["weasyprint"] = f"error: {str(e)}"
        status["status"] = "degraded"

    # Vérification de l'espace disque
    try:
        du = shutil.disk_usage("/tmp")
        free_percent = du.free / du.total * 100
        status["services"]["disk"] = f"{free_percent:.1f}% free"
        if free_percent < DISK_WARN_THRESHOLD:
            status["status"] = "degraded"
            logger.warning(f"Espace disque faible: {free_percent:.1f}% libre")
    except Exception as e:
        status["services"]["disk"] = f"error: {str(e)}"

    return status
