import { readFileSync, mkdirSync, realpathSync, statSync, copyFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { buildArchive, safeUploadRelative } from "./wp-archive";

const args = process.argv.slice(2);
const arg = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const source = arg("source"), uploads = arg("uploads"), output = arg("output");
if (!source || !uploads || !output) throw new Error("Require --source, --uploads and --output");
const sql = readFileSync(source, "utf8"), records = buildArchive(sql);
const base = realpathSync(uploads), folder = path.resolve(output);
mkdirSync(path.join(folder, "files"), { recursive: true });
let files = 0;
for (const record of records.filter((r) => r.kind === "FILE")) {
  const relative = safeUploadRelative(String(record.payload.originalPath));
  const actual = realpathSync(path.join(base, relative));
  if (!actual.startsWith(base + path.sep) || !statSync(actual).isFile()) throw new Error("Invalid attachment location");
  const bytes = readFileSync(actual), hash = createHash("sha256").update(bytes).digest("hex");
  const suffix = path.extname(actual).slice(1).toLowerCase();
  if (!/^[a-z0-9]{1,8}$/.test(suffix)) throw new Error("Unsupported attachment extension");
  const storedFile = `${hash}.${suffix}`;
  copyFileSync(actual, path.join(folder, "files", storedFile));
  record.payload = { ...record.payload, storedFile, sha256: hash, size: bytes.length };
  files++;
}
const sourceSha256 = createHash("sha256").update(sql).digest("hex");
const serialized = JSON.stringify(records);
writeFileSync(path.join(folder, "bundle.json"), JSON.stringify({ version: 1, sourceSha256, recordsSha256: createHash("sha256").update(serialized).digest("hex"), records }));
const counts: Record<string, number> = {};
for (const record of records) counts[record.kind] = (counts[record.kind] ?? 0) + 1;
console.log(JSON.stringify({ sourceSha256, counts, filesVerified: files }));
