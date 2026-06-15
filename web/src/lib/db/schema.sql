-- RoofRadar schema — Miami-Dade roofer lead generation

CREATE TABLE IF NOT EXISTS properties (
  folio           TEXT PRIMARY KEY,
  address         TEXT NOT NULL,
  city            TEXT,
  zip             TEXT,
  year_built      INTEGER,
  assessed_value  NUMERIC,
  lat             DOUBLE PRECISION,
  lng             DOUBLE PRECISION,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_properties_zip ON properties (zip);
CREATE INDEX IF NOT EXISTS idx_properties_year_built ON properties (year_built);

CREATE TABLE IF NOT EXISTS roof_permits (
  id              TEXT PRIMARY KEY,
  folio           TEXT REFERENCES properties (folio) ON DELETE SET NULL,
  permit_number   TEXT,
  process_number  TEXT,
  address         TEXT,
  permit_type     TEXT NOT NULL,
  issue_date      DATE NOT NULL,
  status          TEXT,
  source          TEXT NOT NULL DEFAULT 'arcgis',
  raw_json        JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roof_permits_folio ON roof_permits (folio);
CREATE INDEX IF NOT EXISTS idx_roof_permits_issue_date ON roof_permits (issue_date);

CREATE TABLE IF NOT EXISTS code_violations (
  id              TEXT PRIMARY KEY,
  folio           TEXT,
  case_number     TEXT,
  address         TEXT,
  case_date       DATE,
  problem_code    TEXT,
  problem_desc    TEXT,
  status_desc     TEXT,
  case_status     TEXT,
  lat             DOUBLE PRECISION,
  lng             DOUBLE PRECISION,
  source          TEXT NOT NULL DEFAULT 'arcgis',
  raw_json        JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_violations_folio ON code_violations (folio);
CREATE INDEX IF NOT EXISTS idx_violations_case_date ON code_violations (case_date);

DO $$ BEGIN
  CREATE TYPE lead_type AS ENUM ('aging_roof', 'code_violation');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE lead_confidence AS ENUM ('high', 'medium', 'low');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS leads (
  id                  TEXT PRIMARY KEY,
  lead_type           lead_type NOT NULL,
  folio               TEXT REFERENCES properties (folio) ON DELETE CASCADE,
  address             TEXT NOT NULL,
  zip                 TEXT,
  score               INTEGER NOT NULL DEFAULT 0,
  confidence          lead_confidence NOT NULL,
  roof_age_years      NUMERIC,
  last_roof_date      DATE,
  year_built          INTEGER,
  assessed_value      NUMERIC,
  violation_case      TEXT,
  violation_desc      TEXT,
  signal_summary      TEXT NOT NULL,
  lat                 DOUBLE PRECISION,
  lng                 DOUBLE PRECISION,
  computed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (lead_type, folio)
);

CREATE INDEX IF NOT EXISTS idx_leads_type_score ON leads (lead_type, score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_zip ON leads (zip);

CREATE TABLE IF NOT EXISTS ingest_runs (
  id              SERIAL PRIMARY KEY,
  source          TEXT NOT NULL,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at     TIMESTAMPTZ,
  records_seen    INTEGER NOT NULL DEFAULT 0,
  records_upserted INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'running',
  error_message   TEXT
);

CREATE TABLE IF NOT EXISTS digest_subscribers (
  id              SERIAL PRIMARY KEY,
  email           TEXT NOT NULL UNIQUE,
  subscribed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  last_sent_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_digest_subscribers_active ON digest_subscribers (active);
