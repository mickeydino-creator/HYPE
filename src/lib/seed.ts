import type { Category, HypeState, PricePoint, Trend, User } from '../types';
import { generateAvatar, generateCover } from './cover';

const STARTING_BALANCE = 1000;

function genHistory(start: number, points: number, volatility: number): PricePoint[] {
  const now = Date.now();
  const stepMs = (1000 * 60 * 60 * 24) / points; // spread over ~1 day
  let price = start;
  const out: PricePoint[] = [];
  for (let i = points; i >= 0; i--) {
    const drift = (Math.random() - 0.46) * volatility;
    price = Math.max(0.5, price * (1 + drift));
    out.push({ t: now - i * stepMs, p: Number(price.toFixed(2)) });
  }
  out[out.length - 1] = { t: now, p: out[out.length - 1].p };
  return out;
}

interface SeedUserDef {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
}

const seedUsers: SeedUserDef[] = [
  { id: 'u-nova', username: 'nova', displayName: 'Nova Reyes', bio: 'Spotting trends before they blow up ✨', avatar: generateAvatar('u-nova', 'Nova Reyes') },
  { id: 'u-jax', username: 'jax.codes', displayName: 'Jax Lin', bio: 'Tech scout. Gadgets & AI.', avatar: generateAvatar('u-jax', 'Jax Lin') },
  { id: 'u-mira', username: 'mira', displayName: 'Mira Osei', bio: 'Streetwear & culture curator', avatar: generateAvatar('u-mira', 'Mira Osei') },
  { id: 'u-devon', username: 'devon.k', displayName: 'Devon Kwan', bio: 'Music heads unite 🎧', avatar: generateAvatar('u-devon', 'Devon Kwan') },
  { id: 'u-ari', username: 'ari', displayName: 'Ari Salem', bio: 'Living for the next big thing', avatar: generateAvatar('u-ari', 'Ari Salem') },
];

interface SeedTrendDef {
  id: string;
  name: string;
  description: string;
  category: Category;
  creatorId: string;
  start: number;
  volatility: number;
  ageHours: number;
}

const seedTrends: SeedTrendDef[] = [
  {
    id: 't-smartglasses',
    name: 'AI Smart Glasses',
    description: 'Smart glasses are about to become mainstream. Every major brand is racing to ship one.',
    category: 'Tech',
    creatorId: 'u-jax',
    start: 30,
    volatility: 0.05,
    ageHours: 30,
  },
  {
    id: 't-quietluxury',
    name: 'Quiet Luxury 2.0',
    description: 'Minimal logos, maximal fabric quality. The pendulum is swinging back to understated fits.',
    category: 'Fashion',
    creatorId: 'u-mira',
    start: 55,
    volatility: 0.035,
    ageHours: 60,
  },
  {
    id: 't-lofi-revival',
    name: 'Lo-fi Vinyl Revival',
    description: 'Gen Z is buying turntables again. Lo-fi and vinyl culture is having a full comeback.',
    category: 'Music',
    creatorId: 'u-devon',
    start: 18,
    volatility: 0.06,
    ageHours: 14,
  },
  {
    id: 't-cozygaming',
    name: 'Cozy Gaming Wave',
    description: 'Low-stakes, high-comfort games are outselling AAA shooters this quarter.',
    category: 'Gaming',
    creatorId: 'u-ari',
    start: 24,
    volatility: 0.045,
    ageHours: 40,
  },
  {
    id: 't-microdorm',
    name: 'Micro Dorm Living',
    description: 'Tiny, ultra-optimized dorm setups are taking over. Every inch matters.',
    category: 'Lifestyle',
    creatorId: 'u-nova',
    start: 12,
    volatility: 0.07,
    ageHours: 8,
  },
  {
    id: 't-fermented',
    name: 'Fermented Everything',
    description: 'Kimchi, kombucha, miso butter — fermentation is the flavor trend of the year.',
    category: 'Food',
    creatorId: 'u-mira',
    start: 40,
    volatility: 0.04,
    ageHours: 50,
  },
  {
    id: 't-streetball',
    name: 'Streetball Renaissance',
    description: 'Pickup courts are packed again. Grassroots streetball content is exploding.',
    category: 'Sports',
    creatorId: 'u-devon',
    start: 20,
    volatility: 0.055,
    ageHours: 22,
  },
  {
    id: 't-aigenart',
    name: 'AI-Assisted Sketching',
    description: 'Artists blending hand-drawn sketches with AI shading are dominating art feeds.',
    category: 'Art',
    creatorId: 'u-jax',
    start: 33,
    volatility: 0.05,
    ageHours: 36,
  },
];

export function createInitialState(): HypeState {
  const users: Record<string, User> = {};
  for (const u of seedUsers) {
    users[u.id] = {
      id: u.id,
      username: u.username,
      displayName: u.displayName,
      bio: u.bio,
      avatar: u.avatar,
      balance: STARTING_BALANCE,
      createdTrendIds: [],
      holdings: [],
      activity: [],
    };
  }

  const me: User = {
    id: 'me',
    username: 'you',
    displayName: 'You',
    bio: 'New here. Spotting the next big thing 👀',
    avatar: generateAvatar('me', 'You'),
    balance: STARTING_BALANCE,
    createdTrendIds: [],
    holdings: [],
    activity: [],
  };
  users['me'] = me;

  const trends: Record<string, Trend> = {};
  const trendOrder: string[] = [];

  for (const t of seedTrends) {
    const points = Math.max(20, Math.round(t.ageHours * 2));
    const history = genHistory(t.start, points, t.volatility);
    const price = history[history.length - 1].p;
    const investorCount = 8 + Math.floor(Math.random() * 60);
    const investorIds = Array.from({ length: Math.min(investorCount, seedUsers.length) }, (_, i) => seedUsers[i].id);
    trends[t.id] = {
      id: t.id,
      name: t.name,
      description: t.description,
      category: t.category,
      image: generateCover(t.id),
      creatorId: t.creatorId,
      createdAt: Date.now() - t.ageHours * 3600 * 1000,
      price,
      startingPrice: t.start,
      history,
      investorIds,
    };
    trendOrder.push(t.id);
    users[t.creatorId].createdTrendIds.push(t.id);
  }

  return {
    users,
    currentUserId: 'me',
    trends,
    trendOrder,
  };
}

