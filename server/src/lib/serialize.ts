import type { PriceHistory, Trend, User } from '@prisma/client';

export function publicUser(user: User) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    avatar: user.avatar,
    createdAt: user.createdAt,
    role: user.role,
  };
}

export function meUser(user: User) {
  return {
    ...publicUser(user),
    email: user.email,
    balance: user.balance,
    suspended: user.suspended,
  };
}

export function changeFrom(history: Pick<PriceHistory, 'price'>[], currentPrice: number): number {
  const first = history[0]?.price ?? currentPrice;
  if (first <= 0) return 0;
  return ((currentPrice - first) / first) * 100;
}

type TrendWithCreator = Trend & { creator: Pick<User, 'username' | 'displayName' | 'avatar'> };

export function publicTrend(trend: TrendWithCreator, history: Pick<PriceHistory, 'price' | 'timestamp'>[]) {
  return {
    id: trend.id,
    name: trend.name,
    description: trend.description,
    image: trend.image,
    category: trend.category,
    creatorId: trend.creatorId,
    creatorUsername: trend.creator.username,
    creatorDisplayName: trend.creator.displayName,
    creatorAvatar: trend.creator.avatar,
    price: trend.currentPrice,
    startingPrice: trend.startingPrice,
    investorCount: trend.investorCount,
    createdAt: trend.createdAt,
    updatedAt: trend.updatedAt,
    change24h: changeFrom(history, trend.currentPrice),
    history: history.map((h) => ({ t: h.timestamp.getTime(), p: h.price })),
  };
}
