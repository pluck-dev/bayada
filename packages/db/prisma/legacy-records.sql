-- Additive migration: existing certificates and learning records are retained.
ALTER TABLE "Certificate" ADD COLUMN IF NOT EXISTS "legacyCode" TEXT;
CREATE TABLE IF NOT EXISTS "LegacyRecord" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "kind" TEXT NOT NULL,
  "sourceId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "userWpId" INTEGER,
  "courseWpId" INTEGER,
  "sourceDate" TEXT,
  "payload" JSONB NOT NULL,
  "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "LegacyRecord_kind_sourceId_key" ON "LegacyRecord"("kind", "sourceId");
CREATE INDEX IF NOT EXISTS "LegacyRecord_kind_status_idx" ON "LegacyRecord"("kind", "status");
CREATE INDEX IF NOT EXISTS "LegacyRecord_userWpId_kind_idx" ON "LegacyRecord"("userWpId", "kind");
CREATE INDEX IF NOT EXISTS "LegacyRecord_courseWpId_idx" ON "LegacyRecord"("courseWpId");
