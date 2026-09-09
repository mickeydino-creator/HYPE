import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { badRequest, forbidden, notFound } from '../lib/errors.js';
import { upload } from '../lib/upload.js';
import { publicTrend } from '../lib/serialize.js';
import { applyBuyPressure, applySellPressure, roundHype, roundUnits } from '../lib/pricing.js';
import { emitPriceUpdate, emitTrendCreated } from '../realtime.js';

export const trendsRouter = Router();

const RECENT_HISTORY_TAKE = 120;

async function loadTrendWithHistory(trendId: string, take = RECENT_HISTORY_TAKE) {
  const trend = await prisma.trend.findUnique({ where: { id: trendId }, include: { creator: { select: { username: true, displayName: true, avatar: true } } } });
  if (!trend || trend.removed) return null;
  const history = await prisma.priceHistory.findMany({
    where: { trendId },
    orderBy: { timestamp: 'asc' },
    take: -take, // last N in chronological order
  });
  return publicTrend(trend, history);
}

// GET /api/trends?sort=latest|trending&category=&q=
trendsRouter.get('/', async (req, res, next) => {
  try {
    const { sort, category, q } = req.query as Record<string, string | undefined>;

    const where: Record<string, unknown> = { removed: false };
    if (category && category !== 'All') where.category = category;
    if (q) where.name = { contains: q };

    const trends = await prisma.trend.findMany({
      where,
      orderBy: sort === 'trending' ? { investorCount: 'desc' } : { createdAt: 'desc' },
      take: 100,
      include: { creator: { select: { username: true, displayName: true, avatar: true } } },
    });

    const withHistory = await Promise.all(
      trends.map(async (t) => {
        const history = await prisma.priceHistory.findMany({
          where: { trendId: t.id },
          orderBy: { timestamp: 'asc' },
          take: -RECENT_HISTORY_TAKE,
        });
        return publicTrend(t, history);
      })
    );

    if (sort === 'trending') {
      withHistory.sort((a, b) => b.change24h - a.change24h);
    }

    res.json({ trends: withHistory });
  } catch (err) {
    next(err);
  }
});

trendsRouter.get('/categories', async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    res.json({ categories: categories.map((c) => c.name) });
  } catch (err) {
    next(err);
  }
});

trendsRouter.get('/:id', async (req, res, next) => {
  try {
    const trend = await loadTrendWithHistory(req.params.id, 500);
    if (!trend) throw notFound('Trend not found');
    res.json({ trend });
  } catch (err) {
    next(err);
  }
});

trendsRouter.get('/:id/history', async (req, res, next) => {
  try {
    const range = (req.query.range as string) ?? 'all';
    const trend = await prisma.trend.findUnique({ where: { id: req.params.id } });
    if (!trend || trend.removed) throw notFound('Trend not found');

    const since =
      range === '1h'
        ? new Date(Date.now() - 60 * 60 * 1000)
        : range === '1d'
          ? new Date(Date.now() - 24 * 60 * 60 * 1000)
          : undefined;

    const history = await prisma.priceHistory.findMany({
      where: { trendId: trend.id, ...(since ? { timestamp: { gte: since } } : {}) },
      orderBy: { timestamp: 'asc' },
    });

    res.json({ history: history.map((h) => ({ t: h.timestamp.getTime(), p: h.price })) });
  } catch (err) {
    next(err);
  }
});

const createTrendSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(80),
  description: z.string().trim().min(2, 'Description is too short').max(500),
  category: z.string().trim().min(1, 'Pick a category'),
  startingPrice: z.coerce.number().positive('Starting price must be positive').max(1_000_000),
});

trendsRouter.post('/', requireAuth, upload.single('image'), async (req, res, next) => {
  try {
    const parsed = createTrendSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid input');

    const category = await prisma.category.findUnique({ where: { name: parsed.data.category } });
    if (!category) throw badRequest('Unknown category');

    if (!req.file) throw badRequest('An image is required');
    const image = `/uploads/${req.file.filename}`;

    const price = Math.round(parsed.data.startingPrice * 100) / 100;
    const now = new Date();

    const trend = await prisma.$transaction(async (tx) => {
      const created = await tx.trend.create({
        data: {
          name: parsed.data.name,
          description: parsed.data.description,
          category: parsed.data.category,
          image,
          creatorId: req.userId!,
          currentPrice: price,
          startingPrice: price,
        },
        include: { creator: { select: { username: true, displayName: true, avatar: true } } },
      });
      await tx.priceHistory.create({ data: { trendId: created.id, price, timestamp: now } });
      await tx.transaction.create({
        data: {
          userId: req.userId!,
          trendId: created.id,
          type: 'CREATE',
          units: 0,
          pricePerUnit: price,
          totalValue: 0,
        },
      });
      return created;
    });

    const withHistory = publicTrend(trend, [{ price, timestamp: now }]);
    emitTrendCreated(withHistory);
    res.status(201).json({ trend: withHistory });
  } catch (err) {
    next(err);
  }
});

const investSchema = z.object({
  amount: z.coerce.number().positive('Enter an amount').finite(),
});

