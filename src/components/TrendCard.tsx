import { useNavigate } from 'react-router-dom';
import type { Trend } from '../types';
import { formatHype, formatPct } from '../lib/format';
import PriceChart from './PriceChart';

export default function TrendCard({ trend, onInvest }: { trend: Trend; onInvest: (trend: Trend) => void }) {
  const navigate = useNavigate();
  const positive = trend.change24h >= 0;

  return (
    <article
      className="animate-fade-in overflow-hidden rounded-xl2 border border-base-border bg-base-card tap-scale"
      onClick={() => navigate(`/trend/${trend.id}`)}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-base-surface">
        <img src={trend.image} alt={trend.name} className="h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white/85 backdrop-blur-sm">
          {trend.category}
        </span>
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <h3 className="text-lg font-bold leading-tight text-white">{trend.name}</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/u/${trend.creatorUsername}`);
              }}
              className="text-sm text-white/70"
            >
              @{trend.creatorUsername}
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <p className="mb-3 line-clamp-2 text-sm leading-snug text-white/60">{trend.description}</p>

        <div className="mb-3 flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold tracking-tight">{formatHype(trend.price)}</span>
              <span className="text-xs font-semibold text-white/40">HYPE</span>
            </div>
            <span className={positive ? 'text-xs font-semibold text-accent-up' : 'text-xs font-semibold text-accent-down'}>
              {positive ? '📈' : '📉'} {formatPct(trend.change24h)}
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
          className="tap-scale w-full rounded-full bg-white py-2.5 text-sm font-bold text-black"
        >
          Invest
        </button>
      </div>
    </article>
  );
}
