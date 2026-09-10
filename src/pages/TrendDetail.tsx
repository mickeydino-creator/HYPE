import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import clsx from 'clsx';
import { useTrend, usePortfolio } from '../lib/hooks';
import { formatHype, timeAgo } from '../lib/format';
import PriceChart from '../components/PriceChart';
import InvestSheet from '../components/InvestSheet';
import SellSheet from '../components/SellSheet';
import GlassSurface from '../components/GlassSurface';

const RANGES = [
  { label: '1H', points: 15 },
  { label: '1D', points: 48 },
  { label: 'All', points: 999 },
];

export default function TrendDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: trend, loading } = useTrend(id);
  const [portfolioKey, setPortfolioKey] = useState(0);
  const { data: portfolio } = usePortfolio(portfolioKey);
  const [sheet, setSheet] = useState<'invest' | 'sell' | null>(null);
  const [range, setRange] = useState(RANGES[1]);

  if (loading) {
    return (
      <div className="mx-auto max-w-md px-4 pt-16 text-center">
        <p className="text-ink-400">Loading…</p>
      </div>
    );
  }

  if (!trend) {
    return (
      <div className="mx-auto max-w-md px-4 pt-16 text-center">
        <p className="text-ink-500">Trend not found.</p>
      </div>
    );
  }

  const holding = portfolio?.positions.find((p) => p.trendId === trend.id);
  const positive = trend.change24h >= 0;
  const chartData = trend.history.slice(-range.points);

  function refreshAfterTrade() {
    setPortfolioKey((k) => k + 1);
  }

  return (
    <div className="min-h-screen bg-base-bg pb-32">
      <div className="relative">
        <img src={trend.image} alt={trend.name} className="h-72 w-full bg-base-muted object-cover" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-4 safe-top">
          <button
            onClick={() => navigate(-1)}
            className="tap-scale flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink-900 shadow-soft backdrop-blur-sm"
          >
            ←
          </button>
          <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-brand shadow-soft backdrop-blur-sm">
            {trend.category}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-md rounded-t-[2rem] bg-base-bg px-4 pb-4 pt-5">
        <h1 className="mb-1 text-3xl font-extrabold tracking-tight text-ink-900">{trend.name}</h1>
        <button onClick={() => navigate(`/u/${trend.creatorUsername}`)} className="mb-4 flex items-center gap-2">
          <img src={trend.creatorAvatar} alt="" className="h-6 w-6 rounded-full object-cover" />
          <span className="text-sm font-medium text-ink-500">@{trend.creatorUsername}</span>
        </button>

        <div className="mb-4 flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-ink-900">{formatHype(trend.price)}</span>
              <span className="text-sm font-semibold text-ink-400">HYPE</span>
            </div>
            <span className={clsx('text-sm font-semibold', positive ? 'text-accent-up' : 'text-accent-down')}>
              {positive ? '↑' : '↓'} {positive ? '+' : ''}
              {trend.change24h.toFixed(1)}%
            </span>
          </div>
          <div className="flex gap-1.5">
            {RANGES.map((r) => (
              <button
                key={r.label}
                onClick={() => setRange(r)}
                className={clsx(
                  'tap-scale rounded-full border px-3 py-1 text-xs font-semibold',
                  range.label === r.label
                    ? 'border-brand bg-brand text-white'
                    : 'border-base-border bg-white text-ink-500'
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 rounded-xl2 border border-base-border bg-white p-3 shadow-card">
          <PriceChart data={chartData} positive={positive} height={180} interactive />
        </div>

        {holding && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-base-border bg-pastel-blue px-4 py-3">
            <div>
              <p className="text-xs text-ink-500">Your position</p>
              <p className="text-sm font-bold text-ink-900">{holding.unitsOwned.toFixed(3)} units</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-ink-500">Value</p>
              <p className="text-sm font-bold text-ink-900">{formatHype(holding.value)} HYPE</p>
            </div>
          </div>
        )}

        <section className="mb-6">
          <h2 className="mb-2 text-sm font-bold text-ink-700">About this trend</h2>
          <p className="text-sm leading-relaxed text-ink-500">{trend.description}</p>
        </section>

        <section className="mb-8 flex items-center gap-6 rounded-2xl border border-base-border bg-white p-4 shadow-card">
          <div>
            <p className="text-lg font-extrabold text-ink-900">{trend.investorCount}</p>
            <p className="text-xs text-ink-400">Investors</p>
          </div>
          <div>
            <p className="text-lg font-extrabold text-ink-900">{formatHype(trend.startingPrice)}</p>
            <p className="text-xs text-ink-400">Starting price</p>
          </div>
          <div>
            <p className="text-lg font-extrabold text-ink-900">{timeAgo(trend.createdAt)}</p>
            <p className="text-xs text-ink-400">Ago</p>
          </div>
        </section>

        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md px-4 pb-6 safe-bottom">
          <GlassSurface
            width="100%"
            height={68}
            borderRadius={28}
            backgroundOpacity={0.7}
            blur={8}
            displace={2}
            distortionScale={-140}
            className="w-full border border-base-border shadow-nav"
          >
            <div className="flex w-full gap-3 px-2">
              <button
                onClick={() => setSheet('sell')}
                disabled={!holding}
                className="tap-scale flex-1 rounded-full border border-base-border py-3 text-sm font-bold text-ink-700 disabled:opacity-30"
              >
                Sell
              </button>
              <button
                onClick={() => setSheet('invest')}
                className="tap-scale flex-1 rounded-full bg-brand py-3 text-sm font-bold text-white shadow-glow"
              >
                Invest
              </button>
            </div>
          </GlassSurface>
        </div>
      </div>

      <InvestSheet
        trend={sheet === 'invest' ? trend : null}
        onClose={() => setSheet(null)}
        onInvested={refreshAfterTrade}
      />
      <SellSheet
        trend={sheet === 'sell' && holding ? { id: trend.id, name: trend.name, image: trend.image, price: trend.price } : null}
        unitsOwned={holding?.unitsOwned ?? 0}
        onClose={() => setSheet(null)}
        onSold={refreshAfterTrade}
      />
    </div>
  );
}
