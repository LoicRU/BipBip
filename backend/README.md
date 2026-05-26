# Backend

Base Prisma et ingestion WeLoveDevs pour le projet.

## Fichiers

- `package.json`
  Scripts Prisma et tests data.

- `prisma/schema.prisma`
  Schema PostgreSQL avec `Role`, `User`, `Offer` et `IngestionRun`.

- `prisma/seed.js`
  Seed minimal pour creer les roles `user` et `admin`.

- `.env.example`
  Exemple de `DATABASE_URL`.

- `src/modules/ingestion/`
  Client WeLoveDevs, normalisation et script de synchronisation.

- `tests/`
  Tests de normalisation et mapping.

## Setup DB

1. Copier l'exemple d'environnement :

```bash
cp backend/.env.example backend/.env
```

2. Lancer PostgreSQL :

```bash
docker compose up -d db
```

3. Installer Prisma et generer le client :

```bash
cd backend
npm install
npx prisma generate
```

4. Creer les tables et seed les roles :

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

5. Lancer les tests data :

```bash
npm test
```

6. Lancer une synchronisation WeLoveDevs :

```bash
npm run sync:welovedevs
```

## Resultat attendu

- PostgreSQL tourne dans Docker sur le port `5432`
- Prisma cree les tables `roles`, `users`, `offers` et `ingestion_runs`
- le seed ajoute les roles `user` et `admin`
- la sync WeLoveDevs pagine les offres, respecte `1 req/s` et remplit les stats d'ingestion
