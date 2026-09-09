import bcrypt from 'bcryptjs';
import { prisma } from './db.js';
import { generateAvatar, generateCover } from './lib/cover.js';

const CATEGORIES = ['Tech', 'Fashion', 'Music', 'Gaming', 'Lifestyle', 'Food', 'Sports', 'Art', 'Finance-Meme', 'Other'];

const DEMO_USERS = [
  { username: 'nova', email: 'nova@hype.demo', displayName: 'Nova Reyes', bio: 'Spotting trends before they blow up ✨' },
  { username: 'jax.codes', email: 'jax@hype.demo', displayName: 'Jax Lin', bio: 'Tech scout. Gadgets & AI.' },
  { username: 'mira', email: 'mira@hype.demo', displayName: 'Mira Osei', bio: 'Streetwear & culture curator' },
  { username: 'devon.k', email: 'devon@hype.demo', displayName: 'Devon Kwan', bio: 'Music heads unite 🎧' },
  { username: 'ari', email: 'ari@hype.demo', displayName: 'Ari Salem', bio: 'Living for the next big thing' },
];

const DEMO_TRENDS: { name: string; description: string; category: string; start: number; owner: number }[] = [
  { name: 'AI Smart Glasses', description: 'Smart glasses are about to become mainstream. Every major brand is racing to ship one.', category: 'Tech', start: 30, owner: 1 },
  { name: 'Quiet Luxury 2.0', description: 'Minimal logos, maximal fabric quality. The pendulum is swinging back to understated fits.', category: 'Fashion', start: 55, owner: 2 },
  { name: 'Lo-fi Vinyl Revival', description: 'Gen Z is buying turntables again. Lo-fi and vinyl culture is having a full comeback.', category: 'Music', start: 18, owner: 3 },
  { name: 'Cozy Gaming Wave', description: 'Low-stakes, high-comfort games are outselling AAA shooters this quarter.', category: 'Gaming', start: 24, owner: 4 },
  { name: 'Micro Dorm Living', description: 'Tiny, ultra-optimized dorm setups are taking over. Every inch matters.', category: 'Lifestyle', start: 12, owner: 0 },
  { name: 'Fermented Everything', description: 'Kimchi, kombucha, miso butter — fermentation is the flavor trend of the year.', category: 'Food', start: 40, owner: 2 },
  { name: 'Streetball Renaissance', description: 'Pickup courts are packed again. Grassroots streetball content is exploding.', category: 'Sports', start: 20, owner: 3 },
  { name: 'AI-Assisted Sketching', description: 'Artists blending hand-drawn sketches with AI shading are dominating art feeds.', category: 'Art', start: 33, owner: 1 },
];

async function main() {
  console.log('Seeding categories...');
  for (const name of CATEGORIES) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
  }

  console.log('Seeding admin account...');
  const adminPassword = await bcrypt.hash('admin12345', 10);
  await prisma.user.upsert({
    where: { email: 'admin@hype.demo' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@hype.demo',
      passwordHash: adminPassword,
      displayName: 'HYPE Admin',
      avatar: generateAvatar('admin', 'HYPE Admin'),
      role: 'ADMIN',
      balance: 1000,
    },
  });

  console.log('Seeding demo creators...');
  const userIds: string[] = [];
  for (const u of DEMO_USERS) {
    const passwordHash = await bcrypt.hash('password123', 10);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        username: u.username,
        email: u.email,
        passwordHash,
        displayName: u.displayName,
        bio: u.bio,
        avatar: generateAvatar(u.username, u.displayName),
        balance: 1000,
      },
    });
    userIds.push(user.id);
  }

  console.log('Seeding demo trends...');
  for (const t of DEMO_TRENDS) {
    const existing = await prisma.trend.findFirst({ where: { name: t.name } });
    if (existing) continue;
    const creatorId = userIds[t.owner];
    const trend = await prisma.trend.create({
      data: {
        name: t.name,
        description: t.description,
        category: t.category,
        image: generateCover(t.name),
        creatorId,
        currentPrice: t.start,
        startingPrice: t.start,
      },
    });
    await prisma.priceHistory.create({ data: { trendId: trend.id, price: t.start } });
    await prisma.transaction.create({
      data: { userId: creatorId, trendId: trend.id, type: 'CREATE', units: 0, pricePerUnit: t.start, totalValue: 0 },
    });
  }

  console.log('Done.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
