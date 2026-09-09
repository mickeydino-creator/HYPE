import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Category, HypeState, Trend, User } from '../types';
import { createInitialState } from './seed';
import { uid } from './id';

const STORAGE_KEY = 'hype:v1';

function loadState(): HypeState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as HypeState;
  } catch {
    // ignore corrupt storage
  }
  return createInitialState();
}

function saveState(state: HypeState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full or unavailable — ignore
  }
}

interface TrendInput {
  name: string;
  description: string;
  category: Category;
  image: string;
  startingPrice: number;
}

interface StoreApi {
  state: HypeState;
  currentUser: User;
  trendsFeed: Trend[];
  getTrend: (id: string) => Trend | undefined;
  getUser: (id: string) => User | undefined;
  createTrend: (input: TrendInput) => string;
  invest: (trendId: string, amount: number) => { ok: boolean; error?: string };
  sell: (trendId: string, units: number) => { ok: boolean; error?: string };
  holdingFor: (trendId: string) => { units: number; avgCost: number } | undefined;
}

const StoreContext = createContext<StoreApi | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<HypeState>(() => loadState());
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    saveState(state);
  }, [state]);

  // simulate organic market drift
  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => {
        const trends = { ...prev.trends };
        let changed = false;
        for (const id of prev.trendOrder) {
          if (Math.random() > 0.35) continue;
          const trend = trends[id];
          const drift = (Math.random() - 0.49) * 0.02;
          const newPrice = Math.max(0.5, Number((trend.price * (1 + drift)).toFixed(2)));
          trends[id] = {
            ...trend,
            price: newPrice,
            history: [...trend.history.slice(-119), { t: Date.now(), p: newPrice }],
          };
          changed = true;
        }
        if (!changed) return prev;
        return { ...prev, trends };
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const currentUser = state.users[state.currentUserId];

  const trendsFeed = useMemo(
    () => state.trendOrder.map((id) => state.trends[id]).sort((a, b) => b.createdAt - a.createdAt),
    [state.trendOrder, state.trends]
  );

  const getTrend = useCallback((id: string) => stateRef.current.trends[id], []);
  const getUser = useCallback((id: string) => stateRef.current.users[id], []);

  const createTrend = useCallback((input: TrendInput) => {
    const id = uid('t-');
    setState((prev) => {
      const now = Date.now();
      const price = Math.max(0.5, input.startingPrice);
      const trend: Trend = {
        id,
        name: input.name.trim(),
        description: input.description.trim(),
        category: input.category,
        image: input.image,
        creatorId: prev.currentUserId,
        createdAt: now,
        price,
        startingPrice: price,
        history: [
          { t: now - 1000, p: price },
          { t: now, p: price },
        ],
        investorIds: [],
      };
      const user = prev.users[prev.currentUserId];
      return {
        ...prev,
        trends: { ...prev.trends, [id]: trend },
        trendOrder: [...prev.trendOrder, id],
        users: {
          ...prev.users,
          [prev.currentUserId]: {
            ...user,
            createdTrendIds: [...user.createdTrendIds, id],
            activity: [
              { id: uid('a-'), type: 'create', trendId: id, amount: 0, units: 0, price, timestamp: now },
              ...user.activity,
            ],
          },
        },
      };
    });
    return id;
  }, []);

  const invest = useCallback((trendId: string, amount: number): { ok: boolean; error?: string } => {
    const prev = stateRef.current;
    const user = prev.users[prev.currentUserId];
    const trend = prev.trends[trendId];
    if (!trend) return { ok: false, error: 'Trend not found' };
    if (amount <= 0) return { ok: false, error: 'Enter an amount' };
    if (amount > user.balance) return { ok: false, error: 'Not enough HYPE balance' };

    const units = amount / trend.price;
    const impact = Math.min(0.12, amount / (trend.price * 400));
    const newPrice = Number((trend.price * (1 + impact)).toFixed(2));
    const now = Date.now();

    setState((s) => {
      const u = s.users[s.currentUserId];
      const existing = u.holdings.find((h) => h.trendId === trendId);
      let holdings;
      if (existing) {
        const totalUnits = existing.units + units;
        const totalCost = existing.avgCost * existing.units + amount;
        holdings = u.holdings.map((h) =>
          h.trendId === trendId ? { ...h, units: totalUnits, avgCost: totalCost / totalUnits } : h
        );
      } else {
        holdings = [...u.holdings, { trendId, units, avgCost: trend.price }];
      }
      const t = s.trends[trendId];
      return {
        ...s,
        users: {
          ...s.users,
          [s.currentUserId]: {
            ...u,
            balance: Number((u.balance - amount).toFixed(2)),
            holdings,
            activity: [
              { id: uid('a-'), type: 'invest', trendId, amount, units, price: trend.price, timestamp: now },
              ...u.activity,
            ],
          },
        },
        trends: {
          ...s.trends,
          [trendId]: {
            ...t,
            price: newPrice,
            history: [...t.history.slice(-119), { t: now, p: newPrice }],
            investorIds: t.investorIds.includes(s.currentUserId)
              ? t.investorIds
              : [...t.investorIds, s.currentUserId],
          },
        },
      };
    });

    return { ok: true };
  }, []);

  const sell = useCallback((trendId: string, units: number): { ok: boolean; error?: string } => {
    const prev = stateRef.current;
    const user = prev.users[prev.currentUserId];
    const trend = prev.trends[trendId];
    const holding = user.holdings.find((h) => h.trendId === trendId);
    if (!trend) return { ok: false, error: 'Trend not found' };
    if (!holding || units <= 0 || units > holding.units + 1e-9) {
      return { ok: false, error: 'Not enough units to sell' };
    }

    const proceeds = units * trend.price;
    const impact = Math.min(0.12, proceeds / (trend.price * 400));
    const newPrice = Math.max(0.5, Number((trend.price * (1 - impact)).toFixed(2)));
    const now = Date.now();

    setState((s) => {
      const u = s.users[s.currentUserId];
      const h = u.holdings.find((x) => x.trendId === trendId)!;
      const remaining = h.units - units;
      const holdings =
        remaining <= 1e-9
          ? u.holdings.filter((x) => x.trendId !== trendId)
          : u.holdings.map((x) => (x.trendId === trendId ? { ...x, units: remaining } : x));
      const t = s.trends[trendId];
      return {
        ...s,
        users: {
          ...s.users,
          [s.currentUserId]: {
            ...u,
            balance: Number((u.balance + proceeds).toFixed(2)),
            holdings,
            activity: [
              { id: uid('a-'), type: 'sell', trendId, amount: proceeds, units, price: trend.price, timestamp: now },
              ...u.activity,
            ],
          },
        },
        trends: {
          ...s.trends,
          [trendId]: {
            ...t,
            price: newPrice,
            history: [...t.history.slice(-119), { t: now, p: newPrice }],
          },
        },
      };
    });

    return { ok: true };
  }, []);

  const holdingFor = useCallback(
    (trendId: string) => currentUser.holdings.find((h) => h.trendId === trendId),
    [currentUser]
  );

  const value: StoreApi = {
    state,
    currentUser,
    trendsFeed,
    getTrend,
    getUser,
    createTrend,
    invest,
    sell,
    holdingFor,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreApi {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

