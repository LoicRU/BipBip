"""
cv_generator.py - Module de génération CV et Lettre de motivation
Utilisé par le mode UTILISATEUR
"""

import html
import re
import uuid
import tempfile
import os
from datetime import datetime
from typing import List

import ollama
from weasyprint import HTML

# ==================== CONFIGURATION ====================
MODEL = "qwen2.5:0.5b"


# ==================== FONCTION IA ====================
def ask_ia(prompt: str, max_tokens: int = 200) -> str:
    """Appelle le modèle IA local"""
    try:
        r = ollama.chat(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            options={"temperature": 0.3, "num_predict": max_tokens}
        )
        return r['message']['content'].strip()
    except Exception as e:
        print(f"Erreur IA: {e}")
        return ""


# ==================== EXTRACTION DES REALISATIONS ====================
def extraire_realisations(texte: str) -> List[str]:
    """Extrait les réalisations d'une expérience (bullet points)"""
    phrases = re.split(r'[.!?]', texte)
    resultats = []
    for p in phrases:
        p = p.strip()
        if p and len(p) > 8:
            # Supprime les débuts comme "J'ai", "Je"
            p = re.sub(r'^(J\'ai|Je|J’ai|On a|Nous avons)\s+', '', p, flags=re.IGNORECASE)
            if p:
                p = p[0].upper() + p[1:] if p else ""
                if not p.endswith('.'):
                    p = p + '.'
                resultats.append(p[:120])
    return resultats[:5] if resultats else ["Expérience significative."]


def escape_html(value: str) -> str:
    return html.escape((value or "").strip())


def split_non_empty_lines(value: str) -> List[str]:
    return [line.strip() for line in (value or "").splitlines() if line.strip()]


def split_inline_items(value: str) -> List[str]:
    return [
        item.strip(" -•\t")
        for item in re.split(r"[,;\n]", value or "")
        if item.strip(" -•\t")
    ]


def split_blocks(value: str) -> List[str]:
    blocks = [block.strip() for block in re.split(r"\n\s*\n", (value or "").strip()) if block.strip()]
    if blocks:
        return blocks
    return split_non_empty_lines(value)


def initials_from_name(name: str) -> str:
    parts = [part for part in re.split(r"\s+", (name or "").strip()) if part]
    if not parts:
        return "CV"
    return "".join(part[0].upper() for part in parts[:2])


def parse_sidebar_items(value: str) -> List[dict]:
    items = []
    for line in split_non_empty_lines(value):
        if ":" in line:
            label, detail = line.split(":", 1)
        elif "|" in line:
            label, detail = line.split("|", 1)
        else:
            label, detail = line, ""
        items.append({
            "label": escape_html(label),
            "detail": escape_html(detail),
        })
    return items


def parse_timeline_entries(value: str, fallback_title: str) -> List[dict]:
    entries = []
    raw_entries = split_blocks(value)

    for raw in raw_entries:
        lines = split_non_empty_lines(raw)
        if not lines:
            continue

        if len(lines) == 1 and "|" in lines[0]:
            parts = [part.strip() for part in lines[0].split("|")]
            title = parts[0] if parts else fallback_title
            subtitle = " | ".join(part for part in parts[1:3] if part)
            bullets = split_inline_items(parts[3]) if len(parts) > 3 else []
        elif len(lines) >= 2:
            title = lines[0]
            subtitle = lines[1]
            bullets = [
                line.strip(" -•\t")
                for line in lines[2:]
                if line.strip(" -•\t")
            ]
            if not bullets and len(lines) == 2:
                bullets = extraire_realisations(" ".join(lines))
        else:
            title = lines[0]
            subtitle = ""
            match = re.search(r"\b(?:chez|à)\s+([^.,]+)", raw, flags=re.IGNORECASE)
            years = re.findall(r"\d{4}", raw)
            subtitle_parts = []
            if match:
                subtitle_parts.append(match.group(1).strip())
            if years:
                subtitle_parts.append(" - ".join([years[0], years[1] if len(years) > 1 else "Present"]))
            subtitle = " | ".join(subtitle_parts)
            bullets = extraire_realisations(raw)

        entries.append({
            "title": escape_html(title or fallback_title),
            "subtitle": escape_html(subtitle),
            "bullets": [escape_html(item) for item in bullets[:6]],
        })

    return entries


