ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "name" TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'active';

DO $$
DECLARE
  user_role_id INTEGER;
  tech_role_id INTEGER;
BEGIN
  SELECT id INTO user_role_id FROM "roles" WHERE "name" = 'user' LIMIT 1;
  SELECT id INTO tech_role_id FROM "roles" WHERE "name" = 'tech' LIMIT 1;

  IF user_role_id IS NOT NULL AND tech_role_id IS NULL THEN
    UPDATE "roles"
    SET "name" = 'tech', "updated_at" = NOW()
    WHERE id = user_role_id;
  ELSIF user_role_id IS NOT NULL AND tech_role_id IS NOT NULL THEN
    UPDATE "users"
    SET "role_id" = tech_role_id
    WHERE "role_id" = user_role_id;

    DELETE FROM "roles" WHERE id = user_role_id;
  END IF;

  INSERT INTO "roles" ("name", "created_at", "updated_at")
  SELECT 'tech', NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM "roles" WHERE "name" = 'tech');

  INSERT INTO "roles" ("name", "created_at", "updated_at")
  SELECT 'recruiter', NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM "roles" WHERE "name" = 'recruiter');

  INSERT INTO "roles" ("name", "created_at", "updated_at")
  SELECT 'admin', NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM "roles" WHERE "name" = 'admin');
END $$;

ALTER TABLE "offers"
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN IF NOT EXISTS "owner_id" INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'offers_owner_id_fkey'
  ) THEN
    ALTER TABLE "offers"
    ADD CONSTRAINT "offers_owner_id_fkey"
    FOREIGN KEY ("owner_id") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "users_status_idx" ON "users"("status");
CREATE INDEX IF NOT EXISTS "offers_status_idx" ON "offers"("status");
CREATE INDEX IF NOT EXISTS "offers_owner_id_idx" ON "offers"("owner_id");

CREATE TABLE IF NOT EXISTS "applications" (
  "id" SERIAL PRIMARY KEY,
  "offer_id" INTEGER NOT NULL,
  "applicant_id" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "candidate_name" TEXT NOT NULL,
  "candidate_email" TEXT NOT NULL,
  "candidate_phone" TEXT,
  "cover_letter" TEXT NOT NULL DEFAULT '',
  "cv" TEXT NOT NULL DEFAULT '',
  "ai_interview" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "applications_offer_id_fkey"
    FOREIGN KEY ("offer_id") REFERENCES "offers"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "applications_applicant_id_fkey"
    FOREIGN KEY ("applicant_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "applications_offer_id_applicant_id_key"
ON "applications"("offer_id", "applicant_id");

CREATE INDEX IF NOT EXISTS "applications_offer_id_status_idx"
ON "applications"("offer_id", "status");

CREATE INDEX IF NOT EXISTS "applications_applicant_id_idx"
ON "applications"("applicant_id");

CREATE TABLE IF NOT EXISTS "favorites" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "offer_id" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "favorites_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "favorites_offer_id_fkey"
    FOREIGN KEY ("offer_id") REFERENCES "offers"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "favorites_user_id_offer_id_key"
ON "favorites"("user_id", "offer_id");

CREATE INDEX IF NOT EXISTS "favorites_offer_id_idx"
ON "favorites"("offer_id");

CREATE TABLE IF NOT EXISTS "support_tickets" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "subject" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'open',
  "resolved_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "support_tickets_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "support_tickets_status_idx"
ON "support_tickets"("status");

CREATE INDEX IF NOT EXISTS "support_tickets_user_id_idx"
ON "support_tickets"("user_id");

CREATE TABLE IF NOT EXISTS "reports" (
  "id" SERIAL PRIMARY KEY,
  "type" TEXT NOT NULL,
  "title" TEXT,
  "company" TEXT,
  "description" TEXT,
  "reason" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "reporter_user_id" INTEGER,
  "reported_user_id" INTEGER,
  "offer_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "reports_reporter_user_id_fkey"
    FOREIGN KEY ("reporter_user_id") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "reports_reported_user_id_fkey"
    FOREIGN KEY ("reported_user_id") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "reports_offer_id_fkey"
    FOREIGN KEY ("offer_id") REFERENCES "offers"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "reports_type_status_idx"
ON "reports"("type", "status");

CREATE INDEX IF NOT EXISTS "reports_offer_id_idx"
ON "reports"("offer_id");

CREATE INDEX IF NOT EXISTS "reports_reported_user_id_idx"
ON "reports"("reported_user_id");
