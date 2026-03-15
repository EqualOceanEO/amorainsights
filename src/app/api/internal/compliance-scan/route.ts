/**
 * /api/internal/compliance-scan
 *
 * Internal endpoint for CRO to push entity-list diff CSVs and trigger
 * automated compliance scanning against published reports.
 *
 * Designed per CRO Field Specification v1.0 (2026-03-14).
 * Updated 2026-03-15: CSV SHA-256 audit hash + email notification (Resend).
 * Updated 2026-03-15: 7-year notification archive in entity_list_scans (CLO requirement).
 * Security: requires INTERNAL_API_SECRET header — never expose to public.
 *
 * POST body: multipart/form-data
 *   - file:                CSV buffer (entity list diff)
 *   - list_version:        ISO date string e.g. "2026-03-14" (optional, fallback: today)
 *   - notification_channel: "email" | "none"  (optional, fallback: "email")
 *
 * Flow:
 *   1. Auth check (INTERNAL_API_SECRET)
 *   2. Parse CSV + compute SHA-256 of raw CSV bytes (OFAC audit trail)
 *   3. Extract normalized entity names from CSV
 *   4. Query APPROVED reports with matching ENTITY tags (GIN-indexed JSONB)
 *   5. Within a single transaction:
 *        a. Bulk-update report compliance_status → FLAGGED_PENDING_REVIEW
 *        b. Bulk-update sensitivity_tags (single SQL, no per-report loop)
 *        c. Insert entity_list_scans audit record (includes csv_sha256)
 *   6. Trigger CLO+CRO notification (email via Resend, or skip if "none")
 *   7. Return summary JSON
 *
 * Environment variables required:
 *   INTERNAL_API_SECRET   — hex secret for auth
 *   RESEND_API_KEY        — Resend email API key (only needed for email notifications)
 *   COMPLIANCE_NOTIFY_CLO — CLO email address (e.g. clo@amora.com)
 *   COMPLIANCE_NOTIFY_CRO — CRO email address (e.g. cro@amora.com)
 *   COMPLIANCE_ADMIN_URL  — base URL of compliance admin panel (e.g. https://admin.amora.com)
 *
 * Design note (step 5b):
 *   tag-level flagged_at uses single-SQL jsonb_agg + CASE WHEN across all
 *   flagged reports. No per-report loop, no async queue. Stays in same transaction.
 *   At AMORA's current scale (<1k reports) this is <50ms. If ever >50k reports,
 *   consider pg_background / pgmq queue then.
 *
 * SHA-256 audit note (per CRO 2026-03-15):
 *   Raw CSV bytes are hashed before parsing. The hash is stored in
 *   entity_list_scans.csv_sha256. For OFAC audits, this proves which exact
 *   entity list was used in any given scan, independently of timestamps.
 *
 * 7-year notification archive (per CLO 2026-03-15):
 *   Resend (and all transactional email APIs) retain logs for 30–90 days only.
 *   To satisfy CLO's 7-year audit requirement (matching compliance_overrides),
 *   every notification email's HTML body + metadata is stored in
 *   entity_list_scans.notification_archive (JSONB).
 *
 *   This column is the authoritative evidence record — independent of whether
 *   the external email service retains the sent message. The Supabase table
 *   inherits the platform's 7-year soft-delete retention policy.
 *
 *   Archive payload structure:
 *     { sent_at, recipients, subject, html_body, resend_ok, channel }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { supabase } from '@/lib/db';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CsvEntityRow {
  entity_name: string;
  entity_name_normalized: string;
  list_type: string;
  list_date: string;
  country_code: string;
  eccn_code: string;
  notes: string;
}

type NotificationChannel = 'email' | 'none';

/**
 * Notification archive payload stored in entity_list_scans.notification_archive.
 * Persisted independently of the external email service's retention policy.
 * Required by CLO for 7-year compliance audit trail (2026-03-15).
 */
interface NotificationArchive {
  sent_at: string;           // ISO 8601
  channel: NotificationChannel;
  recipients: string[];      // email addresses notified
  subject: string;
  html_body: string;         // full rendered HTML — the authoritative record
  resend_ok: boolean;        // whether Resend API accepted the send
  resend_skipped_reason?: string; // populated when resend_ok=false
}

interface ScanResult {
  listVersion: string;
  csvSha256: string;
  entitiesProcessed: number;
  reportsScanned: number;
  reportsFlagged: number;
  flaggedReportIds: number[];
  scanId: number | null;
  notificationSent: boolean;
}

interface FlaggedReport {
  id: number;
  title: string;
  compliance_status: string;
}

