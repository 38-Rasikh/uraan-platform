-- =============================================================================
-- Migration: 002_rls_harden.sql
-- Tighten public-read policy on visits so that only visits belonging to
-- active orphanages are visible to the anon (public) role.
-- The previous USING (TRUE) policy exposed all visit records unconditionally.
-- =============================================================================

-- Replace the overly-permissive visits policy
DROP POLICY IF EXISTS "public_read_visits" ON visits;

CREATE POLICY "public_read_visits"
    ON visits FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM orphanages
            WHERE orphanages.id = visits.orphanage_id
              AND orphanages.is_active = TRUE
        )
    );
