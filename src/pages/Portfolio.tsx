import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { usePortfolio, useTransactions } from '../lib/hooks';
import { formatHype, timeAgo } from '../lib/format';
import SellSheet from '../components/SellSheet';
import SmartImage from '../components/SmartImage';
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
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Portfolio</h1>
        <p className="text-sm text-ink-400">Your virtual HYPE, at a glance.</p>
      </header>

      {loading && !summary && <p className="py-10 text-center text-sm text-ink-400">Loading…</p>}

      {summary && (
        <div className="mb-6 rounded-xl2 border border-base-border bg-base-surface p-5 shadow-card">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Net worth</p>
          <p className="mb-3 text-4xl font-extrabold tracking-tight text-ink-900">{formatHype(summary.netWorth)}</p>
          <div className="flex items-center gap-4 text-sm">
            <div>
              <p className="text-ink-400">Cash balance</p>
              <p className="font-semibold text-ink-900">{formatHype(summary.balance)}</p>
            </div>
            <div>
              <p className="text-ink-400">Invested</p>
              <p className="font-semibold text-ink-900">{formatHype(summary.portfolioValue)}</p>
            </div>
            <div>
              <p className="text-ink-400">P/L</p>
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
        <h2 className="mb-3 text-sm font-bold text-ink-700">Your investments</h2>
        {summary && summary.positions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-base-border bg-base-surface py-10 text-center">
            <p className="text-sm text-ink-400">No investments yet.</p>
            <button onClick={() => navigate('/')} className="mt-2 text-sm font-semibold text-ink-900">
              Explore trends →
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {summary?.positions.map((p) => (
              <div
                key={p.trendId}
                className="tap-scale flex items-center gap-3 rounded-2xl border border-base-border bg-base-surface p-3 shadow-card"
                onClick={() => navigate(`/trend/${p.trendId}`)}
              >
                <SmartImage src={p.trendImage} alt={p.trendName} className="h-14 w-14 shrink-0 rounded-xl" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-ink-900">{p.trendName}</p>
                  <p className="text-xs text-ink-400">{p.unitsOwned.toFixed(3)} units</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-ink-900">{formatHype(p.value)}</p>
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
                  className="tap-scale rounded-full border border-base-border bg-base-muted px-3 py-1.5 text-xs font-semibold text-ink-700"
                >
                  Sell
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold text-ink-700">Recent activity</h2>
        {activity.length === 0 ? (
          <p className="text-sm text-ink-400">No activity yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {activity.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-xl border border-base-border bg-base-surface px-3 py-2.5 shadow-card"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={clsx(
                      'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold',
                      a.type === 'BUY' && 'bg-accent-upSoft text-accent-up',
                      a.type === 'SELL' && 'bg-accent-downSoft text-accent-down',
                      a.type === 'CREATE' && 'bg-pastel-blue text-brand'
                    )}
                  >
                    {a.type === 'BUY' ? '↑' : a.type === 'SELL' ? '↓' : '★'}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-ink-900">
                      {a.type === 'BUY' ? 'Invested in' : a.type === 'SELL' ? 'Sold' : 'Created'} {a.trendName}
                    </p>
                    <p className="text-[11px] text-ink-400">{timeAgo(a.createdAt)} ago</p>
                  </div>
                </div>
                {a.type !== 'CREATE' && <p className="text-xs font-bold text-ink-900">{formatHype(a.totalValue)}</p>}
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