// ─── CSV parser ───────────────────────────────────────────────────────────────

/**
 * Minimal CSV parser — handles quoted fields and comma-separated values.
 * Does NOT handle multiline quoted fields (not needed for entity list format).
 */
function parseCsv(raw: string): CsvEntityRow[] {
  const lines = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]).map(h => h.trim().toLowerCase());

  const rows: CsvEntityRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = splitCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (values[idx] ?? '').trim();
    });

    const rawName = row['entity_name'] ?? '';
    const normalizedFromCsv = row['entity_name_normalized'] ?? '';
    const normalized = normalizedFromCsv || normalizeEntityName(rawName);

    if (!normalized) continue;

    rows.push({
      entity_name: rawName,
      entity_name_normalized: normalized,
      list_type: row['list_type'] ?? '',
      list_date: row['list_date'] ?? '',
      country_code: row['country_code'] ?? '',
      eccn_code: row['eccn_code'] ?? '',
      notes: row['notes'] ?? '',
    });
  }
  return rows;
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

/**
 * Normalize entity name: uppercase + strip punctuation/special chars + collapse whitespace.
 * Must match normalization applied when reports are saved (db.ts / report creation).
 */
function normalizeEntityName(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Auth check ───────────────────────────────────────────────────────────────

function isAuthorized(req: NextRequest): boolean {
  const secret = req.headers.get('x-internal-api-secret');
  const expected = process.env.INTERNAL_API_SECRET;
  if (!expected) {
    if (process.env.NODE_ENV === 'production') return false;
    console.warn('[compliance-scan] INTERNAL_API_SECRET not set — allowing in dev mode');
    return true;
  }
  return secret === expected;
}

// ─── SHA-256 hash ─────────────────────────────────────────────────────────────

/**
 * Compute SHA-256 of the raw CSV string (hex encoding).
 * Stored in entity_list_scans.csv_sha256 for OFAC audit trail.
 * Node.js crypto is available in Next.js API routes.
 */
function computeCsvHash(rawCsv: string): string {
  return createHash('sha256').update(rawCsv, 'utf8').digest('hex');
}

// ─── Email notification ───────────────────────────────────────────────────────

/**
 * Build the compliance notification email body (HTML).
 * Does NOT reveal entity-list details or sanction reason to avoid
 * inadvertent disclosure outside of secure CLO/CRO context.
 */
function buildEmailHtml(
  flaggedReports: FlaggedReport[],
  listVersion: string,
  scanTriggeredAt: string,
  csvSha256: string,
  adminBaseUrl: string,
): string {
  const reportRows = flaggedReports
    .map(
      r => `<tr>
        <td style="padding:4px 12px;border-bottom:1px solid #e5e7eb;">${r.id}</td>
        <td style="padding:4px 12px;border-bottom:1px solid #e5e7eb;">${r.title}</td>
        <td style="padding:4px 12px;border-bottom:1px solid #e5e7eb;">${r.compliance_status}</td>
        <td style="padding:4px 12px;border-bottom:1px solid #e5e7eb;">
          <a href="${adminBaseUrl}/compliance/reports/${r.id}" style="color:#1d4ed8;">Review →</a>
        </td>
      </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Compliance Scan Alert</title></head>
<body style="font-family:system-ui,sans-serif;color:#111;max-width:680px;margin:0 auto;padding:24px;">
  <h2 style="color:#dc2626;margin-bottom:4px;">⚠️ Compliance Scan — Entity List Match Detected</h2>
  <p style="color:#6b7280;margin-top:4px;font-size:13px;">
    This is an automated internal alert. Do not forward externally.
  </p>
  <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px;">
    <tr>
      <td style="padding:6px 12px;font-weight:600;width:180px;">Scan triggered at</td>
      <td style="padding:6px 12px;">${scanTriggeredAt}</td>
    </tr>
    <tr style="background:#f9fafb;">
      <td style="padding:6px 12px;font-weight:600;">List version</td>
      <td style="padding:6px 12px;">${listVersion}</td>
    </tr>
    <tr>
      <td style="padding:6px 12px;font-weight:600;">Reports flagged</td>
      <td style="padding:6px 12px;color:#dc2626;font-weight:700;">${flaggedReports.length}</td>
    </tr>
    <tr style="background:#f9fafb;">
      <td style="padding:6px 12px;font-weight:600;">CSV SHA-256</td>
      <td style="padding:6px 12px;font-family:monospace;font-size:12px;color:#6b7280;">${csvSha256}</td>
    </tr>
  </table>

  <h3 style="margin-bottom:8px;">Flagged Reports</h3>
  <table style="width:100%;border-collapse:collapse;font-size:13px;">
    <thead>
      <tr style="background:#f3f4f6;text-align:left;">
        <th style="padding:6px 12px;">ID</th>
        <th style="padding:6px 12px;">Title</th>
        <th style="padding:6px 12px;">Prior Status</th>
        <th style="padding:6px 12px;">Action</th>
      </tr>
    </thead>
    <tbody>${reportRows}</tbody>
  </table>

  <p style="margin-top:24px;">
    <a href="${adminBaseUrl}/compliance" style="background:#1d4ed8;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;">
      Open Compliance Admin Panel →
    </a>
  </p>
  <p style="font-size:11px;color:#9ca3af;margin-top:32px;">
    Sent by Amora internal compliance-scan service. Dual-sign required (CLO + CRO) before any resolution action.
  </p>
</body>
</html>`;
}

/**
 * Send compliance notification to CLO + CRO via Resend.
 * Returns a NotificationArchive record — caller persists this to DB
 * regardless of whether the send succeeded, satisfying CLO's 7-year
 * retention requirement independently of Resend's ~90-day log window.
 *
 * notificationChannel: 'email' | 'none'
 *   Future channels (Slack webhook, internal messaging) can be added here
 *   without changing caller signatures — just extend the switch block.
 */
async function notifyComplianceTeam(
  flaggedReports: FlaggedReport[],
  listVersion: string,
  scanTriggeredAt: string,
  csvSha256: string,
  channel: NotificationChannel,
): Promise<NotificationArchive> {
  const cloEmail  = process.env.COMPLIANCE_NOTIFY_CLO ?? '';
  const croEmail  = process.env.COMPLIANCE_NOTIFY_CRO ?? '';
  const adminUrl  = process.env.COMPLIANCE_ADMIN_URL ?? 'https://amora.com/admin';
  const recipients = [cloEmail, croEmail].filter(Boolean);

  const subject = flaggedReports.length === 1 && flaggedReports[0].id === 0
    ? `[AMORA Compliance Reminder] No entity-list scan this week — ${listVersion}`
    : `[AMORA Compliance Alert] ${flaggedReports.length} report(s) flagged — list update ${listVersion}`;

  const htmlBody = buildEmailHtml(flaggedReports, listVersion, scanTriggeredAt, csvSha256, adminUrl);

  // Base archive — always built, even if send is skipped
  const archive: NotificationArchive = {
    sent_at:    scanTriggeredAt,
    channel,
    recipients,
    subject,
    html_body:  htmlBody,
    resend_ok:  false,
  };

  if (channel === 'none') {
    archive.resend_skipped_reason = 'channel=none';
    console.log(`[compliance-scan] Notification suppressed (channel=none). Archive saved to DB.`);
    return archive;
  }

  if (flaggedReports.length === 0) {
    archive.resend_skipped_reason = 'no_flagged_reports';
    return archive;
  }

  // ── email channel ──────────────────────────────────────────────────────────
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey || recipients.length === 0) {
    archive.resend_skipped_reason = 'missing_env_vars';
    console.warn(
      '[compliance-scan] Email notification skipped: RESEND_API_KEY / COMPLIANCE_NOTIFY_CLO / COMPLIANCE_NOTIFY_CRO not configured.',
      'Archive saved to DB — notify CLO+CRO manually.',
    );
    return archive;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    'Amora Compliance <no-reply@amora.com>',
        to:      recipients,
        subject,
        html:    htmlBody,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      archive.resend_skipped_reason = `resend_api_error:${response.status}:${errText.slice(0, 200)}`;
      console.error(`[compliance-scan] Email send failed (${response.status}): ${errText}`);
    } else {
      archive.resend_ok = true;
      console.log(`[compliance-scan] Notification email sent to: ${recipients.join(', ')}`);
    }
  } catch (err) {
    archive.resend_skipped_reason = `exception:${(err as Error).message}`;
    console.error('[compliance-scan] Email send threw:', (err as Error).message);
  }

  return archive;
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Auth check
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse multipart form data
  let csvBuffer: string;
  let listVersion: string;
  let notificationChannel: NotificationChannel;

  try {
    const formData = await req.formData();
    const file               = formData.get('file');
    const listVersionField   = formData.get('list_version');
    const channelField       = formData.get('notification_channel');

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid file field — expected CSV upload' },
        { status: 400 },
      );
    }

    csvBuffer = await (file as File).text();
    listVersion = (typeof listVersionField === 'string' && listVersionField.trim())
      ? listVersionField.trim()
      : new Date().toISOString().split('T')[0];

    const rawChannel = typeof channelField === 'string' ? channelField.trim() : 'email';
    notificationChannel = (rawChannel === 'none') ? 'none' : 'email';
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to parse request: ${(err as Error).message}` },
      { status: 400 },
    );
  }

  // 3. SHA-256 of raw CSV (before parsing — OFAC audit trail)
  const csvSha256 = computeCsvHash(csvBuffer);

  // 4. Parse CSV → extract normalized entity names
  const csvRows = parseCsv(csvBuffer);
  if (csvRows.length === 0) {
    return NextResponse.json(
      { error: 'CSV is empty or contains no valid entity rows' },
      { status: 400 },
    );
  }

  const newEntities: string[] = [...new Set(csvRows.map(r => r.entity_name_normalized))];
  const nowIso = new Date().toISOString();

  // 5. Query APPROVED reports with matching ENTITY tags (GIN-indexed JSONB)
  const { data: rpcReports, error: queryError } = await supabase.rpc(
    'find_reports_matching_entities',
    { entity_names: newEntities },
  );

  let reportsToFlag: FlaggedReport[] = [];

  if (queryError) {
    // RPC not available — client-side fallback (for local dev)
    console.warn('[compliance-scan] RPC not available, using raw query fallback:', queryError.message);

    const { data: rawReports, error: rawError } = await supabase
      .from('reports')
      .select('id, title, compliance_status, sensitivity_tags')
      .eq('compliance_status', 'APPROVED');

    if (rawError) {
      return NextResponse.json(
        { error: `Failed to query reports: ${rawError.message}` },
        { status: 500 },
      );
    }

    const entitySet = new Set(newEntities);
    reportsToFlag = (rawReports ?? []).filter((report) => {
      const tags = report.sensitivity_tags as Array<{ tag_type: string; value_normalized: string }> ?? [];
      return tags.some(tag => tag.tag_type === 'ENTITY' && entitySet.has(tag.value_normalized));
    });
  } else {
    reportsToFlag = (rpcReports ?? []) as FlaggedReport[];
  }

  // ── No matches path ────────────────────────────────────────────────────────
  if (reportsToFlag.length === 0) {
    // Still archive a notification record (channel=none, no reports) for audit completeness
    const noMatchArchive: NotificationArchive = {
      sent_at:               nowIso,
      channel:               notificationChannel,
      recipients:            [],
      subject:               `[AMORA Compliance Scan] No matches — list update ${listVersion}`,
      html_body:             '',
      resend_ok:             false,
      resend_skipped_reason: 'no_flagged_reports',
    };

    const { data: scanRecord } = await supabase
      .from('entity_list_scans')
      .insert({
        list_version:          listVersion,
        entities_checked:      newEntities.length,
        reports_scanned:       0,
        reports_flagged:       0,
        scan_triggered_at:     nowIso,
        scan_result:           'NO_MATCHES',
        csv_sha256:            csvSha256,
        notification_archive:  noMatchArchive,
      })
      .select('id')
      .single();

    const result: ScanResult = {
      listVersion,
      csvSha256,
      entitiesProcessed: newEntities.length,
      reportsScanned:    0,
      reportsFlagged:    0,
      flaggedReportIds:  [],
      scanId:            scanRecord?.id ?? null,
      notificationSent:  false,
    };
    return NextResponse.json(result);
  }

  const reportIds = reportsToFlag.map(r => r.id);

  // 6. Transactional updates (atomic RPC path, with sequential fallback for local dev)
  let scanId: number | null = null;

  try {
    const { data: txResult, error: txError } = await supabase.rpc(
      'run_compliance_scan_tx',
      {
        p_report_ids:       reportIds,
        p_entity_names:     newEntities,
        p_list_version:     listVersion,
        p_now:              nowIso,
        p_entities_checked: newEntities.length,
        p_csv_sha256:       csvSha256,
      },
    );

    if (txError) {
      console.warn('[compliance-scan] Transactional RPC not available, using sequential fallback:', txError.message);
      await runSequentialUpdates(reportIds, newEntities, listVersion, nowIso);
    } else {
      scanId = (txResult as { scan_id: number } | null)?.scan_id ?? null;
    }
  } catch (err) {
    return NextResponse.json(
      { error: `Scan transaction failed: ${(err as Error).message}` },
      { status: 500 },
    );
  }

  // Insert audit record if RPC didn't handle it
  if (scanId === null) {
    const { data: scanRecord } = await supabase
      .from('entity_list_scans')
      .insert({
        list_version:       listVersion,
        entities_checked:   newEntities.length,
        reports_scanned:    reportsToFlag.length,
        reports_flagged:    reportsToFlag.length,
        scan_triggered_at:  nowIso,
        scan_result:        'MATCHES_FOUND',
        flagged_report_ids: reportIds,
        csv_sha256:         csvSha256,
        // notification_archive will be updated after send (below)
      })
      .select('id')
      .single();
    scanId = scanRecord?.id ?? null;
  }

  // 7. Notify CLO + CRO — returns full archive payload for DB persistence
  const notifArchive = await notifyComplianceTeam(
    reportsToFlag,
    listVersion,
    nowIso,
    csvSha256,
    notificationChannel,
  );

  // 8. Persist notification archive to entity_list_scans (7-year CLO retention)
  // This is the authoritative record of the notification content — independent
  // of Resend's ~90-day log retention. Stored even when send fails or is skipped.
  if (scanId !== null) {
    await supabase
      .from('entity_list_scans')
      .update({ notification_archive: notifArchive })
      .eq('id', scanId);
  }

  const result: ScanResult = {
    listVersion,
    csvSha256,
    entitiesProcessed: newEntities.length,
    reportsScanned:    reportsToFlag.length,
    reportsFlagged:    reportsToFlag.length,
    flaggedReportIds:  reportIds,
    scanId,
    notificationSent:  notifArchive.resend_ok,
  };

  return NextResponse.json(result);
}

// ─── Sequential fallback (non-atomic, for local dev without DB RPCs) ──────────

async function runSequentialUpdates(
  reportIds: number[],
  newEntities: string[],
  listVersion: string,
  nowIso: string,
): Promise<void> {
  const { error: statusError } = await supabase
    .from('reports')
    .update({
      compliance_status:       'FLAGGED_PENDING_REVIEW',
      flagged_at:              nowIso,
      flagged_by_list_update:  listVersion,
    } as Record<string, unknown>)
    .in('id', reportIds);

  if (statusError) {
    throw new Error(`Status update failed: ${statusError.message}`);
  }

  const { error: tagsError } = await supabase.rpc('batch_flag_sensitivity_tags', {
    p_report_ids:   reportIds,
    p_entity_names: newEntities,
    p_list_version: listVersion,
    p_flagged_at:   nowIso,
  });

  if (tagsError) {
    console.warn(
      '[compliance-scan] batch_flag_sensitivity_tags RPC not available.',
      'Report-level FLAGGED_PENDING_REVIEW is set. Tag-level flagged_at will need manual backfill.',
      'Error:', tagsError.message,
    );
  }
  // NOTE: audit record (entity_list_scans) is inserted by the caller (POST handler),
  // not here — so notification_archive can be included after the send completes.
}

// ─── GET: health check / last scan status + Vercel Cron dead-man switch ───────
//
// Vercel Cron (every Friday 23:59 UTC per vercel.json) hits this endpoint via GET.
// The cron does NOT trigger a scan (no CSV = no scan). Instead it acts as a
// dead-man's switch: checks if a scan has been run this week and sends an alert
// if CRO has not yet pushed an entity-list update.
//
// Manual scans (POST with CSV) remain the primary trigger path.
// Cron is the safety net / reminder only.

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const isVercelCron = req.headers.get('x-vercel-cron') === '1';

  const { data, error } = await supabase
    .from('entity_list_scans')
    .select('id, list_version, entities_checked, reports_flagged, scan_triggered_at, scan_result, csv_sha256')
    .order('scan_triggered_at', { ascending: false })
    .limit(5);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const recentScans = data ?? [];

  // Dead-man's switch logic: check if any scan ran in the past 7 days
  if (isVercelCron) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const hasRecentScan = recentScans.some(
      scan => scan.scan_triggered_at >= sevenDaysAgo,
    );

    if (!hasRecentScan) {
      // No scan this week — notify CRO as a reminder
      const reminderArchive = await notifyComplianceTeam(
        [{
          id: 0,
          title: '— No scan triggered this week —',
          compliance_status: 'N/A',
        }],
        'REMINDER',
        new Date().toISOString(),
        'N/A',
        'email',
      );
      console.warn(
        '[compliance-scan] Cron: no entity-list scan triggered in the past 7 days.',
        `Reminder notification sent: ${reminderArchive.resend_ok}`,
      );
      return NextResponse.json({
        cron: true,
        alert: 'no_scan_this_week',
        reminderSent: reminderArchive.resend_ok,
        recentScans,
      });
    }

    console.log('[compliance-scan] Cron: scan found within last 7 days — no action needed.');
    return NextResponse.json({ cron: true, alert: null, recentScans });
  }

  // Normal health-check GET (non-cron)
  return NextResponse.json({ recentScans });
}
