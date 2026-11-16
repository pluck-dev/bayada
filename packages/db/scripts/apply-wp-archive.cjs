// Execute inside the deployed admin container; DB credentials stay in its environment.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { PrismaClient } = require('@prisma/client');

async function main() {
  const args = process.argv.slice(2), apply = args.includes('--apply');
  const file = args.find((arg) => !arg.startsWith('--'));
  if (!file || args.some((a) => a.startsWith('--') && a !== '--apply')) throw new Error('Expected bundle.json [--apply]');
  const bundle = JSON.parse(fs.readFileSync(file, 'utf8'));
  const hash = (s) => crypto.createHash('sha256').update(s).digest('hex');
  if (bundle.version !== 1 || hash(JSON.stringify(bundle.records)) !== bundle.recordsSha256) throw new Error('Bundle checksum mismatch');
  const keys = new Set();
  for (const r of bundle.records) {
    if (!r.id.startsWith('wp-') || !r.sourceId || keys.has(r.id)) throw new Error('Invalid or duplicate archive identity');
    keys.add(r.id);
    if (r.kind === 'FILE') {
      if (!/^[a-f0-9]{64}\.[a-z0-9]{1,8}$/.test(r.payload.storedFile)) throw new Error('Invalid stored file');
      const bytes = fs.readFileSync(path.join(path.dirname(file), 'files', r.payload.storedFile));
      if (hash(bytes) !== r.payload.sha256 || bytes.length !== r.payload.size) throw new Error('Attachment checksum mismatch');
    }
  }
  const prisma = new PrismaClient();
  const canonical = (value) => JSON.stringify(value, function (_key, v) {
    return v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, v[k]])) : v;
  });
  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(716420261117)`;
      const existing = new Map((await tx.legacyRecord.findMany()).map((r) => [r.id, r]));
      const missing = [];
      for (const r of bundle.records) {
        const old = existing.get(r.id);
        if (!old) missing.push(r);
        else if (Object.keys(r).some((k) => canonical(old[k]) !== canonical(r[k]))) throw new Error('Existing archive differs; refusing to overwrite preserved source records');
      }
      let linkedCodes = 0, unlinkedCodes = 0, codeUpdates = 0;
      for (const r of bundle.records.filter((r) => r.kind === 'CERTIFICATE')) {
        const cert = await tx.certificate.findFirst({ where: { user: { legacyWpId: r.userWpId }, course: { legacyWpId: r.courseWpId } }, select: { id: true, legacyCode: true } });
        if (!cert) { unlinkedCodes++; continue; }
        linkedCodes++;
        if (cert.legacyCode && cert.legacyCode !== r.payload.code) throw new Error('Existing certificate code conflict');
        if (cert.legacyCode !== r.payload.code) {
          codeUpdates++;
          if (apply) await tx.certificate.update({ where: { id: cert.id }, data: { legacyCode: r.payload.code } });
        }
      }
      if (apply) for (let i = 0; i < missing.length; i += 250) await tx.legacyRecord.createMany({ data: missing.slice(i, i + 250) });
      const counts = {};
      for (const r of bundle.records) counts[r.kind] = (counts[r.kind] || 0) + 1;
      return { mode: apply ? 'apply' : 'dry-run', sourceSha256: bundle.sourceSha256, counts, create: missing.length, unchanged: bundle.records.length - missing.length, linkedCodes, unlinkedCodes, codeUpdates };
    }, { isolationLevel: 'Serializable', timeout: 120000, maxWait: 15000 });
    console.log(JSON.stringify(result));
  } finally { await prisma.$disconnect(); }
}
main().catch(() => { console.error('Archive import failed; transaction rolled back. Check schema, bundle/file checksums and existing-record conflicts. No connection strings or source values are logged.'); process.exitCode = 1; });
