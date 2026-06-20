-- compliance-scan-rpc.sql
-- Run in Supabase SQL Editor (or via psql).
-- These functions back the /api/internal/compliance-scan endpoint.
--
-- Created: 2026-03-15
-- Updated: 2026-03-15 — add csv_sha256 to entity_list_scans (CRO OFAC audit req)
-- Updated: 2026-03-15 — add notification_archive JSONB (CLO 7-year retention req)
-- Owner: George (CTO) — per CRO Field Specification v1.0 (2026-03-14)
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 0. entity_list_scans table ───────────────────────────────────────────────
-- Create if not exists.
-- csv_sha256:           SHA-256 of raw CSV bytes (CRO OFAC audit trail)
-- notification_archive: Full email payload JSONB (CLO 7-year retention requirement)
--
-- CLO requirement (2026-03-15): Resend and all transactional email APIs retain
-- logs for 30-90 days only — far below the 7-year compliance_overrides standard.
-- Persisting the rendered HTML + metadata here makes Supabase the authoritative
-- notification evidence store, independent of any email service retention policy.
CREATE TABLE IF NOT EXISTS entity_list_scans (
  id                    BIGSERIAL    PRIMARY KEY,
  list_version          TEXT         NOT NULL,
  entities_checked      INTEGER      NOT NULL DEFAULT 0,
  reports_scanned       INTEGER      NOT NULL DEFAULT 0,
  reports_flagged       INTEGER      NOT NULL DEFAULT 0,
  flagged_report_ids    BIGINT[]     DEFAULT '{}',
  scan_triggered_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  scan_result           TEXT         NOT NULL DEFAULT 'UNKNOWN',
                          -- 'NO_MATCHES' | 'MATCHES_FOUND' | 'ERROR'
  csv_sha256            TEXT         NULL,     -- SHA-256(raw CSV bytes, hex) — OFAC audit trail
  notification_archive  JSONB        NULL,     -- full email payload — CLO 7-year retention
                          -- shape: { sent_at, channel, recipients[], subject,
                          --          html_body, resend_ok, resend_skipped_reason? }
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Idempotent column additions (for tables that existed before this update)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'entity_list_scans' AND column_name = 'csv_sha256'
  ) THEN
    ALTER TABLE entity_list_scans ADD COLUMN csv_sha256 TEXT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'entity_list_scans' AND column_name = 'notification_archive'
  ) THEN
    ALTER TABLE entity_list_scans
      ADD COLUMN notification_archive JSONB NULL;
    COMMENT ON COLUMN entity_list_scans.notification_archive IS
      'Full email notification payload (HTML body + metadata). '
      'CLO-mandated 7-year retention (2026-03-15). '
      'Authoritative evidence record, independent of Resend log retention (~90 days).';
  END IF;
END;
$$;

-- ─── 1. find_reports_matching_entities ───────────────────────────────────────
-- Queries APPROVED reports whose sensitivity_tags contain an ENTITY tag
-- with value_normalized matching any of the provided entity names.
--
-- Uses GIN index on reports.sensitivity_tags (must be in schema.sql):
--   CREATE INDEX IF NOT EXISTS idx_reports_sensitivity_tags_gin
--     ON reports USING GIN (sensitivity_tags jsonb_path_ops);
--
-- Returns: id, title, compliance_status for each matching report.
CREATE OR REPLACE FUNCTION find_reports_matching_entities(
  entity_names TEXT[]
)
RETURNS TABLE (
  id                 BIGINT,
  title              TEXT,
  compliance_status  TEXT
)
LANGUAGE sql
STABLE
AS $$
  SELECT DISTINCT
    r.id,
    r.title,
    r.compliance_status::TEXT
  FROM reports r
  WHERE r.compliance_status = 'APPROVED'
    AND EXISTS (
      SELECT 1
      FROM jsonb_array_elements(r.sensitivity_tags) AS tag
      WHERE tag->>'value_normalized' = ANY(entity_names)
        AND tag->>'tag_type' = 'ENTITY'
    );
$$;

