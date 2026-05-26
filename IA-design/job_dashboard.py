import math
import os

import pandas as pd
import plotly.express as px
import requests
import streamlit as st


BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8000")
OFFERS_PAGE_SIZE = 100


st.set_page_config(page_title="Job Aggregator", layout="wide")
st.title("Job Aggregator")


def build_offers_url() -> str:
    return f"{BACKEND_URL.rstrip('/')}/api/offers"


def normalize_salary(value):
    if value is None:
        return None

    if isinstance(value, (int, float)):
        return float(value)

    if isinstance(value, dict):
        min_value = value.get("min")
        max_value = value.get("max")
        if min_value is not None and max_value is not None:
            return (float(min_value) + float(max_value)) / 2
        if min_value is not None:
            return float(min_value)
        if max_value is not None:
            return float(max_value)

    return None


def normalize_remote(remote_mode):
    if remote_mode is None:
        return "Unknown"

    text = str(remote_mode).strip()
    if not text:
        return "Unknown"

    lowered = text.lower()
    if lowered in {"true", "full", "fully remote", "remote", "always"}:
        return "Remote"
    if lowered in {"false", "none", "never", "on site", "onsite"}:
        return "On-site"
    if lowered in {"hybrid", "partial", "sometimes"}:
        return "Hybrid"

    return text


def normalize_offer(raw_offer):
    skills = raw_offer.get("skills") or []
    if not isinstance(skills, list):
        skills = []

    return {
        "id": raw_offer.get("id"),
        "titre": raw_offer.get("title") or "Untitled offer",
        "entreprise": raw_offer.get("companyName") or "Unknown company",
        "contrat": raw_offer.get("contractType") or "unknown",
        "lieu": raw_offer.get("location") or "Unknown location",
        "salaire": normalize_salary(raw_offer.get("salary")),
        "remote": normalize_remote(raw_offer.get("remoteMode")),
        "competences": [str(skill) for skill in skills if skill],
        "publishedAt": raw_offer.get("publishedAt"),
    }


def fetch_offers_page(page):
    response = requests.get(
        build_offers_url(),
        params={"page": page, "limit": OFFERS_PAGE_SIZE},
        timeout=10,
    )
    response.raise_for_status()
    payload = response.json()
    return payload.get("data", []), payload.get("meta", {})


@st.cache_data(ttl=300, show_spinner=False)
def load_data():
    first_page, meta = fetch_offers_page(1)

    offers = list(first_page)
    total_pages = int(meta.get("totalPages") or 1)

    for page in range(2, total_pages + 1):
        page_offers, _ = fetch_offers_page(page)
        offers.extend(page_offers)

    normalized = [normalize_offer(offer) for offer in offers]
    frame = pd.DataFrame(normalized)

    if frame.empty:
        frame = pd.DataFrame(
            columns=[
                "id",
                "titre",
                "entreprise",
                "contrat",
                "lieu",
                "salaire",
                "remote",
                "competences",
                "publishedAt",
            ]
        )

    frame["salaire"] = pd.to_numeric(frame["salaire"], errors="coerce")
    frame["competences"] = frame["competences"].apply(
        lambda value: value if isinstance(value, list) else []
    )

    return frame, meta


with st.spinner("Connexion au backend et chargement des offres..."):
    try:
        df, meta = load_data()
    except requests.RequestException as error:
        st.error(f"Backend indisponible: {error}")
        st.stop()
    except Exception as error:
        st.error(f"Chargement impossible: {error}")
        st.stop()


if df.empty:
    st.warning("Aucune offre disponible pour le moment.")
    st.stop()


st.sidebar.header("Filtres")

contracts = sorted(df["contrat"].dropna().unique().tolist())
locations = sorted(df["lieu"].dropna().unique().tolist())
remote_modes = sorted(df["remote"].dropna().unique().tolist())

selected_contracts = st.sidebar.multiselect(
    "Type de contrat",
    contracts,
    default=contracts,
)
selected_locations = st.sidebar.multiselect(
    "Localisation",
    locations,
    default=locations,
)
selected_remote = st.sidebar.multiselect(
    "Mode de travail",
    remote_modes,
    default=remote_modes,
)

salary_series = df["salaire"].dropna()
if salary_series.empty:
    salary_min = 0
    salary_max = 0
else:
    salary_min = int(salary_series.min())
    salary_max = int(salary_series.max())

selected_salary = st.sidebar.slider(
    "Salaire minimum (€)",
    min_value=salary_min,
    max_value=max(salary_min, salary_max),
    value=salary_min,
    step=1000 if salary_max >= 1000 else 1,
)

search_query = st.sidebar.text_input("Recherche poste / entreprise")

filtered_df = df[
    df["contrat"].isin(selected_contracts)
    & df["lieu"].isin(selected_locations)
    & df["remote"].isin(selected_remote)
]

if salary_series.empty:
    filtered_df = filtered_df.copy()
else:
    filtered_df = filtered_df[
        filtered_df["salaire"].isna() | (filtered_df["salaire"] >= selected_salary)
    ]

