import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../db.js';
import { verifyToken } from '../lib/jwt.js';
import { unauthorized, forbidden } from '../lib/errors.js';

const COOKIE_NAME = 'hype_token';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: Awaited<ReturnType<typeof prisma.user.findUnique>>;
    }
  }
}

export { COOKIE_NAME };

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) throw unauthorized('Sign in required');
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) throw unauthorized('Session invalid');
    if (user.suspended) throw forbidden('Account suspended');
    req.userId = user.id;
    req.user = user;
    next();
  } catch (err) {
    next(err instanceof Error && 'status' in err ? err : unauthorized());
  }
}

// Attaches req.user when a valid session cookie is present, but never rejects.
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (token) {
      const payload = verifyToken(token);
      const user = await prisma.user.findUnique({ where: { id: payload.userId } });
      if (user && !user.suspended) {
        req.userId = user.id;
        req.user = user;
      }
    }
  } catch {
    // ignore invalid/expired token for optional auth
  }
  next();
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'ADMIN') return next(forbidden('Admin access required'));
  next();
}
