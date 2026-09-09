import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useStore } from '../lib/store';
import { formatHype, timeAgo } from '../lib/format';
import InvestSheet from '../components/InvestSheet';
import type { Trend } from '../types';

export default function Portfolio() {
  const { currentUser, getTrend } = useStore();
  const navigate = useNavigate();
  const [sellTarget, setSellTarget] = useState<Trend | null>(null);

  const positions = useMemo(() => {
    return currentUser.holdings
      .map((h) => {
        const trend = getTrend(h.trendId);
        if (!trend) return null;
        const value = h.units * trend.price;
        const cost = h.units * h.avgCost;
        const pl = value - cost;
        const plPct = cost > 0 ? (pl / cost) * 100 : 0;
        return { holding: h, trend, value, cost, pl, plPct };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => b.value - a.value);
  }, [currentUser.holdings, getTrend]);

  const portfolioValue = positions.reduce((sum, p) => sum + p.value, 0);
  const totalCost = positions.reduce((sum, p) => sum + p.cost, 0);
  const totalPl = portfolioValue - totalCost;
  const totalPlPct = totalCost > 0 ? (totalPl / totalCost) * 100 : 0;
  const netWorth = currentUser.balance + portfolioValue;

  return (
    <div className="mx-auto max-w-md px-4 pb-28 pt-4 safe-top">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Portfolio</h1>
        <p className="text-sm text-white/45">Your virtual HYPE, at a glance.</p>
      </header>

      <div className="mb-6 rounded-xl2 border border-base-border bg-gradient-to-br from-white/[0.06] to-transparent p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-white/40">Net worth</p>
        <p className="mb-3 text-4xl font-extrabold tracking-tight">{formatHype(netWorth)}</p>
        <div className="flex items-center gap-4 text-sm">
          <div>
            <p className="text-white/40">Cash balance</p>
            <p className="font-semibold">{formatHype(currentUser.balance)}</p>
          </div>
          <div>
            <p className="text-white/40">Invested</p>
            <p className="font-semibold">{formatHype(portfolioValue)}</p>
          </div>
          <div>
            <p className="text-white/40">P/L</p>
            <p className={clsx('font-semibold', totalPl >= 0 ? 'text-accent-up' : 'text-accent-down')}>
              {totalPl >= 0 ? '+' : ''}
              {formatHype(totalPl)} ({totalPlPct >= 0 ? '+' : ''}
              {totalPlPct.toFixed(1)}%)
            </p>
          </div>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-bold text-white/70">Your investments</h2>
        {positions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 py-10 text-center">
            <p className="text-sm text-white/40">No investments yet.</p>
            <button onClick={() => navigate('/')} className="mt-2 text-sm font-semibold text-white">
              Explore trends →
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {positions.map(({ holding, trend, value, pl, plPct }) => (
              <div
                key={trend.id}
                className="tap-scale flex items-center gap-3 rounded-2xl border border-base-border bg-base-card p-3"
                onClick={() => navigate(`/trend/${trend.id}`)}
              >
                <img src={trend.image} alt={trend.name} className="h-14 w-14 rounded-xl object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-bold">{trend.name}</p>
                  <p className="text-xs text-white/40">{holding.units.toFixed(3)} units</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{formatHype(value)}</p>
                  <p className={clsx('text-xs font-semibold', pl >= 0 ? 'text-accent-up' : 'text-accent-down')}>
                    {pl >= 0 ? '+' : ''}
                    {plPct.toFixed(1)}%
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSellTarget(trend);
                  }}
                  className="tap-scale rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold"
                >
                  Sell
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold text-white/70">Recent activity</h2>
        {currentUser.activity.length === 0 ? (
          <p className="text-sm text-white/40">No activity yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {currentUser.activity.slice(0, 20).map((a) => {
              const trend = getTrend(a.trendId);
              return (
                <div key={a.id} className="flex items-center justify-between rounded-xl border border-base-border bg-base-card px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={clsx(
                        'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold',
                        a.type === 'invest' && 'bg-accent-up/15 text-accent-up',
                        a.type === 'sell' && 'bg-accent-down/15 text-accent-down',
                        a.type === 'create' && 'bg-white/10 text-white'
                      )}
                    >
                      {a.type === 'invest' ? '↑' : a.type === 'sell' ? '↓' : '★'}
                    </span>
                    <div>
                      <p className="text-xs font-semibold">
                        {a.type === 'invest' ? 'Invested in' : a.type === 'sell' ? 'Sold' : 'Created'} {trend?.name ?? 'Trend'}
                      </p>
                      <p className="text-[11px] text-white/35">{timeAgo(a.timestamp)} ago</p>
                    </div>
                  </div>
                  {a.type !== 'create' && <p className="text-xs font-bold">{formatHype(a.amount)}</p>}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <InvestSheet trend={sellTarget} mode="sell" onClose={() => setSellTarget(null)} />
    </div>
  );
}
