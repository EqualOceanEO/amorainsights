/**
 * Post-deploy auto-migration script.
 * 
 * Called by Vercel post-deploy or manually via:
 *   node scripts/run-migration-on-deploy.mjs <DEPLOY_URL>
 * 
 * Sends a GET to /api/admin/auto-migrate?secret=run-migration-now
 * to automatically create Dashboard v2 tables.
 */

const deployUrl = process.argv[2] || process.env.DEPLOY_URL;

if (!deployUrl) {
  console.log('⚠️  No DEPLOY_URL provided. Set VERCEL_DEPLOY_HOOK or pass URL as arg.');
  console.log('   Usage: node scripts/run-migration-on-deploy.mjs https://your-app.vercel.app');
  process.exit(0);
}

const base = deployUrl.replace(/\/$/, '');
const url = `${base}/api/admin/auto-migrate?secret=run-migration-now`;

console.log(`🚀 Triggering auto-migration at: ${url}`);

try {
  const res = await fetch(url);
  const data = await res.json();
  console.log(`📦 Response (${res.status}):`, JSON.stringify(data, null, 2));
  
  if (data.ok) {
    console.log(`✅ Migration complete: ${data.success}/${data.total} statements executed successfully.`);
    process.exit(0);
  } else {
    console.log(`⚠️  Migration had issues: ${data.failed} statements failed.`);
    process.exit(1);
  }
} catch (err) {
  console.error('❌ Failed to trigger migration:', err.message);
  process.exit(1);
}
