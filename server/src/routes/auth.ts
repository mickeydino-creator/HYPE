import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../db.js';
import { signToken } from '../lib/jwt.js';
import { badRequest, conflict } from '../lib/errors.js';
import { generateAvatar } from '../lib/cover.js';
import { meUser } from '../lib/serialize.js';
import { COOKIE_NAME, requireAuth } from '../middleware/auth.js';
import { env } from '../lib/env.js';

export const authRouter = Router();

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: false,
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: '/',
};

const usernameSchema = z
  .string()
  .trim()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be at most 20 characters')
  .regex(/^[a-zA-Z0-9_.]+$/, 'Username can only contain letters, numbers, "_" and "."');

const signupSchema = z.object({
  username: usernameSchema,
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(200),
  displayName: z.string().trim().min(1).max(60).optional(),
});

authRouter.post('/signup', async (req, res, next) => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid input');
    const { username, email, password, displayName } = parsed.data;

    const existing = await prisma.user.findFirst({
      where: { OR: [{ username: { equals: username } }, { email: { equals: email.toLowerCase() } }] },
    });
    if (existing) {
      throw conflict(existing.username === username ? 'Username is already taken' : 'Email is already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const name = displayName ?? username;

    const user = await prisma.user.create({
      data: {
        username,
        email: email.toLowerCase(),
        passwordHash,
        displayName: name,
        avatar: generateAvatar(username, name),
        balance: env.startingBalance,
      },
    });

    const token = signToken({ userId: user.id });
    res.cookie(COOKIE_NAME, token, cookieOptions);
    res.status(201).json({ user: meUser(user) });
  } catch (err) {
    next(err);
  }
});

const loginSchema = z.object({
  usernameOrEmail: z.string().trim().min(1),
  password: z.string().min(1),
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest('Enter your username/email and password');
    const { usernameOrEmail, password } = parsed.data;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: usernameOrEmail }, { email: usernameOrEmail.toLowerCase() }],
      },
    });
    if (!user) throw badRequest('Invalid credentials');
    if (user.suspended) throw badRequest('This account has been suspended');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw badRequest('Invalid credentials');

    const token = signToken({ userId: user.id });
    res.cookie(COOKIE_NAME, token, cookieOptions);
    res.json({ user: meUser(user) });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/logout', (_req, res) => {
  res.clearCookie(COOKIE_NAME, { path: '/' });
  res.status(204).end();
});

authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: meUser(req.user!) });
});
