export interface PricePoint {
  t: number;
  p: number;
}

export interface Trend {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  creatorId: string;
  creatorUsername: string;
  creatorDisplayName: string;
  creatorAvatar: string;
  price: number;
  startingPrice: number;
  investorCount: number;
  createdAt: string;
  updatedAt: string;
  change24h: number;
  history: PricePoint[];
}

export interface PublicUser {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  createdAt: string;
  role: 'USER' | 'ADMIN';
}

export interface CurrentUser extends PublicUser {
  email: string;
  balance: number;
  suspended: boolean;
}

export interface Position {
  trendId: string;
  trendName: string;
  trendImage: string;
  unitsOwned: number;
  averageBuyPrice: number;
  currentPrice: number;
  value: number;
  cost: number;
  pl: number;
  plPct: number;
}

export interface PortfolioSummary {
  balance: number;
  portfolioValue: number;
  totalInvested: number;
  totalPl: number;
  totalPlPct: number;
  netWorth: number;
  positions: Position[];
}

export interface ActivityItem {
  id: string;
  type: 'BUY' | 'SELL' | 'CREATE';
  trendId: string;
  trendName: string;
  trendImage: string;
  units: number;
  pricePerUnit: number;
  totalValue: number;
  createdAt: string;
}
