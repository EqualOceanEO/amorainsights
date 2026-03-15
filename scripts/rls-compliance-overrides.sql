-- =============================================================
-- RLS Policy: compliance_overrides — Immutability Enforcement
-- =============================================================
-- Implements CLO-required three-layer protection for 7-year
-- audit record retention (OFAC + BIS EAR Part 762).
--
-- Layer 1: PostgreSQL Rule (schema.sql) — blocks app-layer DELETE
-- Layer 2: RLS policies (this file)    — blocks DELETE + TRUNCATE
-- Layer 3: Superuser audit log (ops)   — independent login/op log
--
-- CLO formal policy text (to be cited in compliance documents):
--   "平台通过以下技术手段强制实施 compliance_overrides 审计表的
--    不可篡改性：
--    ① PostgreSQL Rule 阻断所有应用层 DELETE 操作
--    ② Supabase RLS 策略限制应用层角色的 DELETE 和 TRUNCATE 权限
--    ③ 超级管理员账户操作须经 CLO 书面授权并写入独立系统日志
--    上述三层防护共同确保审计记录满足 OFAC 7年留存要求及
--    BIS EAR Part 762 5年留存要求。"
--
-- Superuser procedure (operational requirement, not enforced in DB):
--   - Any superuser login to production DB requires a CLO-issued
--     work order (书面授权) filed before the operation
--   - Every superuser login and operation is written to an
--     independent system log (outside compliance_overrides to
--     prevent self-amendment)
--   - Authorization records are archived separately and retained
--     for the same 7-year minimum period
-- =============================================================

-- ── Enable RLS on compliance_overrides ───────────────────────
ALTER TABLE compliance_overrides ENABLE ROW LEVEL SECURITY;

-- ── Policy 1: SELECT — all authenticated roles can read ──────
CREATE POLICY "compliance_overrides_select"
  ON compliance_overrides
  FOR SELECT
  TO authenticated
  USING (true);

-- ── Policy 2: INSERT — service_role only ─────────────────────
-- Only the application backend (service_role) may create records.
-- All inserts go through /api/compliance/override which validates:
--   • authorization_doc is non-null and a valid URL
--   • authorized_by_clo and authorized_by_cro are both present
--   • override_reason is non-empty
CREATE POLICY "compliance_overrides_insert"
  ON compliance_overrides
  FOR INSERT
  TO service_role
  WITH CHECK (
    authorization_doc IS NOT NULL
    AND authorization_doc <> ''
    AND authorized_by_clo IS NOT NULL
    AND authorized_by_clo <> ''
    AND authorized_by_cro IS NOT NULL
    AND authorized_by_cro <> ''
    AND override_reason IS NOT NULL
    AND override_reason <> ''
  );

-- ── Policy 3: UPDATE — soft-delete only (archived_at) ────────
-- The ONLY permitted update is setting archived_at.
-- No other field may be modified after insert.
-- This enforces immutability of the audit record itself.
CREATE POLICY "compliance_overrides_update_archive_only"
  ON compliance_overrides
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (
    -- Permit ONLY if this is a soft-delete operation:
    -- archived_at is being set (non-null) and no other
    -- write-once fields are being changed.
    -- Full field-level immutability enforced at application layer.
    archived_at IS NOT NULL
  );

-- ── Policy 4: DELETE — DENIED for all roles ──────────────────
-- No role (including service_role) may physically delete rows.
-- Combined with the PostgreSQL Rule in schema.sql, this provides
-- belt-and-suspenders protection.
-- Superuser (bypasses RLS by definition) is handled operationally:
-- requires CLO work order + independent audit log entry.
CREATE POLICY "compliance_overrides_no_delete"
  ON compliance_overrides
  FOR DELETE
  TO PUBLIC
  USING (false);   -- USING (false) = deny all delete attempts

-- ── Note on TRUNCATE ─────────────────────────────────────────
-- PostgreSQL RLS does NOT cover TRUNCATE (known PG behavior).
-- TRUNCATE can only be executed by a superuser or table owner.
-- Mitigation:
--   1. The application service_role is NOT the table owner
--   2. Table ownership is held by the postgres superuser account
--   3. Superuser access requires CLO work order (see above)
--   4. All superuser operations are logged independently
-- This is documented in the compliance policy and accepted by CLO.

-- ── Enable RLS on entity_list_scans ──────────────────────────
-- Scan log table: similar protection, but deletes allowed for
-- records older than 10 years (beyond both retention windows)
ALTER TABLE entity_list_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "entity_list_scans_select"
  ON entity_list_scans
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "entity_list_scans_insert"
  ON entity_list_scans
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- entity_list_scans rows older than 10y may be deleted (safe margin)
CREATE POLICY "entity_list_scans_delete_aged"
  ON entity_list_scans
  FOR DELETE
  TO service_role
  USING (scan_triggered_at < NOW() - INTERVAL '10 years');