def build_skill_groups(competences: str, competences_detail: str = "") -> List[dict]:
    groups = []

    for line in split_non_empty_lines(competences_detail):
        if ":" not in line:
            continue
        label, values = line.split(":", 1)
        items = split_inline_items(values)
        if items:
            groups.append({
                "label": escape_html(label),
                "items": [escape_html(item) for item in items[:8]],
            })

    if groups:
        return groups

    comps = split_inline_items(competences)
    categories = {
        "Langages": [],
        "Frontend": [],
        "Backend": [],
        "Data / Infra": [],
        "Outils": [],
    }

    for comp in comps:
        lower = comp.lower()
        if lower in {"python", "javascript", "typescript", "php", "java", "c", "c++", "c#", "go", "rust"}:
            categories["Langages"].append(comp)
        elif lower in {"react", "vue", "angular", "html", "css", "sass", "tailwind"}:
            categories["Frontend"].append(comp)
        elif lower in {"node", "node.js", "express", "nestjs", "django", "flask", "spring", "laravel"}:
            categories["Backend"].append(comp)
        elif lower in {"docker", "kubernetes", "aws", "gcp", "azure", "postgresql", "mysql", "mongodb", "sqlite"}:
            categories["Data / Infra"].append(comp)
        else:
            categories["Outils"].append(comp)

    for label, items in categories.items():
        if items:
            groups.append({
                "label": escape_html(label),
                "items": [escape_html(item) for item in items[:8]],
            })

    if not groups and comps:
        groups.append({
            "label": "Competences",
            "items": [escape_html(item) for item in comps[:10]],
        })

    return groups


def render_sidebar_section(title: str, body_html: str) -> str:
    if not body_html.strip():
        return ""
    return f"""
    <div class="sidebar-section">
        <div class="sidebar-title">{escape_html(title)}</div>
        {body_html}
    </div>
    """


def render_info_list(items: List[dict], emphasized: bool = False) -> str:
    html_parts = []
    for item in items:
        label = item["label"]
        detail = item["detail"]
        if detail:
            content = (
                f'<div class="info-label{" strong" if emphasized else ""}">{label}</div>'
                f'<div class="info-detail">{detail}</div>'
            )
        else:
            content = f'<div class="info-label{" strong" if emphasized else ""}">{label}</div>'
        html_parts.append(f'<div class="info-item">{content}</div>')
    return "".join(html_parts)


def render_timeline(entries: List[dict]) -> str:
    if not entries:
        return '<div class="muted">Section non renseignee.</div>'

    blocks = []
    for entry in entries:
        bullet_html = ""
        if entry["bullets"]:
            bullet_html = "<ul class=\"timeline-bullets\">" + "".join(
                f"<li>{bullet}</li>" for bullet in entry["bullets"]
            ) + "</ul>"
        subtitle_html = f'<div class="timeline-subtitle">{entry["subtitle"]}</div>' if entry["subtitle"] else ""
        blocks.append(f"""
        <div class="timeline-item">
            <div class="timeline-title">{entry["title"]}</div>
            {subtitle_html}
            {bullet_html}
        </div>
        """)
    return "".join(blocks)


def render_skill_groups(groups: List[dict]) -> str:
    if not groups:
        return '<div class="muted">Competences non renseignees.</div>'

    blocks = []
    for group in groups:
        items_html = "".join(f"<li>{item}</li>" for item in group["items"])
        blocks.append(f"""
        <div class="skill-group">
            <div class="skill-group-title">{group["label"]}</div>
            <ul class="skill-list">{items_html}</ul>
        </div>
        """)
    return "".join(blocks)


# ==================== GENERATION DU PROFIL ====================
def generer_profil(titre: str, experiences: str, competences: str) -> str:
    """Génère le résumé professionnel avec calcul des années d'expérience"""
    comps = competences.split(',')[:4]
    comp_texte = ", ".join([c.strip() for c in comps])
    
    # Calcule les années à partir des dates (ex: 2021, 2024)
    dates = re.findall(r'\d{4}', experiences)
    if len(dates) >= 2:
        try:
            years = [int(y) for y in dates]
            diff = max(years) - min(years)
            if diff < 0:
                diff = 0
            annees = f"{diff} ans"
        except ValueError:
            annees = "plusieurs années"
    else:
        annees = "plusieurs années"
    
    return f"{titre} avec {annees} d'expérience. Expert en {comp_texte}."


