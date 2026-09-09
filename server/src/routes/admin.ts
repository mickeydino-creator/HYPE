import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { badRequest, notFound } from '../lib/errors.js';
import { meUser, publicTrend } from '../lib/serialize.js';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get('/stats', async (_req, res, next) => {
  try {
    const [userCount, trendCount, transactionCount, balanceAgg, volumeAgg] = await Promise.all([
      prisma.user.count(),
      prisma.trend.count({ where: { removed: false } }),
      prisma.transaction.count(),
      prisma.user.aggregate({ _sum: { balance: true } }),
      prisma.transaction.aggregate({ _sum: { totalValue: true }, where: { type: { in: ['BUY', 'SELL'] } } }),
    ]);
    res.json({
      userCount,
      trendCount,
      transactionCount,
      totalHypeInCirculation: Math.round((balanceAgg._sum.balance ?? 0) * 100) / 100,
      totalTradedVolume: Math.round((volumeAgg._sum.totalValue ?? 0) * 100) / 100,
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/users', async (req, res, next) => {
  try {
    const q = String(req.query.q ?? '').trim();
    const users = await prisma.user.findMany({
      where: q ? { username: { contains: q, mode: 'insensitive' } } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    res.json({ users: users.map(meUser) });
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/users/:id/suspend', async (req, res, next) => {
  try {
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { suspended: true } });
    res.json({ user: meUser(user) });
  } catch {
    next(notFound('User not found'));
  }
});

adminRouter.post('/users/:id/unsuspend', async (req, res, next) => {
  try {
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { suspended: false } });
    res.json({ user: meUser(user) });
  } catch {
    next(notFound('User not found'));
  }
});

adminRouter.get('/trends', async (_req, res, next) => {
  try {
    const trends = await prisma.trend.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { creator: { select: { username: true, displayName: true, avatar: true } } },
    });
    const withHistory = await Promise.all(
      trends.map(async (t) => {
        const history = await prisma.priceHistory.findMany({
          where: { trendId: t.id },
          orderBy: { timestamp: 'asc' },
          take: -30,
        });
        return { ...publicTrend(t, history), removed: t.removed };
      })
    );
    res.json({ trends: withHistory });
  } catch (err) {
    next(err);
  }
});

adminRouter.delete('/trends/:id', async (req, res, next) => {
  try {
    const trend = await prisma.trend.update({ where: { id: req.params.id }, data: { removed: true } });
    res.json({ trend: { id: trend.id, removed: true } });
  } catch {
    next(notFound('Trend not found'));
  }
});

adminRouter.get('/transactions', async (req, res, next) => {
  try {
    const limit = Math.min(300, Number(req.query.limit) || 100);
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { user: { select: { username: true } }, trend: { select: { name: true } } },
    });
    res.json({
      transactions: transactions.map((t) => ({
        id: t.id,
        username: t.user.username,
        trendName: t.trend.name,
        type: t.type,
        units: t.units,
        pricePerUnit: t.pricePerUnit,
        totalValue: t.totalValue,
        createdAt: t.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
});

const categorySchema = z.object({ name: z.string().trim().min(1).max(40) });

adminRouter.get('/categories', async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    res.json({ categories });
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/categories', async (req, res, next) => {
  try {
    const parsed = categorySchema.safeParse(req.body);
    if (!parsed.success) throw badRequest('Invalid category name');
    const category = await prisma.category.create({ data: { name: parsed.data.name } });
    res.status(201).json({ category });
  } catch (err) {
    next(err);
  }
});

adminRouter.delete('/categories/:id', async (req, res, next) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch {
    next(notFound('Category not found'));
  }
});
