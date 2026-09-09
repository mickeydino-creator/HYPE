import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { prisma } from './db.js';
import { env } from './lib/env.js';
import { ApiError } from './lib/errors.js';
import { authRouter } from './routes/auth.js';
import { trendsRouter } from './routes/trends.js';
import { usersRouter } from './routes/users.js';
import { portfolioRouter } from './routes/portfolio.js';
import { adminRouter } from './routes/admin.js';
import { setIo, emitPriceUpdate } from './realtime.js';
import { applyBuyPressure, applySellPressure, roundPrice } from './lib/pricing.js';
import { changeFrom } from './lib/serialize.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: env.clientOrigin, credentials: true },
});
setIo(io);

app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRouter);
app.use('/api/trends', trendsRouter);
app.use('/api/users', usersRouter);
app.use('/api/portfolio', portfolioRouter);
app.use('/api/admin', adminRouter);

app.use((req, res) => {
  res.status(404).json({ error: `No route for ${req.method} ${req.path}` });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err instanceof Error && err.message.includes('Unsupported image type')) {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

io.on('connection', (socket) => {
  socket.on('subscribe:trend', (trendId: string) => {
    if (typeof trendId === 'string') socket.join(`trend:${trendId}`);
  });
  socket.on('unsubscribe:trend', (trendId: string) => {
    if (typeof trendId === 'string') socket.leave(`trend:${trendId}`);
  });
  socket.on('subscribe:feed', () => socket.join('feed'));
  socket.on('unsubscribe:feed', () => socket.leave('feed'));
});

// Server-authoritative ambient market drift: small, bounded, random price
// moves so the market feels alive even without trades. Same pricing rules
// as buy/sell pressure apply — never negative, never unbounded.
setInterval(async () => {
  try {
    const trends = await prisma.trend.findMany({ where: { removed: false } });
    for (const trend of trends) {
      if (Math.random() > 0.35) continue;
      const drift = (Math.random() - 0.5) * trend.currentPrice * 0.015;
      const nudged = drift >= 0 ? applyBuyPressure(trend.currentPrice, Math.abs(drift) * 50) : applySellPressure(trend.currentPrice, Math.abs(drift) * 50);
      const newPrice = roundPrice(nudged);
      if (newPrice === trend.currentPrice) continue;

      const updated = await prisma.trend.update({ where: { id: trend.id }, data: { currentPrice: newPrice } });
      await prisma.priceHistory.create({ data: { trendId: trend.id, price: newPrice } });

      const history = await prisma.priceHistory.findMany({
        where: { trendId: trend.id },
        orderBy: { timestamp: 'asc' },
        take: -120,
      });
      emitPriceUpdate(trend.id, updated.currentPrice, changeFrom(history, updated.currentPrice));
    }
  } catch (err) {
    console.error('market drift tick failed', err);
  }
}, 5000);

httpServer.listen(env.port, () => {
  console.log(`HYPE API listening on http://localhost:${env.port}`);
});
