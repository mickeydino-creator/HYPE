import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { usePortfolio, useTransactions } from '../lib/hooks';
import { formatHype, timeAgo } from '../lib/format';
import SellSheet from '../components/SellSheet';
import type { Position } from '../types';

export default function Portfolio() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: summary, loading } = usePortfolio(refreshKey);
  const activity = useTransactions(refreshKey);
  const [sellTarget, setSellTarget] = useState<Position | null>(null);

  return (
    <div className="mx-auto max-w-md px-4 pb-28 pt-4 safe-top">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Portfolio</h1>
        <p className="text-sm text-white/45">Your virtual HYPE, at a glance.</p>
      </header>

      {loading && !summary && <p className="py-10 text-center text-sm text-white/40">Loading…</p>}

      {summary && (
        <div className="mb-6 rounded-xl2 border border-base-border bg-gradient-to-br from-white/[0.06] to-transparent p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-white/40">Net worth</p>
          <p className="mb-3 text-4xl font-extrabold tracking-tight">{formatHype(summary.netWorth)}</p>
          <div className="flex items-center gap-4 text-sm">
            <div>
              <p className="text-white/40">Cash balance</p>
              <p className="font-semibold">{formatHype(summary.balance)}</p>
            </div>
            <div>
              <p className="text-white/40">Invested</p>
              <p className="font-semibold">{formatHype(summary.portfolioValue)}</p>
            </div>
            <div>
              <p className="text-white/40">P/L</p>
              <p className={clsx('font-semibold', summary.totalPl >= 0 ? 'text-accent-up' : 'text-accent-down')}>
                {summary.totalPl >= 0 ? '+' : ''}
                {formatHype(summary.totalPl)} ({summary.totalPlPct >= 0 ? '+' : ''}
                {summary.totalPlPct.toFixed(1)}%)
              </p>
            </div>
          </div>
        </div>
      )}

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-bold text-white/70">Your investments</h2>
        {summary && summary.positions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 py-10 text-center">
            <p className="text-sm text-white/40">No investments yet.</p>
            <button onClick={() => navigate('/')} className="mt-2 text-sm font-semibold text-white">
              Explore trends →
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {summary?.positions.map((p) => (
              <div
                key={p.trendId}
                className="tap-scale flex items-center gap-3 rounded-2xl border border-base-border bg-base-card p-3"
                onClick={() => navigate(`/trend/${p.trendId}`)}
              >
                <img src={p.trendImage} alt={p.trendName} className="h-14 w-14 rounded-xl object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-bold">{p.trendName}</p>
                  <p className="text-xs text-white/40">{p.unitsOwned.toFixed(3)} units</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{formatHype(p.value)}</p>
                  <p className={clsx('text-xs font-semibold', p.pl >= 0 ? 'text-accent-up' : 'text-accent-down')}>
                    {p.pl >= 0 ? '+' : ''}
                    {p.plPct.toFixed(1)}%
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSellTarget(p);
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
        {activity.length === 0 ? (
          <p className="text-sm text-white/40">No activity yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {activity.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-xl border border-base-border bg-base-card px-3 py-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={clsx(
                      'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold',
                      a.type === 'BUY' && 'bg-accent-up/15 text-accent-up',
                      a.type === 'SELL' && 'bg-accent-down/15 text-accent-down',
                      a.type === 'CREATE' && 'bg-white/10 text-white'
                    )}
                  >
                    {a.type === 'BUY' ? '↑' : a.type === 'SELL' ? '↓' : '★'}
                  </span>
                  <div>
                    <p className="text-xs font-semibold">
                      {a.type === 'BUY' ? 'Invested in' : a.type === 'SELL' ? 'Sold' : 'Created'} {a.trendName}
                    </p>
                    <p className="text-[11px] text-white/35">{timeAgo(a.createdAt)} ago</p>
                  </div>
                </div>
                {a.type !== 'CREATE' && <p className="text-xs font-bold">{formatHype(a.totalValue)}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      <SellSheet
        trend={
          sellTarget
            ? { id: sellTarget.trendId, name: sellTarget.trendName, image: sellTarget.trendImage, price: sellTarget.currentPrice }
            : null
        }
        unitsOwned={sellTarget?.unitsOwned ?? 0}
        onClose={() => setSellTarget(null)}
        onSold={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}
