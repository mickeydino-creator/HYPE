import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import type { Trend } from '../types';
import { formatHype, formatPct, timeAgo } from '../lib/format';
import PriceChart from './PriceChart';
import SmartImage from './SmartImage';

export default function TrendCard({ trend, onInvest }: { trend: Trend; onInvest: (trend: Trend) => void }) {
  const navigate = useNavigate();
  const positive = trend.change24h >= 0;

  return (
    <article
      className="animate-fade-in overflow-hidden rounded-xl2 border border-base-border bg-white p-4 tap-scale shadow-card"
      onClick={() => navigate(`/trend/${trend.id}`)}
    >
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/u/${trend.creatorUsername}`);
          }}
          className="flex items-center gap-2"
        >
          <img src={trend.creatorAvatar} alt="" className="h-8 w-8 rounded-full object-cover" />
          <div className="text-left">
            <p className="text-sm font-semibold text-ink-900">@{trend.creatorUsername}</p>
            <p className="text-[11px] text-ink-400">{timeAgo(trend.createdAt)} ago</p>
          </div>
        </button>
        <span className="rounded-full bg-pastel-blue px-2.5 py-1 text-[11px] font-semibold text-brand">
          {trend.category}
        </span>
      </div>

      <h3 className="mb-3 text-lg font-extrabold leading-snug text-ink-900">{trend.name}</h3>

      <SmartImage src={trend.image} alt={trend.name} className="mb-3 aspect-[16/10] w-full rounded-2xl" />

      <p className="mb-4 line-clamp-2 text-sm leading-snug text-ink-500">{trend.description}</p>

      <div className="mb-4 flex items-center gap-3">
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold tracking-tight text-ink-900">{formatHype(trend.price)}</span>
            <span className="text-xs font-semibold text-ink-400">HYPE</span>
          </div>
          <span
            className={clsx(
              'text-xs font-semibold',
              positive ? 'text-accent-up' : 'text-accent-down'
            )}
          >
            {positive ? '↑' : '↓'} {formatPct(trend.change24h)}
          </span>
        </div>
        <div className="h-12 w-24">
          <PriceChart data={trend.history} positive={positive} height={48} />
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onInvest(trend);
        }}
        className="tap-scale w-full rounded-full bg-brand py-3 text-sm font-bold text-white shadow-glow"
      >
        Invest
      </button>
    </article>
  );
}
