import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { useCategories, useDebouncedValue, useTrendsFeed } from '../lib/hooks';
import TrendCard from '../components/TrendCard';
import InvestSheet from '../components/InvestSheet';
import type { Trend } from '../types';
import { formatHype } from '../lib/format';

export default function Discover() {
  const [category, setCategory] = useState<string>('All');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);
  const [active, setActive] = useState<Trend | null>(null);

  const categories = useCategories();
  const { data: filtered, loading } = useTrendsFeed({ category, q: debouncedQuery });
  const { data: trending } = useTrendsFeed({ sort: 'trending' });
  const topMovers = useMemo(() => (trending ?? []).slice(0, 5), [trending]);

  return (
    <div className="mx-auto max-w-md px-4 pb-28 pt-4 safe-top">
      <header className="mb-5">
        <h1 className="mb-4 text-2xl font-extrabold tracking-tight text-ink-900">Discover</h1>
        <div className="flex items-center gap-2 rounded-full border border-base-border bg-white px-4 py-3 shadow-card">
          <span className="text-ink-400">🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search trends"
            className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400"
          />
        </div>
      </header>

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-bold text-ink-700">Trending now</h2>
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
          {topMovers.map((t) => {
            const positive = t.change24h >= 0;
            return (
              <button
                key={t.id}
                onClick={() => setActive(t)}
                className="tap-scale relative w-40 shrink-0 overflow-hidden rounded-2xl border border-base-border bg-white text-left shadow-card"
              >
                <div className="relative h-24 w-full bg-base-muted">
                  <img src={t.image} alt={t.name} className="h-full w-full object-cover" />
                </div>
                <div className="p-2.5">
                  <p className="truncate text-xs font-bold text-ink-900">{t.name}</p>
                  <p className={clsx('text-[11px] font-semibold', positive ? 'text-accent-up' : 'text-accent-down')}>
                    {formatHype(t.price)} · {positive ? '+' : ''}
                    {t.change24h.toFixed(1)}%
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mb-4">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {['All', ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={clsx(
                'tap-scale shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors',
                category === c
                  ? 'border-brand bg-brand text-white'
                  : 'border-base-border bg-white text-ink-500'
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-5">
        {loading && <p className="py-10 text-center text-sm text-ink-400">Loading…</p>}
        {!loading && filtered?.length === 0 && (
          <p className="py-10 text-center text-sm text-ink-400">No trends found.</p>
        )}
        {filtered?.map((trend) => (
          <TrendCard key={trend.id} trend={trend} onInvest={setActive} />
        ))}
      </div>

      <InvestSheet trend={active} onClose={() => setActive(null)} />
    </div>
  );
}
