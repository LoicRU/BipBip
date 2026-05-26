[Déclenchement manuel]
        │
        ▼
┌───────────────────┐
│ 1. Ingestion      │  WeLoveDevs API (1 req/sec)
│    WeLoveDevs     │
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ 2. Normalisation  │  Nettoyage + parsing salaire/lieu
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ 3. IA Extraction  │  TinyLlama (llama-cpp-python)
│    de compétences │  < 5 sec, < 500 Mo
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ 4. Stockage       │  PostgreSQL
└─────────┬─────────┘
          │
    ┌─────┴─────┐
    ▼           ▼
┌───────┐  ┌───────┐
│ Data  │  │  IA   │  ← Déjà faite à l'ingest
│ Stats │  │(skill)│
└───────┘  └───────┘