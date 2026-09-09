import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import clsx from 'clsx';
import { useStore } from '../lib/store';
import { formatHype, timeAgo } from '../lib/format';
import PriceChart from '../components/PriceChart';
import InvestSheet from '../components/InvestSheet';

const RANGES = [
  { label: '1H', points: 15 },
  { label: '1D', points: 48 },
  { label: 'All', points: 999 },
];

export default function TrendDetail() {
  const { id } = useParams();
  const { getTrend, getUser, holdingFor } = useStore();
  const navigate = useNavigate();
  const [sheetMode, setSheetMode] = useState<'invest' | 'sell' | null>(null);
  const [range, setRange] = useState(RANGES[1]);

  const trend = id ? getTrend(id) : undefined;

  if (!trend) {
    return (
      <div className="mx-auto max-w-md px-4 pt-16 text-center">
        <p className="text-white/50">Trend not found.</p>
      </div>
    );
  }

  const creator = getUser(trend.creatorId);
  const holding = holdingFor(trend.id);

  const first = trend.history[0]?.p ?? trend.price;
  const change = first > 0 ? ((trend.price - first) / first) * 100 : 0;
  const positive = change >= 0;
  const chartData = trend.history.slice(-range.points);

  return (
    <div className="pb-32">
      <div className="relative">
        <img src={trend.image} alt={trend.name} className="h-72 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/40" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-4 safe-top">
          <button
            onClick={() => navigate(-1)}
            className="tap-scale flex h-9 w-9 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm"
          >
            ←
          </button>
          <span className="rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
            {trend.category}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-3xl font-extrabold tracking-tight">{trend.name}</h1>
          <button onClick={() => navigate(`/u/${trend.creatorId}`)} className="mt-1 flex items-center gap-2">
            <img src={creator?.avatar} alt="" className="h-5 w-5 rounded-full object-cover" />
            <span className="text-sm text-white/70">@{creator?.username}</span>
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 pt-5">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight">{formatHype(trend.price)}</span>
              <span className="text-sm font-semibold text-white/40">HYPE</span>
            </div>
            <span className={clsx('text-sm font-semibold', positive ? 'text-accent-up' : 'text-accent-down')}>
              {positive ? '📈' : '📉'} {positive ? '+' : ''}
              {change.toFixed(1)}%
            </span>
          </div>
          <div className="flex gap-1.5">
            {RANGES.map((r) => (
              <button
                key={r.label}
                onClick={() => setRange(r)}
                className={clsx(
                  'tap-scale rounded-full border px-3 py-1 text-xs font-semibold',
                  range.label === r.label ? 'border-white bg-white text-black' : 'border-white/10 text-white/50'
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 rounded-xl2 border border-base-border bg-base-card p-3">
          <PriceChart data={chartData} positive={positive} height={180} interactive />
        </div>

        {holding && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <div>
              <p className="text-xs text-white/40">Your position</p>
              <p className="text-sm font-bold">{holding.units.toFixed(3)} units</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/40">Value</p>
              <p className="text-sm font-bold">{formatHype(holding.units * trend.price)} HYPE</p>
            </div>
          </div>
        )}

        <section className="mb-6">
          <h2 className="mb-2 text-sm font-bold text-white/70">About this trend</h2>
          <p className="text-sm leading-relaxed text-white/60">{trend.description}</p>
        </section>

        <section className="mb-8 flex items-center gap-6">
          <div>
            <p className="text-lg font-extrabold">{trend.investorIds.length}</p>
            <p className="text-xs text-white/40">Investors</p>
          </div>
          <div>
            <p className="text-lg font-extrabold">{formatHype(trend.startingPrice)}</p>
            <p className="text-xs text-white/40">Starting price</p>
          </div>
          <div>
            <p className="text-lg font-extrabold">{timeAgo(trend.createdAt)}</p>
            <p className="text-xs text-white/40">Ago</p>
          </div>
        </section>

        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md px-4 pb-6 safe-bottom">
          <div className="glass-strong flex gap-3 rounded-full p-2">
            <button
              onClick={() => setSheetMode('sell')}
              disabled={!holding}
              className="tap-scale flex-1 rounded-full border border-white/15 py-3 text-sm font-bold disabled:opacity-30"
            >
              Sell
            </button>
            <button
              onClick={() => setSheetMode('invest')}
              className="tap-scale flex-1 rounded-full bg-white py-3 text-sm font-bold text-black"
            >
              Invest
            </button>
          </div>
        </div>
      </div>

      <InvestSheet
        trend={sheetMode ? trend : null}
        mode={sheetMode ?? 'invest'}
        onClose={() => setSheetMode(null)}
      />
    </div>
  );
}
