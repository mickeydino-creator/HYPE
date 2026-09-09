import { useEffect, useState, type CSSProperties } from 'react';
import type { Trend } from '../types';
import { formatHype } from '../lib/format';
import { useAuth } from '../lib/auth';
import { sellUnits } from '../lib/hooks';
import { ApiClientError } from '../lib/api';

export interface SellTarget {
  id: string;
  name: string;
  image: string;
  price: number;
}

interface Props {
  trend: SellTarget | null;
  unitsOwned: number;
  onClose: () => void;
  onSold?: (trend: Trend) => void;
}

export default function SellSheet({ trend, unitsOwned, onClose, onSold }: Props) {
  const { refresh } = useAuth();
  const [units, setUnits] = useState('0');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setUnits('0');
    setError(null);
    setSuccess(false);
    setBusy(false);
  }, [trend]);

  if (!trend) return null;

  const numeric = Number(units) || 0;
  const estValue = numeric * trend.price;

  function setFraction(fraction: number) {
    setUnits((unitsOwned * fraction).toFixed(6).replace(/\.?0+$/, '') || '0');
    setError(null);
  }

  async function handleSubmit() {
    if (!trend) return;
    setBusy(true);
    setError(null);
    try {
      const res = await sellUnits(trend.id, numeric);
      await refresh();
      onSold?.(res.trend);
      setSuccess(true);
      setTimeout(() => onClose(), 900);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/70 animate-fade-in" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md animate-pop rounded-t-[2rem] border border-white/10 bg-[#0d0d0d] p-5 pb-8 safe-bottom">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/15" />

        {success ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-up/15 text-3xl">
              ✓
            </div>
            <p className="text-lg font-bold">Sold!</p>
            <p className="text-sm text-white/50">{formatHype(estValue)} HYPE cashed out</p>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center gap-3">
              <img src={trend.image} alt={trend.name} className="h-12 w-12 rounded-xl object-cover" />
              <div>
                <h3 className="text-base font-bold">{trend.name}</h3>
                <p className="text-xs text-white/45">{formatHype(trend.price)} HYPE · Sell</p>
              </div>
            </div>

            <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between text-xs text-white/40">
                <span>Your holdings</span>
                <span>You own {unitsOwned.toFixed(3)} units</span>
              </div>
              <p className="mb-1 mt-2 text-xs font-medium text-white/40">Units to sell</p>
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  inputMode="decimal"
                  value={units}
                  onChange={(e) => {
                    setUnits(e.target.value.replace(/[^0-9.]/g, ''));
                    setError(null);
                  }}
                  placeholder="0"
                  className="w-full bg-transparent text-3xl font-extrabold tracking-tight outline-none placeholder:text-white/20"
                />
                <span className="text-sm font-semibold text-white/40">units</span>
              </div>
              <p className="mt-1 text-xs text-white/35">≈ {formatHype(estValue)} HYPE at {formatHype(trend.price)} HYPE</p>
            </div>

            <div className="mb-5">
              <input
                type="range"
                min={0}
                max={unitsOwned}
                step={unitsOwned > 0 ? Math.max(unitsOwned / 200, 0.000001) : 1}
                value={Math.min(numeric, unitsOwned)}
                onChange={(e) => {
                  setUnits(Number(e.target.value).toFixed(6).replace(/\.?0+$/, '') || '0');
                  setError(null);
                }}
                disabled={unitsOwned <= 0}
                className="trade-slider"
                style={
                  {
                    '--fill-color': '#ff5c5c',
                    '--fill': `${unitsOwned > 0 ? (Math.min(numeric, unitsOwned) / unitsOwned) * 100 : 0}%`,
                  } as CSSProperties
                }
              />
              <div className="mt-1 flex justify-between text-[10px] text-white/30">
                <span>0</span>
                <span>{unitsOwned.toFixed(3)} units</span>
              </div>
            </div>

            <div className="mb-5 flex items-center gap-2">
              <button
                onClick={() => setFraction(0.25)}
                className="tap-scale flex-1 rounded-full border border-white/10 bg-white/5 py-2 text-xs font-semibold text-white/70"
              >
                ¼
              </button>
              <button
                onClick={() => setFraction(0.5)}
                className="tap-scale flex-1 rounded-full border border-white/10 bg-white/5 py-2 text-xs font-semibold text-white/70"
              >
                ½
              </button>
              <button
                onClick={() => setFraction(0.75)}
                className="tap-scale flex-1 rounded-full border border-white/10 bg-white/5 py-2 text-xs font-semibold text-white/70"
              >
                ¾
              </button>
              <button
                onClick={() => setFraction(1)}
                className="tap-scale flex-1 rounded-full border border-white/10 bg-white/5 py-2 text-xs font-semibold text-white/70"
              >
                Sell All
              </button>
            </div>

            {error && <p className="mb-3 text-center text-xs font-medium text-accent-down">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={numeric <= 0 || numeric > unitsOwned + 1e-9 || busy}
              className="tap-scale w-full rounded-full bg-white py-3.5 text-sm font-bold text-black disabled:opacity-30"
            >
              {busy ? 'Selling…' : `Sell ${numeric > 0 ? numeric.toFixed(3) : ''} units`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
