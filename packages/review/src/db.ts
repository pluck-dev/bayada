import { prisma, PrismaClient } from '@bayada/db';
// Korea deployments can keep reviewer writes outside the content/operational database.
const cache = globalThis as typeof globalThis & { isolatedReviewDb?: PrismaClient; isolatedReviewUrl?: string };
const url = process.env.REVIEW_DATABASE_URL;
export const reviewDb = url ? cache.isolatedReviewUrl === url && cache.isolatedReviewDb
  ? cache.isolatedReviewDb : new PrismaClient({ datasources: { db: { url } } }) : prisma;
if (url) { cache.isolatedReviewDb = reviewDb; cache.isolatedReviewUrl = url; }
