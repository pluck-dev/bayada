-- Applied only to a dedicated Korea review database or an isolated branch preview database.
DO $$ BEGIN CREATE TYPE "ReviewSite" AS ENUM ('web','academy'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "ReviewFeedbackKind" AS ENUM ('design','interaction','bug','content','general'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "ReviewFeedbackStatus" AS ENUM ('open','discussion','developed','deployed','resolved'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE TABLE IF NOT EXISTS "ReviewFeedback" (
 id serial PRIMARY KEY,site "ReviewSite" NOT NULL,"pagePath" text NOT NULL,section text NOT NULL,
 kind "ReviewFeedbackKind" NOT NULL,status "ReviewFeedbackStatus" NOT NULL DEFAULT 'open',body text NOT NULL,
 tags text[] NOT NULL DEFAULT ARRAY[]::text[],department text,assignee text,context jsonb NOT NULL,
 "editTokenHash" text,"editVersion" integer NOT NULL DEFAULT 0,"reworkReason" text,"reworkRequestedAt" timestamp(3),
 "ipHash" text,"createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"deletedAt" timestamp(3)
);
CREATE TABLE IF NOT EXISTS "ReviewFeedbackReply" (
 id serial PRIMARY KEY,site "ReviewSite" NOT NULL,"feedbackId" integer NOT NULL REFERENCES "ReviewFeedback"(id) ON DELETE CASCADE,
 "parentId" integer REFERENCES "ReviewFeedbackReply"(id) ON DELETE SET NULL,"authorName" text NOT NULL,department text,"adminUserId" text,
 body text NOT NULL,"deleteTokenHash" text,"ipHash" text,"createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"deletedAt" timestamp(3)
);
CREATE INDEX IF NOT EXISTS "ReviewFeedback_site_pagePath_idx" ON "ReviewFeedback"(site,"pagePath");
CREATE INDEX IF NOT EXISTS "ReviewFeedback_site_status_idx" ON "ReviewFeedback"(site,status);
CREATE INDEX IF NOT EXISTS "ReviewFeedback_ipHash_createdAt_idx" ON "ReviewFeedback"("ipHash","createdAt");
CREATE INDEX IF NOT EXISTS "ReviewFeedbackReply_feedbackId_createdAt_idx" ON "ReviewFeedbackReply"("feedbackId","createdAt");
