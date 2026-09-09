export type Category =
  | 'Tech'
  | 'Fashion'
  | 'Music'
  | 'Gaming'
  | 'Lifestyle'
  | 'Food'
  | 'Sports'
  | 'Art'
  | 'Finance-Meme'
  | 'Other';

export interface PricePoint {
  t: number; // timestamp
  p: number; // price
}

export interface Trend {
  id: string;
  name: string;
  description: string;
  category: Category;
  image: string;
  creatorId: string;
  createdAt: number;
  price: number;
  startingPrice: number;
  history: PricePoint[];
  investorIds: string[];
}

export interface Holding {
  trendId: string;
  units: number;
  avgCost: number;
}

export interface ActivityItem {
  id: string;
  type: 'invest' | 'sell' | 'create';
  trendId: string;
  amount: number;
  units: number;
  price: number;
  timestamp: number;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  balance: number;
  createdTrendIds: string[];
  holdings: Holding[];
  activity: ActivityItem[];
}

export interface HypeState {
  users: Record<string, User>;
  currentUserId: string;
  trends: Record<string, Trend>;
  trendOrder: string[];
}
