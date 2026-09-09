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
          <p className="text-xs font-medium text-white/40">Welcome back</p>
          <h1 className="text-2xl font-extrabold tracking-tight">HYPE</h1>
        </div>
        <div className="glass rounded-full px-4 py-2 text-right">
          <p className="text-[10px] font-medium uppercase tracking-wide text-white/40">Balance</p>
          <p className="text-sm font-bold">{user ? formatHype(user.balance) : '—'}</p>
        </div>
      </header>

      {loading && <p className="py-10 text-center text-sm text-white/40">Loading trends…</p>}
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