-- ─── 2. batch_flag_sensitivity_tags ──────────────────────────────────────────
-- Single-SQL UPDATE that annotates matching ENTITY tags with flagged_at +
-- flagged_by_list_update across ALL specified report IDs in one pass.
--
-- Design decision (per CRO question 2026-03-15):
--   Using jsonb_agg + CASE WHEN instead of per-report loop.
--   - Eliminates N round trips (critical for >100 flagged reports)
--   - Runs as a single UPDATE statement — all rows lock/unlock together
--   - Stays within same transaction when called from run_compliance_scan_tx
--   - CLO sees complete flag reason with no consistency window
--
-- Performance notes:
--   - For ~1k reports × ~50 tags: typically <200ms on standard Postgres
--   - For ~10k reports: consider batch partitioning into groups of 1000
--   - At AMORA's current scale (few hundred reports) this is comfortably fine
CREATE OR REPLACE FUNCTION batch_flag_sensitivity_tags(
  p_report_ids   BIGINT[],
  p_entity_names TEXT[],
  p_list_version TEXT,
  p_flagged_at   TIMESTAMPTZ
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE reports
  SET sensitivity_tags = (
    SELECT jsonb_agg(
      CASE
        WHEN tag->>'value_normalized' = ANY(p_entity_names)
          AND tag->>'tag_type' = 'ENTITY'
        THEN tag
          || jsonb_build_object(
               'flagged_at',             to_char(p_flagged_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
               'flagged_by_list_update', p_list_version
             )
        ELSE tag
      END
    )
    FROM jsonb_array_elements(sensitivity_tags) AS tag
  )
  WHERE id = ANY(p_report_ids);
END;
$$;

-- ─── 3. run_compliance_scan_tx ────────────────────────────────────────────────
-- Atomic wrapper: runs report status update + tag flagging + audit insert
-- in a single transaction. Returns the new entity_list_scans.id as JSON.
--
-- Updated 2026-03-15: accepts p_csv_sha256 for OFAC audit trail.
-- Updated 2026-03-15: accepts p_notification_archive JSONB for CLO 7-year retention.
--   NOTE: notification_archive is passed AFTER the notification send completes in
--   the application layer (POST /api/internal/compliance-scan step 8).
--   The RPC inserts a NULL placeholder; the app layer UPDATEs it after send.
--   This is by design — the archive must contain the actual send result (resend_ok).
--
-- Called by /api/internal/compliance-scan when available.
-- Falls back to sequential Supabase JS calls if this RPC is not deployed.
CREATE OR REPLACE FUNCTION run_compliance_scan_tx(
  p_report_ids              BIGINT[],
  p_entity_names            TEXT[],
  p_list_version            TEXT,
  p_now                     TIMESTAMPTZ,
  p_entities_checked        INTEGER,
  p_csv_sha256              TEXT    DEFAULT NULL,
  p_notification_archive    JSONB   DEFAULT NULL   -- nullable; app layer UPDATEs after send
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_scan_id BIGINT;
BEGIN
  -- Step 1: Bulk-update report compliance_status + flag metadata
  UPDATE reports
  SET
    compliance_status       = 'FLAGGED_PENDING_REVIEW',
    flagged_at              = p_now::TEXT,
    flagged_by_list_update  = p_list_version
  WHERE id = ANY(p_report_ids);

  -- Step 2: Batch JSONB tag annotation (single SQL, no per-report loop)
  PERFORM batch_flag_sensitivity_tags(
    p_report_ids,
    p_entity_names,
    p_list_version,
    p_now
  );

  -- Step 3: Insert audit record
  INSERT INTO entity_list_scans (
    list_version,
    entities_checked,
    reports_scanned,
    reports_flagged,
    flagged_report_ids,
    scan_triggered_at,
    scan_result,
    csv_sha256,
    notification_archive
  ) VALUES (
    p_list_version,
    p_entities_checked,
    array_length(p_report_ids, 1),
    array_length(p_report_ids, 1),
    p_report_ids,
    p_now,
    'MATCHES_FOUND',
    p_csv_sha256,
    p_notification_archive   -- NULL at insert time; app UPDATEs after send
  )
  RETURNING id INTO v_scan_id;

  RETURN jsonb_build_object('scan_id', v_scan_id);
END;
$$;

-- ─── 4. Add columns to reports table if missing ────────────────────────────────
-- flagged_at, flagged_by_list_update: set by compliance-scan, cleared on resolution.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'flagged_at'
  ) THEN
    ALTER TABLE reports ADD COLUMN flagged_at TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'flagged_by_list_update'
  ) THEN
    ALTER TABLE reports ADD COLUMN flagged_by_list_update TEXT;
  END IF;
END;
$$;

-- ─── 5. GIN index on sensitivity_tags (if not already created) ────────────────
CREATE INDEX IF NOT EXISTS idx_reports_sensitivity_tags_gin
  ON reports USING GIN (sensitivity_tags jsonb_path_ops);

-- ─── 6. Grant execute permissions to service role ────────────────────────────
GRANT EXECUTE ON FUNCTION find_reports_matching_entities(TEXT[])
  TO service_role;

GRANT EXECUTE ON FUNCTION batch_flag_sensitivity_tags(BIGINT[], TEXT[], TEXT, TIMESTAMPTZ)
  TO service_role;

-- run_compliance_scan_tx now has two optional params — grant on the full signature
GRANT EXECUTE ON FUNCTION run_compliance_scan_tx(BIGINT[], TEXT[], TEXT, TIMESTAMPTZ, INTEGER, TEXT, JSONB)
  TO service_role;