trendsRouter.post('/:id/invest', requireAuth, async (req, res, next) => {
  try {
    const parsed = investSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid amount');
    const amount = roundHype(parsed.data.amount);
    if (amount <= 0) throw badRequest('Enter an amount greater than zero');

    const trendId = req.params.id;
    const userId = req.userId!;

    const result = await prisma.$transaction(async (tx) => {
      const trend = await tx.trend.findUnique({ where: { id: trendId } });
      if (!trend || trend.removed) throw notFound('Trend not found');

      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw notFound('User not found');
      if (user.suspended) throw forbidden('Account suspended');
      if (amount > user.balance) throw badRequest('Not enough HYPE balance');

      const price = trend.currentPrice;
      const units = roundUnits(amount / price);
      const newPrice = applyBuyPressure(price, amount);
      const now = new Date();

      const existingHolding = await tx.holding.findUnique({
        where: { userId_trendId: { userId, trendId } },
      });

      let isNewInvestor = false;
      if (existingHolding) {
        const totalUnits = roundUnits(existingHolding.unitsOwned + units);
        const totalCost = existingHolding.averageBuyPrice * existingHolding.unitsOwned + amount;
        await tx.holding.update({
          where: { id: existingHolding.id },
          data: { unitsOwned: totalUnits, averageBuyPrice: totalCost / totalUnits },
        });
      } else {
        isNewInvestor = true;
        await tx.holding.create({
          data: { userId, trendId, unitsOwned: units, averageBuyPrice: price },
        });
      }

      await tx.user.update({ where: { id: userId }, data: { balance: roundHype(user.balance - amount) } });

      await tx.transaction.create({
        data: { userId, trendId, type: 'BUY', units, pricePerUnit: price, totalValue: amount },
      });

      const updatedTrend = await tx.trend.update({
        where: { id: trendId },
        data: {
          currentPrice: newPrice,
          investorCount: isNewInvestor ? trend.investorCount + 1 : trend.investorCount,
        },
        include: { creator: { select: { username: true, displayName: true, avatar: true } } },
      });

      await tx.priceHistory.create({ data: { trendId, price: newPrice, timestamp: now } });

      return { updatedTrend, units, newPrice };
    });

    const history = await prisma.priceHistory.findMany({
      where: { trendId },
      orderBy: { timestamp: 'asc' },
      take: -RECENT_HISTORY_TAKE,
    });
    const trendPayload = publicTrend(result.updatedTrend, history);
    emitPriceUpdate(trendId, trendPayload.price, trendPayload.change24h);

    res.json({ trend: trendPayload, unitsPurchased: result.units });
  } catch (err) {
    next(err);
  }
});

const sellSchema = z.object({
  units: z.coerce.number().positive('Enter units to sell').finite(),
});

trendsRouter.post('/:id/sell', requireAuth, async (req, res, next) => {
  try {
    const parsed = sellSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid units');
    const requestedUnits = roundUnits(parsed.data.units);
    if (requestedUnits <= 0) throw badRequest('Enter units greater than zero');

    const trendId = req.params.id;
    const userId = req.userId!;

    const result = await prisma.$transaction(async (tx) => {
      const trend = await tx.trend.findUnique({ where: { id: trendId } });
      if (!trend || trend.removed) throw notFound('Trend not found');

      const holding = await tx.holding.findUnique({ where: { userId_trendId: { userId, trendId } } });
      if (!holding || requestedUnits > holding.unitsOwned + 1e-6) {
        throw badRequest('You do not own that many units');
      }

      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw notFound('User not found');

      const price = trend.currentPrice;
      const proceeds = roundHype(requestedUnits * price);
      const newPrice = applySellPressure(price, proceeds);
      const now = new Date();

      const remaining = roundUnits(holding.unitsOwned - requestedUnits);
      let stillInvestor = true;
      if (remaining <= 1e-6) {
        await tx.holding.delete({ where: { id: holding.id } });
        stillInvestor = false;
      } else {
        await tx.holding.update({ where: { id: holding.id }, data: { unitsOwned: remaining } });
      }

      await tx.user.update({ where: { id: userId }, data: { balance: roundHype(user.balance + proceeds) } });

      await tx.transaction.create({
        data: { userId, trendId, type: 'SELL', units: requestedUnits, pricePerUnit: price, totalValue: proceeds },
      });

      const updatedTrend = await tx.trend.update({
        where: { id: trendId },
        data: {
          currentPrice: newPrice,
          investorCount: stillInvestor ? trend.investorCount : Math.max(0, trend.investorCount - 1),
        },
        include: { creator: { select: { username: true, displayName: true, avatar: true } } },
      });

      await tx.priceHistory.create({ data: { trendId, price: newPrice, timestamp: now } });

      return { updatedTrend, proceeds };
    });

    const history = await prisma.priceHistory.findMany({
      where: { trendId },
      orderBy: { timestamp: 'asc' },
      take: -RECENT_HISTORY_TAKE,
    });
    const trendPayload = publicTrend(result.updatedTrend, history);
    emitPriceUpdate(trendId, trendPayload.price, trendPayload.change24h);

    res.json({ trend: trendPayload, proceeds: result.proceeds });
  } catch (err) {
    next(err);
  }
});
