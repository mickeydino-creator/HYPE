import { useEffect, useState } from 'react';
import type { Trend } from '../types';
import { formatHype } from '../lib/format';
import { useStore } from '../lib/store';

interface Props {
  trend: Trend | null;
  mode: 'invest' | 'sell';
  onClose: () => void;
}

const QUICK_AMOUNTS = [10, 25, 50, 100];

export default function InvestSheet({ trend, mode, onClose }: Props) {
  const { currentUser, invest, sell, holdingFor } = useStore();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setAmount('');
    setError(null);
    setSuccess(false);
  }, [trend, mode]);

  if (!trend) return null;

  const holding = holdingFor(trend.id);
  const numeric = Number(amount) || 0;

  const maxValue = mode === 'invest' ? currentUser.balance : (holding?.units ?? 0) * trend.price;

  function handleQuick(v: number) {
    setAmount(String(v));
    setError(null);
  }

  function handleMax() {
    setAmount(maxValue.toFixed(2));
    setError(null);
  }

  function handleSubmit() {
    if (!trend) return;
    if (mode === 'invest') {
      const res = invest(trend.id, numeric);
      if (!res.ok) {
        setError(res.error ?? 'Something went wrong');
        return;
      }
    } else {
      const units = numeric / trend.price;
      const res = sell(trend.id, units);
      if (!res.ok) {
        setError(res.error ?? 'Something went wrong');
        return;
      }
    }
    setSuccess(true);
    setTimeout(() => onClose(), 900);
  }

  const units = trend.price > 0 ? numeric / trend.price : 0;

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
            <p className="text-lg font-bold">{mode === 'invest' ? 'Invested!' : 'Sold!'}</p>
            <p className="text-sm text-white/50">
              {mode === 'invest'
                ? `${formatHype(numeric)} HYPE into ${trend.name}`
                : `${formatHype(numeric)} HYPE cashed out`}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center gap-3">
              <img src={trend.image} alt={trend.name} className="h-12 w-12 rounded-xl object-cover" />
              <div>
                <h3 className="text-base font-bold">{trend.name}</h3>
                <p className="text-xs text-white/45">
                  {formatHype(trend.price)} HYPE · {mode === 'invest' ? 'Invest' : 'Sell'}
                </p>
              </div>
            </div>

            <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between text-xs text-white/40">
                <span>{mode === 'invest' ? 'You pay' : 'You receive value'}</span>
                <span>
                  {mode === 'invest'
                    ? `Balance: ${formatHype(currentUser.balance)}`
                    : `Holding: ${holding ? holding.units.toFixed(3) : '0'} units`}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <input
                  autoFocus
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value.replace(/[^0-9.]/g, ''));
                    setError(null);
                  }}
                  placeholder="0.00"
                  className="w-full bg-transparent text-3xl font-extrabold tracking-tight outline-none placeholder:text-white/20"
                />
                <span className="text-sm font-semibold text-white/40">HYPE</span>
              </div>
              <p className="mt-1 text-xs text-white/35">
                ≈ {units > 0 ? units.toFixed(3) : '0'} units at {formatHype(trend.price)} HYPE
              </p>
            </div>

            <div className="mb-5 flex items-center gap-2">
              {QUICK_AMOUNTS.map((v) => (
                <button
                  key={v}
                  onClick={() => handleQuick(v)}
                  className="tap-scale flex-1 rounded-full border border-white/10 bg-white/5 py-2 text-xs font-semibold text-white/70"
                >
                  {v}
                </button>
              ))}
              <button
                onClick={handleMax}
                className="tap-scale flex-1 rounded-full border border-white/10 bg-white/5 py-2 text-xs font-semibold text-white/70"
              >
                Max
              </button>
            </div>

            {error && <p className="mb-3 text-center text-xs font-medium text-accent-down">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={numeric <= 0}
              className="tap-scale w-full rounded-full bg-white py-3.5 text-sm font-bold text-black disabled:opacity-30"
            >
              {mode === 'invest' ? `Invest ${amount ? formatHype(numeric) : ''} HYPE` : `Sell ${amount ? formatHype(numeric) : ''} HYPE`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
