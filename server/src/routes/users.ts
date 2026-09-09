import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { badRequest, notFound } from '../lib/errors.js';
import { publicTrend, publicUser, meUser } from '../lib/serialize.js';

export const usersRouter = Router();

usersRouter.get('/search', async (req, res, next) => {
  try {
    const q = String(req.query.q ?? '').trim();
    if (!q) return res.json({ users: [] });
    const users = await prisma.user.findMany({
      where: { username: { contains: q, mode: 'insensitive' }, suspended: false },
      take: 20,
    });
    res.json({ users: users.map(publicUser) });
  } catch (err) {
    next(err);
  }
});

const updateProfileSchema = z.object({
  displayName: z.string().trim().min(1).max(60).optional(),
  bio: z.string().trim().max(280).optional(),
  avatar: z.string().trim().max(500_000).optional(),
});

usersRouter.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid input');

    const user = await prisma.user.update({
      where: { id: req.userId! },
      data: parsed.data,
    });
    res.json({ user: meUser(user) });
  } catch (err) {
    next(err);
  }
});

usersRouter.get('/:username', optionalAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { username: req.params.username } });
    if (!user || user.suspended) throw notFound('User not found');

    const trends = await prisma.trend.findMany({
      where: { creatorId: user.id, removed: false },
      orderBy: { createdAt: 'desc' },
      include: { creator: { select: { username: true, displayName: true, avatar: true } } },
    });
    const trendsWithHistory = await Promise.all(
      trends.map(async (t) => {
        const history = await prisma.priceHistory.findMany({
          where: { trendId: t.id },
          orderBy: { timestamp: 'asc' },
          take: -60,
        });
        return publicTrend(t, history);
      })
    );

    const holdings = await prisma.holding.findMany({ where: { userId: user.id }, include: { trend: true } });
    const portfolioValue = holdings.reduce((sum, h) => sum + h.unitsOwned * h.trend.currentPrice, 0);

    res.json({
      user: publicUser(user),
      isSelf: req.userId === user.id,
      createdTrends: trendsWithHistory,
      portfolioValue: Math.round(portfolioValue * 100) / 100,
    });
  } catch (err) {
    next(err);
  }
});
