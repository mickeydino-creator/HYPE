import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { useTrendsFeed } from '../lib/hooks';
import TrendCard from '../components/TrendCard';
import InvestSheet from '../components/InvestSheet';
import type { Trend } from '../types';
import { formatHype } from '../lib/format';

export default function Feed() {
  const { user } = useAuth();
  const { data: trends, loading, error } = useTrendsFeed();
  const [active, setActive] = useState<Trend | null>(null);

  return (
    <div className="mx-auto max-w-md px-4 pb-28 pt-4 safe-top">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-ink-400">Welcome back</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">HYPE</h1>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-base-border bg-pastel-blue px-4 py-2">
          <span className="text-base">💠</span>
          <p className="text-sm font-bold text-brand">{user ? formatHype(user.balance) : '—'}</p>
        </div>
      </header>

      {loading && <p className="py-10 text-center text-sm text-ink-400">Loading trends…</p>}
      {error && <p className="py-10 text-center text-sm text-accent-down">{error}</p>}

      <div className="flex flex-col gap-5">
        {trends?.map((trend) => (
          <TrendCard key={trend.id} trend={trend} onInvest={setActive} />
        ))}
      </div>

      <InvestSheet trend={active} onClose={() => setActive(null)} />
    </div>
  );
}
