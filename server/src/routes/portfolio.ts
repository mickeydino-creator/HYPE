import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const portfolioRouter = Router();

portfolioRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const userId = req.userId!;
    const [user, holdings] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.holding.findMany({ where: { userId }, include: { trend: true } }),
    ]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const positions = holdings.map((h) => {
      const value = Math.round(h.unitsOwned * h.trend.currentPrice * 100) / 100;
      const cost = Math.round(h.unitsOwned * h.averageBuyPrice * 100) / 100;
      const pl = Math.round((value - cost) * 100) / 100;
      const plPct = cost > 0 ? (pl / cost) * 100 : 0;
      return {
        trendId: h.trendId,
        trendName: h.trend.name,
        trendImage: h.trend.image,
        unitsOwned: h.unitsOwned,
        averageBuyPrice: h.averageBuyPrice,
        currentPrice: h.trend.currentPrice,
        value,
        cost,
        pl,
        plPct,
      };
    });

    const portfolioValue = Math.round(positions.reduce((s, p) => s + p.value, 0) * 100) / 100;
    const totalCost = Math.round(positions.reduce((s, p) => s + p.cost, 0) * 100) / 100;
    const totalPl = Math.round((portfolioValue - totalCost) * 100) / 100;
    const totalPlPct = totalCost > 0 ? (totalPl / totalCost) * 100 : 0;
    const netWorth = Math.round((user.balance + portfolioValue) * 100) / 100;

    res.json({
      balance: user.balance,
      portfolioValue,
      totalInvested: totalCost,
      totalPl,
      totalPlPct,
      netWorth,
      positions: positions.sort((a, b) => b.value - a.value),
    });
  } catch (err) {
    next(err);
  }
});

portfolioRouter.get('/transactions', requireAuth, async (req, res, next) => {
  try {
    const limit = Math.min(100, Number(req.query.limit) || 30);
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { trend: { select: { name: true, image: true } } },
    });
    res.json({
      transactions: transactions.map((t) => ({
        id: t.id,
        type: t.type,
        trendId: t.trendId,
        trendName: t.trend.name,
        trendImage: t.trend.image,
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
