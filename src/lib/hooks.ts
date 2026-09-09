import { useCallback, useEffect, useRef, useState } from 'react';
import type { ActivityItem, PortfolioSummary, PricePoint, PublicUser, Trend } from '../types';
import { apiGet, apiSend, apiUpload } from './api';
import { getSocket } from './socket';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useTrendsFeed(opts: { sort?: 'latest' | 'trending'; category?: string; q?: string } = {}) {
  const [state, setState] = useState<AsyncState<Trend[]>>({ data: null, loading: true, error: null });
  const { sort, category, q } = opts;

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const params = new URLSearchParams();
      if (sort) params.set('sort', sort);
      if (category && category !== 'All') params.set('category', category);
      if (q) params.set('q', q);
      const res = await apiGet<{ trends: Trend[] }>(`/trends?${params.toString()}`);
      setState({ data: res.trends, loading: false, error: null });
    } catch (err) {
      setState({ data: null, loading: false, error: err instanceof Error ? err.message : 'Failed to load' });
    }
  }, [sort, category, q]);

  useEffect(() => {
    load();
  }, [load]);

  // live updates: new trends + price ticks
  useEffect(() => {
    const socket = getSocket();
    socket.emit('subscribe:feed');

    function onCreated(trend: Trend) {
      setState((s) => (s.data ? { ...s, data: [trend, ...s.data] } : s));
    }
    function onPrice(payload: { trendId: string; price: number; change24h: number }) {
      setState((s) =>
        s.data
          ? {
              ...s,
              data: s.data.map((t) =>
                t.id === payload.trendId ? { ...t, price: payload.price, change24h: payload.change24h } : t
              ),
            }
          : s
      );
    }

    socket.on('trend:created', onCreated);
    socket.on('price:update', onPrice);
    return () => {
      socket.emit('unsubscribe:feed');
      socket.off('trend:created', onCreated);
      socket.off('price:update', onPrice);
    };
  }, []);

  return { ...state, reload: load };
}

export function useTrend(id: string | undefined) {
  const [state, setState] = useState<AsyncState<Trend>>({ data: null, loading: true, error: null });

  const load = useCallback(async () => {
    if (!id) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await apiGet<{ trend: Trend }>(`/trends/${id}`);
      setState({ data: res.trend, loading: false, error: null });
    } catch (err) {
      setState({ data: null, loading: false, error: err instanceof Error ? err.message : 'Failed to load' });
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!id) return;
    const socket = getSocket();
    socket.emit('subscribe:trend', id);

    function onPrice(payload: { trendId: string; price: number; change24h: number }) {
      if (payload.trendId !== id) return;
      setState((s) =>
        s.data
          ? {
              ...s,
              data: {
                ...s.data,
                price: payload.price,
                change24h: payload.change24h,
                history: [...s.data.history.slice(-119), { t: Date.now(), p: payload.price }],
              },
            }
          : s
      );
    }
    socket.on('price:update', onPrice);
    return () => {
      socket.emit('unsubscribe:trend', id);
      socket.off('price:update', onPrice);
    };
  }, [id]);

  return { ...state, reload: load };
}

export function useCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  useEffect(() => {
    apiGet<{ categories: string[] }>('/trends/categories')
      .then((res) => setCategories(res.categories))
      .catch(() => setCategories([]));
  }, []);
  return categories;
}

export function usePortfolio(refreshKey = 0) {
  const [state, setState] = useState<AsyncState<PortfolioSummary>>({ data: null, loading: true, error: null });
  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));
    apiGet<PortfolioSummary>('/portfolio')
      .then((res) => !cancelled && setState({ data: res, loading: false, error: null }))
      .catch((err) => !cancelled && setState({ data: null, loading: false, error: err.message }));
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);
  return state;
}

export function useTransactions(refreshKey = 0) {
  const [items, setItems] = useState<ActivityItem[]>([]);
  useEffect(() => {
    apiGet<{ transactions: ActivityItem[] }>('/portfolio/transactions')
      .then((res) => setItems(res.transactions))
      .catch(() => setItems([]));
  }, [refreshKey]);
  return items;
}

export function useUserProfile(username: string | undefined) {
  const [state, setState] = useState<
    AsyncState<{ user: PublicUser; isSelf: boolean; createdTrends: Trend[]; portfolioValue: number }>
  >({ data: null, loading: true, error: null });

  useEffect(() => {
    if (!username) return;
    setState({ data: null, loading: true, error: null });
    apiGet<{ user: PublicUser; isSelf: boolean; createdTrends: Trend[]; portfolioValue: number }>(
      `/users/${username}`
    )
      .then((res) => setState({ data: res, loading: false, error: null }))
      .catch((err) => setState({ data: null, loading: false, error: err.message }));
  }, [username]);

  return state;
}

export async function investInTrend(trendId: string, amount: number) {
  return apiSend<{ trend: Trend; unitsPurchased: number }>('POST', `/trends/${trendId}/invest`, { amount });
}

export async function sellUnits(trendId: string, units: number) {
  return apiSend<{ trend: Trend; proceeds: number }>('POST', `/trends/${trendId}/sell`, { units });
}

export async function createTrend(input: {
  name: string;
  description: string;
  category: string;
  startingPrice: number;
  image: File;
}) {
  const formData = new FormData();
  formData.append('name', input.name);
  formData.append('description', input.description);
  formData.append('category', input.category);
  formData.append('startingPrice', String(input.startingPrice));
  formData.append('image', input.image);
  return apiUpload<{ trend: Trend }>('/trends', formData);
}

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer.current);
  }, [value, delayMs]);
  return debounced;
}

export type { PricePoint };