if search_query.strip():
    query = search_query.strip().lower()
    filtered_df = filtered_df[
        filtered_df["titre"].str.lower().str.contains(query)
        | filtered_df["entreprise"].str.lower().str.contains(query)
    ]


if filtered_df.empty:
    st.info("Aucune offre ne correspond aux filtres.")
    st.stop()


average_salary = filtered_df["salaire"].dropna().mean()
remote_share = (
    (filtered_df["remote"] == "Remote").mean() * 100 if not filtered_df.empty else 0
)

col1, col2, col3, col4 = st.columns(4)
col1.metric("Offres", len(filtered_df))
col2.metric(
    "Salaire moyen",
    f"{average_salary:,.0f} €" if not math.isnan(average_salary) else "N/A",
)
col3.metric("Remote complet", f"{remote_share:.0f}%")
col4.metric("Entreprises", filtered_df["entreprise"].nunique())

st.caption(
    f"Source backend: {build_offers_url()} | total backend: {meta.get('total', len(df))}"
)
st.markdown("---")


left, right = st.columns(2)

with left:
    st.subheader("Contrats")
    contract_dist = filtered_df["contrat"].value_counts().reset_index()
    contract_dist.columns = ["Contrat", "Nombre"]
    contract_fig = px.pie(contract_dist, values="Nombre", names="Contrat", hole=0.35)
    st.plotly_chart(contract_fig, use_container_width=True)

with right:
    st.subheader("Salaire par contrat")
    salary_by_contract = (
        filtered_df.dropna(subset=["salaire"])
        .groupby("contrat", as_index=False)["salaire"]
        .mean()
    )
    if salary_by_contract.empty:
        st.info("Pas assez de données salaire.")
    else:
        salary_contract_fig = px.bar(
            salary_by_contract,
            x="contrat",
            y="salaire",
            text_auto=".0f",
            color="contrat",
        )
        salary_contract_fig.update_layout(showlegend=False)
        st.plotly_chart(salary_contract_fig, use_container_width=True)


location_col, remote_col = st.columns(2)

with location_col:
    st.subheader("Salaire par localisation")
    salary_by_location = (
        filtered_df.dropna(subset=["salaire"])
        .groupby("lieu", as_index=False)["salaire"]
        .mean()
        .sort_values("salaire", ascending=False)
    )
    if salary_by_location.empty:
        st.info("Pas assez de données salaire.")
    else:
        location_fig = px.bar(
            salary_by_location,
            x="lieu",
            y="salaire",
            color="salaire",
            color_continuous_scale="Viridis",
        )
        st.plotly_chart(location_fig, use_container_width=True)

with remote_col:
    st.subheader("Répartition remote")
    remote_dist = filtered_df["remote"].value_counts().reset_index()
    remote_dist.columns = ["Mode", "Nombre"]
    remote_fig = px.bar(remote_dist, x="Mode", y="Nombre", color="Mode")
    remote_fig.update_layout(showlegend=False)
    st.plotly_chart(remote_fig, use_container_width=True)


st.subheader("Compétences les plus demandées")
all_skills = [skill for skills in filtered_df["competences"] for skill in skills]

if all_skills:
    skill_counts = pd.Series(all_skills).value_counts().head(10).reset_index()
    skill_counts.columns = ["Compétence", "Nombre"]
    skills_fig = px.bar(
        skill_counts,
        x="Nombre",
        y="Compétence",
        orientation="h",
        color="Nombre",
        color_continuous_scale="Blues",
    )
    skills_fig.update_layout(height=420)
    st.plotly_chart(skills_fig, use_container_width=True)
else:
    st.info("Aucune compétence exploitable remontée par l'API.")


st.markdown("---")
st.subheader("Liste des offres")

page_size = 10
page_count = max(1, math.ceil(len(filtered_df) / page_size))
page = st.number_input("Page", min_value=1, max_value=page_count, value=1, step=1)

start = (page - 1) * page_size
end = min(start + page_size, len(filtered_df))

display_df = filtered_df.iloc[start:end].copy()
display_df["salaire"] = display_df["salaire"].apply(
    lambda value: f"{value:,.0f} €" if pd.notna(value) else "N/A"
)
display_df["competences"] = display_df["competences"].apply(
    lambda values: ", ".join(values) if values else "-"
)

st.dataframe(
    display_df[
        [
            "titre",
            "entreprise",
            "contrat",
            "lieu",
            "remote",
            "salaire",
            "competences",
        ]
    ],
    use_container_width=True,
    column_config={
        "titre": "Poste",
        "entreprise": "Entreprise",
        "contrat": "Contrat",
        "lieu": "Localisation",
        "remote": "Remote",
        "salaire": "Salaire",
        "competences": "Compétences",
    },
)

st.caption(
    f"Affichage {start + 1}-{end} sur {len(filtered_df)} offres filtrées "
    f"({meta.get('total', len(df))} disponibles côté backend)"
)
