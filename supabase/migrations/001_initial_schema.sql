-- =============================================================================
-- Uraan Web Platform — Initial Database Schema
-- Migration: 001_initial_schema.sql
-- Run via: Supabase Dashboard > SQL Editor, or `npx supabase db push`
-- =============================================================================

-- ── Extensions ────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- fuzzy / full-text search support

-- =============================================================================
-- TABLE: orphanages
-- Primary table. Stores every orphanage in Lahore regardless of visit status.
-- =============================================================================

CREATE TABLE orphanages (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                TEXT NOT NULL,
    slug                TEXT UNIQUE NOT NULL,
    address             TEXT NOT NULL,
    area                TEXT NOT NULL,
    city                TEXT NOT NULL DEFAULT 'Lahore',
    latitude            NUMERIC(10, 7),
    longitude           NUMERIC(10, 7),
    is_registered       BOOLEAN NOT NULL DEFAULT FALSE,
    registration_number TEXT,
    registration_body   TEXT,
    org_type            TEXT NOT NULL
                        CHECK (org_type IN ('government', 'ngo', 'volunteer', 'religious', 'other')),
    children_count      INTEGER,
    age_range           TEXT,
    gender_served       TEXT CHECK (gender_served IN ('male', 'female', 'both')),
    contact_name        TEXT,
    contact_phone       TEXT,
    contact_email       TEXT,
    website             TEXT,
    accepts_donations   BOOLEAN NOT NULL DEFAULT FALSE,
    donation_details    TEXT,
    accepts_volunteers  BOOLEAN NOT NULL DEFAULT FALSE,
    volunteer_details   TEXT,
    uraan_visited       BOOLEAN NOT NULL DEFAULT FALSE,
    visit_count         INTEGER NOT NULL DEFAULT 0,
    last_visited_at     DATE,
    is_verified         BOOLEAN NOT NULL DEFAULT FALSE,
    verified_by         TEXT,
    verified_at         TIMESTAMPTZ,
    notes               TEXT,
    cover_image_url     TEXT,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX idx_orphanages_area         ON orphanages(area);
CREATE INDEX idx_orphanages_visited      ON orphanages(uraan_visited);
CREATE INDEX idx_orphanages_registered   ON orphanages(is_registered);
CREATE INDEX idx_orphanages_active       ON orphanages(is_active);
CREATE INDEX idx_orphanages_org_type     ON orphanages(org_type);
CREATE INDEX idx_orphanages_search       ON orphanages
    USING gin(to_tsvector('english', name || ' ' || area || ' ' || address));

-- =============================================================================
-- TABLE: projects
-- Must exist before visits (visits.project_id references it)
-- =============================================================================

CREATE TABLE projects (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title               TEXT NOT NULL,
    slug                TEXT UNIQUE NOT NULL,
    tagline             TEXT,
    description         TEXT NOT NULL,
    date_start          DATE NOT NULL,
    date_end            DATE,
    duration_label      TEXT,
    institutions        TEXT[],
    collaborators       TEXT[],
    children_reached    INTEGER,
    volunteer_count     INTEGER,
    hours_delivered     NUMERIC(6, 1),
    skills_taught       TEXT[],
    cover_image_url     TEXT,
    gallery_urls        TEXT[],
    impact_metrics      JSONB,
    is_published        BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order          INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_published  ON projects(is_published);
CREATE INDEX idx_projects_date_start ON projects(date_start DESC);
CREATE INDEX idx_projects_slug       ON projects(slug);

-- =============================================================================
-- TABLE: visits
-- Each Uraan visit to an orphanage. Triggers update orphanage stats on insert.
-- =============================================================================

CREATE TABLE visits (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    orphanage_id        UUID NOT NULL REFERENCES orphanages(id) ON DELETE CASCADE,
    project_id          UUID REFERENCES projects(id) ON DELETE SET NULL,
    visit_date          DATE NOT NULL,
    duration_hours      NUMERIC(4, 1),
    volunteer_count     INTEGER,
    activities          TEXT[],
    outcomes            TEXT[],
    children_engaged    INTEGER,
    lead_volunteer      TEXT,
    report_url          TEXT,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_visits_orphanage ON visits(orphanage_id);
CREATE INDEX idx_visits_date      ON visits(visit_date DESC);
CREATE INDEX idx_visits_project   ON visits(project_id);

-- =============================================================================
-- TABLE: team_members
-- =============================================================================

CREATE TABLE team_members (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name           TEXT NOT NULL,
    role                TEXT NOT NULL,
    department          TEXT,
    batch               TEXT,
    bio                 TEXT,
    photo_url           TEXT,
    phone               TEXT,
    linkedin_url        TEXT,
    joined_date         DATE,
    left_date           DATE,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    is_founding_member  BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order          INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_team_active     ON team_members(is_active);
CREATE INDEX idx_team_sort_order ON team_members(sort_order);

-- =============================================================================
-- TABLE: partners
-- =============================================================================

CREATE TABLE partners (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                TEXT NOT NULL,
    type                TEXT NOT NULL
                        CHECK (type IN ('ngo', 'orphanage', 'corporate', 'university', 'government', 'other')),
    description         TEXT,
    contact_name        TEXT,
    contact_phone       TEXT,
    contact_email       TEXT,
    website             TEXT,
    logo_url            TEXT,
    is_verified         BOOLEAN NOT NULL DEFAULT FALSE,
    registration_number TEXT,
    notes               TEXT,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_partners_active ON partners(is_active);

-- =============================================================================
-- FUNCTION: update_updated_at
-- Automatically updates the updated_at column on any row change.
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER orphanages_updated_at
    BEFORE UPDATE ON orphanages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER visits_updated_at
    BEFORE UPDATE ON visits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER team_members_updated_at
    BEFORE UPDATE ON team_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER partners_updated_at
    BEFORE UPDATE ON partners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- FUNCTION: sync_orphanage_visit_stats
-- Keeps orphanages.visit_count, uraan_visited, and last_visited_at in sync
-- whenever a visit record is inserted, updated, or deleted.
-- =============================================================================

CREATE OR REPLACE FUNCTION sync_orphanage_visit_stats()
RETURNS TRIGGER AS $$
DECLARE
    target_id UUID;
BEGIN
    -- On DELETE, NEW is NULL — use OLD instead
    IF TG_OP = 'DELETE' THEN
        target_id := OLD.orphanage_id;
    ELSE
        target_id := NEW.orphanage_id;
    END IF;

    UPDATE orphanages SET
        visit_count     = (SELECT COUNT(*)        FROM visits WHERE orphanage_id = target_id),
        uraan_visited   = (SELECT COUNT(*) > 0    FROM visits WHERE orphanage_id = target_id),
        last_visited_at = (SELECT MAX(visit_date) FROM visits WHERE orphanage_id = target_id),
        updated_at      = NOW()
    WHERE id = target_id;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER visits_sync_orphanage
    AFTER INSERT OR UPDATE OR DELETE ON visits
    FOR EACH ROW EXECUTE FUNCTION sync_orphanage_visit_stats();

-- =============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- Public: SELECT only on active/published rows (anon key).
-- Writes: Only via service_role key in API routes (bypasses RLS entirely).
-- =============================================================================

ALTER TABLE orphanages   ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits       ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects     ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners     ENABLE ROW LEVEL SECURITY;

-- Public read policies (anon role)
CREATE POLICY "public_read_orphanages"
    ON orphanages FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "public_read_visits"
    ON visits FOR SELECT
    USING (TRUE);

CREATE POLICY "public_read_projects"
    ON projects FOR SELECT
    USING (is_published = TRUE);

CREATE POLICY "public_read_team"
    ON team_members FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "public_read_partners"
    ON partners FOR SELECT
    USING (is_active = TRUE);

-- No INSERT / UPDATE / DELETE policies for anon role.
-- All writes go through service_role key in /app/api/v1/* route handlers.
