import { prisma } from '../db.js';

export const DEFAULT_CATEGORIES = [
  'Tech',
  'Fashion',
  'Music',
  'Gaming',
  'Lifestyle',
  'Food',
  'Sports',
  'Art',
  'Finance-Meme',
  'Other',
];

// Categories are structural reference data the app can't function without
// (trend creation validates against them) — not demo content — so this
// runs on every boot, independent of the optional demo-data seed script,
// to guarantee a fresh database always has them.
export async function ensureCategories(): Promise<void> {
  for (const name of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
  }
}