# ==================== GENERATION CV PDF ====================
def generer_cv_pdf(
    nom: str, email: str, tel: str, titre: str,
    competences: str, formation: str, experiences: str,
    adresse: str = "", profil: str = "", langues: str = "",
    atouts: str = "", interets: str = "", reseaux: str = "",
    projets: str = "", competences_detail: str = "",
    mobilite: str = ""
) -> str:
    """
    Génère un CV en PDF et retourne le chemin du fichier temporaire.
    """
    nom_e = escape_html(nom)
    email_e = escape_html(email)
    tel_e = escape_html(tel)
    titre_e = escape_html(titre)
    profil_e = escape_html(profil) or escape_html(generer_profil(titre, experiences, competences))

    contact_items = [
            {"label": "Email", "detail": email_e},
            {"label": "Téléphone", "detail": tel_e},
            {"label": "Ville", "detail": escape_html(adresse)} if adresse.strip() else None,
            {"label": "Mobilité", "detail": escape_html(mobilite)} if mobilite.strip() else None,
        ]
    contact_items = [item for item in contact_items if item]

    langues_html = render_info_list(parse_sidebar_items(langues), emphasized=True)
    atouts_html = render_info_list(
        [{"label": escape_html(item), "detail": ""} for item in split_inline_items(atouts)],
        emphasized=True,
    )
    interets_html = render_info_list(
        [{"label": escape_html(item), "detail": ""} for item in split_inline_items(interets)],
        emphasized=True,
    )
    reseaux_html = render_info_list(parse_sidebar_items(reseaux))

    formation_entries = parse_timeline_entries(formation, "Formation")
    experience_entries = parse_timeline_entries(experiences, "Experience")
    project_entries = parse_timeline_entries(projets, "Projet")
    skill_groups = build_skill_groups(competences, competences_detail)

    html_content = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
    @page {{ size: A4; margin: 0; }}
    body {{
        font-family: Arial, Helvetica, sans-serif;
        line-height: 1.45;
        color: #232323;
        margin: 0;
        background: #ffffff;
    }}
    .page {{
        width: 100%;
        min-height: 100vh;
        display: table;
        table-layout: fixed;
    }}
    .sidebar, .main {{
        display: table-cell;
        vertical-align: top;
    }}
    .sidebar {{
        width: 30%;
        background: #303033;
        color: #f4f4f4;
        padding: 34px 28px 40px;
    }}
    .main {{
        width: 70%;
        padding: 28px 40px 36px;
    }}
    .avatar {{
        width: 136px;
        height: 136px;
        border-radius: 50%;
        background: linear-gradient(160deg, #dcefff 0%, #91b9db 100%);
        color: #1f2e3c;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 42px;
        font-weight: bold;
        margin: 0 auto 24px;
        letter-spacing: 2px;
    }}
    .sidebar-role {{
        text-align: center;
        color: #d8ecff;
        font-size: 13px;
        letter-spacing: 1px;
        text-transform: uppercase;
        margin-bottom: 26px;
    }}
    .sidebar-section {{
        margin-bottom: 28px;
    }}
    .sidebar-title {{
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 14px;
        color: #ffffff;
    }}
    .info-item {{
        margin-bottom: 10px;
    }}
    .info-label {{
        font-size: 14px;
        color: #f1f1f1;
    }}
    .info-label.strong {{
        font-weight: bold;
    }}
    .info-detail {{
        font-size: 13px;
        color: #d2d2d2;
        margin-top: 2px;
    }}
    .name {{
        font-size: 26px;
        font-weight: bold;
        letter-spacing: 0.4px;
        margin-bottom: 6px;
    }}
    .title {{
        font-size: 15px;
        color: #2ea5e5;
        font-weight: bold;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 0.6px;
    }}
    .summary {{
        font-size: 14px;
        color: #444444;
        margin-bottom: 22px;
    }}
    .section-title {{
        font-size: 17px;
        font-weight: bold;
        color: #2ea5e5;
        margin: 24px 0 14px;
    }}
    .timeline-item {{
        position: relative;
        padding-left: 22px;
        margin: 0 0 16px 8px;
        border-left: 2px solid #1f1f1f;
    }}
    .timeline-item:before {{
        content: "";
        position: absolute;
        left: -7px;
        top: 5px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #1f1f1f;
    }}
    .timeline-title {{
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 2px;
        color: #181818;
    }}
    .timeline-subtitle {{
        font-size: 13px;
        color: #666666;
        margin-bottom: 4px;
    }}
    .timeline-bullets {{
        margin: 5px 0 0 0;
        padding-left: 18px;
    }}
    .timeline-bullets li {{
        margin-bottom: 2px;
        font-size: 13px;
        color: #444444;
    }}
    .skills-grid {{
        margin-top: 4px;
    }}
    .skill-group {{
        margin-bottom: 12px;
    }}
    .skill-group-title {{
        font-size: 14px;
        font-weight: bold;
        color: #181818;
        margin-bottom: 4px;
    }}
    .skill-list {{
        margin: 0;
        padding-left: 18px;
    }}
    .skill-list li {{
        font-size: 13px;
        margin-bottom: 2px;
    }}
    .muted {{
        color: #727272;
        font-size: 13px;
    }}
</style>
<body>
<div class="page">
    <div class="sidebar">
        <div class="avatar">{initials_from_name(nom)}</div>
        <div class="sidebar-role">{titre_e}</div>
        {render_sidebar_section("Coordonnees", render_info_list(contact_items))}
        {render_sidebar_section("Langues", langues_html)}
        {render_sidebar_section("Atouts", atouts_html)}
        {render_sidebar_section("Centres d'interet", interets_html)}
        {render_sidebar_section("Reseaux", reseaux_html)}
    </div>
    <div class="main">
        <div class="name">{nom_e}</div>
        <div class="title">{titre_e}</div>
        <div class="summary">{profil_e}</div>

        <div class="section-title">Diplomes et formations</div>
        {render_timeline(formation_entries)}

        <div class="section-title">Experiences professionnelles</div>
        {render_timeline(experience_entries)}

        <div class="section-title">Projets</div>
        {render_timeline(project_entries)}

        <div class="section-title">Competences techniques</div>
        <div class="skills-grid">{render_skill_groups(skill_groups)}</div>
    </div>
</div>
</body></html>"""
    
    # Génération du PDF dans un fichier temporaire
    fd, path = tempfile.mkstemp(suffix=".pdf", prefix="cv_")
    os.close(fd)
    HTML(string=html_content).write_pdf(path)
    
    return path


# ==================== GENERATION LETTRE PDF ====================
def generer_lettre_pdf(
    nom: str, email: str, tel: str, poste: str, entreprise: str,
    competences: str, experiences: str, extra: str = ""
) -> str:
    """
    Génère une lettre de motivation en PDF et retourne le chemin du fichier temporaire.
    """
    # Échappement HTML basique
    nom_e = nom.replace('<', '&lt;').replace('>', '&gt;')
    email_e = email.replace('<', '&lt;').replace('>', '&gt;')
    tel_e = tel.replace('<', '&lt;').replace('>', '&gt;')
    poste_e = poste.replace('<', '&lt;').replace('>', '&gt;')
    entreprise_e = entreprise.replace('<', '&lt;').replace('>', '&gt;')
    
    # Prépare les champs pour l'IA
    comps = [c.strip() for c in competences.split(',') if c.strip()][:6]
    comp_texte = ", ".join(comps)

    # Première expérience courte
    exp_list = [e.strip() for e in experiences.split('\n') if e.strip()]
    premiere_exp = exp_list[0][:300] if exp_list else ""

    # Années d'expérience (robuste)
    dates = re.findall(r'\d{4}', experiences)
    if len(dates) >= 2:
        try:
            years = [int(y) for y in dates]
            diff = max(years) - min(years)
            if diff < 0:
                diff = 0
            annees = str(diff)
        except ValueError:
            annees = "plusieurs"
    else:
        annees = "plusieurs"

    extra_e = extra.replace('<', '&lt;').replace('>', '&gt;') if extra else ""
    # Nettoie et condense le texte libre fourni par le candidat pour éviter répétitions
    def condense_text(t: str, max_sentences: int = 2) -> str:
        if not t:
            return ""
        parts = [p.strip() for p in re.split(r'(?<=[.!?])\s+', t) if p.strip()]
        seen = set()
        out = []
        for p in parts:
            key = re.sub(r"\s+", " ", p.lower())
            if key in seen:
                continue
            seen.add(key)
            out.append(p)
            if len(out) >= max_sentences:
                break
        return " ".join(out)

    extra_short = condense_text(extra_e, max_sentences=2)

    # Debug log for years calculation
    try:
        print(f"DEBUG_ANNEES_LETTRE: {annees}")
    except Exception:
        pass

    # Nettoyage du texte généré par l'IA: supprime phrases dupliquées et paraphrases exactes
    def dedupe_generated_text(text: str) -> str:
        if not text:
            return text
        # Split by paragraphs, then dedupe sentences inside each paragraph
        paras = [p.strip() for p in re.split(r"\n{2,}", text) if p.strip()]
        out_paras = []
        global_seen = set()
        for p in paras:
            # split into sentences
            sents = [s.strip() for s in re.split(r'(?<=[.!?])\s+', p) if s.strip()]
            kept = []
            for s in sents:
                key = re.sub(r"\s+", " ", s.lower())
                # remove very short non-informative sentences
                if len(key) < 10:
                    continue
                if key in global_seen:
                    continue
                # avoid near-exact repeats by containment
                dup = False
                for g in list(global_seen):
                    if key in g or g in key:
                        dup = True
                        break
                if dup:
                    continue
                global_seen.add(key)
                kept.append(s)
            if kept:
                out_paras.append(" ".join(kept))
        return "\n\n".join(out_paras)

    # Essayer de générer une lettre via l'IA (fallback sur template en cas d'échec)
    def generer_lettre_ai():
        prompt = (
            "Tu es un assistant qui écrit la lettre AU NOM DU CANDIDAT. Rédige en français une lettre de motivation professionnelle et naturelle du point de vue du candidat. "
            "Adresses-la directement à l'entreprise/recruteur (commence par 'Madame, Monsieur,'), ne la commence jamais par 'Cher [Nom du candidat]' et ne fournis aucune balise ou métadonnée.\n\n"
            "Structure la lettre en TROIS paragraphes distincts :\n"
            "1) Accroche courte (qui vous êtes et intérêt pour le poste).\n"
            "2) Valeur ajoutée (compétences clés + une réalisation concrète, orientée résultat).\n"
            "3) Motivation et disponibilité (fermeture).\n\n"
            "Ne fais AUCUNE répétition entre paragraphes. Si une idée est présente dans le texte du candidat, synthétise-la, ne la répète pas mot pour mot. "
            "Évite les phrases vagues et les répétitions. Utilise un ton formel et précis.\n\n"
            f"Le candidat s'appelle: {nom}.\n"
            f"Poste visé: {poste}.\n"
            f"Entreprise: {entreprise}.\n"
            f"Années d'expérience: {annees}.\n"
            f"Compétences clés: {comp_texte}.\n"
            f"Exemple d'expérience (à transformer en réalisation concrète): {premiere_exp}.\n"
            f"Texte candidat (à synthétiser): {extra_short}.\n\n"
            "Contraintes strictes: 3 paragraphes, pas de répétition, phrases courtes, privilégier verbes d'action et résultats chiffrés si présents. Retourne uniquement le texte de la lettre, sans préambule ni explication."
        )

        # Si le candidat fournit très peu d'information, générer une lettre plus concise
        if len(extra_short) < 40:
            prompt += (
                "\nNote: le candidat a fourni une motivation courte. Rédige une version concise (1-2 paragraphes max), claire et synthétique."
            )
        

        try:
            resp = ask_ia(prompt, max_tokens=400)
            cleaned = resp.strip() if resp else ""
            if cleaned:
                cleaned = dedupe_generated_text(cleaned)
                # final safety: if result too short, ignore
                if len(cleaned) > 30:
                    return cleaned
        except Exception:
            pass
        return ""

    lettre_ai = generer_lettre_ai()

    if lettre_ai:
        lettre = lettre_ai
    else:
        # Template de fallback
        lettre = f"""Madame, Monsieur,

Je vous adresse ma candidature pour le poste de {poste_e} au sein de {entreprise_e}.

Fort de {annees} années d'expérience, je maîtrise : {comp_texte}.

{premiere_exp}

{extra_e if extra_e else "Dynamique et rigoureux, je souhaite mettre mes compétences au service de votre entreprise."}

Dans l'attente de votre retour, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

{nom_e}
"""
    
    # Génération du PDF
    fd, path = tempfile.mkstemp(suffix=".pdf", prefix="lettre_")
    os.close(fd)
    
    html_content = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>@page {{ margin: 2cm; }} body {{ font-family: Arial; line-height: 1.5; max-width: 600px; margin: auto; }}</style>
<body>
<div><b>{nom_e}</b><br>{email_e} | {tel_e}</div>
<div style="text-align: right;">{datetime.now().strftime('%d/%m/%Y')}</div>
<p><b>Objet: Candidature {poste_e}</b></p>
<div>{lettre.replace(chr(10), '<br>')}</div>
<div>Cordialement,<br>{nom_e}</div>
</body></html>"""
    
    HTML(string=html_content).write_pdf(path)
    return path
