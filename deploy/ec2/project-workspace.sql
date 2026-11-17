BEGIN;

CREATE TABLE IF NOT EXISTS "ProjectWorkspace" (
  "id" TEXT PRIMARY KEY,
  "revision" INTEGER NOT NULL DEFAULT 0,
  "state" JSONB NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "ProjectWorkspaceEvent" (
  "id" TEXT PRIMARY KEY,
  "workspaceId" TEXT NOT NULL,
  "revision" INTEGER NOT NULL,
  "actorId" TEXT NOT NULL,
  "requestHash" TEXT NOT NULL,
  "detail" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "ProjectWorkspaceEvent_workspaceId_revision_key"
  ON "ProjectWorkspaceEvent"("workspaceId", "revision");
CREATE INDEX IF NOT EXISTS "ProjectWorkspaceEvent_workspaceId_createdAt_idx"
  ON "ProjectWorkspaceEvent"("workspaceId", "createdAt");

CREATE TABLE IF NOT EXISTS "ProjectWorkspaceInvite" (
  "id" TEXT PRIMARY KEY,
  "tokenHash" TEXT NOT NULL UNIQUE,
  "email" TEXT NOT NULL,
  "invitedBy" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "acceptedAt" TIMESTAMP(3),
  "acceptedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "AdminRoleDef" ("id", "key", "name", "description", "permissions", "isSystem", "createdAt", "updatedAt")
VALUES ('project-client-role', 'custom_project_client', '고객사 프로젝트 협의',
        '프로젝트 협의 메뉴만 접근', ARRAY['project.workspace'], false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;

COMMIT;
