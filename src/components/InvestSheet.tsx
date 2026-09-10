import { useEffect, useState, type CSSProperties } from 'react';
import type { Trend } from '../types';
import { formatHype } from '../lib/format';
import { useAuth } from '../lib/auth';
import { investInTrend } from '../lib/hooks';
import { ApiClientError } from '../lib/api';
import SlideToConfirm from './SlideToConfirm';

interface Props {
  trend: Trend | null;
  onClose: () => void;
  onInvested?: (trend: Trend) => void;
}

const QUICK_AMOUNTS = [10, 25, 50, 100];

export default function InvestSheet({ trend, onClose, onInvested }: Props) {
  const { user, refresh } = useAuth();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setAmount('');
    setError(null);
    setSuccess(false);
    setBusy(false);
  }, [trend]);

  if (!trend || !user) return null;

  const numeric = Number(amount) || 0;
  const units = trend.price > 0 ? numeric / trend.price : 0;

  function handleQuick(v: number) {
    setAmount(String(v));
    setError(null);
  }

  function handleMax() {
    setAmount(user!.balance.toFixed(2));
    setError(null);
  }

  async function handleSubmit() {
    if (!trend) return;
    setBusy(true);
    setError(null);
    try {
      const res = await investInTrend(trend.id, numeric);
      await refresh();
      onInvested?.(res.trend);
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
      <div className="absolute inset-0 bg-ink-900/35 animate-fade-in" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md animate-sheet-up rounded-t-[2rem] border border-base-border bg-white p-5 pb-8 shadow-sheet safe-bottom">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-base-border" />

        {success ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-upSoft text-3xl">
              ✓
            </div>
            <p className="text-lg font-bold text-ink-900">Invested!</p>
            <p className="text-sm text-ink-500">
              {formatHype(numeric)} HYPE into {trend.name}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center gap-3">
              <img src={trend.image} alt={trend.name} className="h-12 w-12 rounded-xl object-cover" />
              <div>
                <h3 className="text-base font-bold text-ink-900">{trend.name}</h3>
                <p className="text-xs text-ink-400">{formatHype(trend.price)} HYPE · Invest</p>
              </div>
            </div>

            <div className="mb-4 rounded-2xl border border-base-border bg-base-muted p-4">
              <div className="flex items-center justify-between text-xs text-ink-400">
                <span>You pay</span>
                <span>Balance: {formatHype(user.balance)}</span>
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
                  className="w-full bg-transparent text-3xl font-extrabold tracking-tight text-ink-900 outline-none placeholder:text-ink-300"
                />
                <span className="text-sm font-semibold text-ink-400">HYPE</span>
              </div>
              <p className="mt-1 text-xs text-ink-400">
                ≈ {units > 0 ? units.toFixed(3) : '0'} units at {formatHype(trend.price)} HYPE
              </p>
            </div>

            <div className="mb-5">
              <input
                type="range"
                min={0}
                max={user.balance}
                step={user.balance > 0 ? Math.max(user.balance / 200, 0.01) : 1}
                value={Math.min(numeric, user.balance)}
                onChange={(e) => {
                  setAmount(Number(e.target.value).toFixed(2));
                  setError(null);
                }}
                disabled={user.balance <= 0}
                className="trade-slider"
                style={{ '--fill': `${user.balance > 0 ? (Math.min(numeric, user.balance) / user.balance) * 100 : 0}%` } as CSSProperties}
              />
              <div className="mt-1 flex justify-between text-[10px] text-ink-400">
                <span>0</span>
                <span>{formatHype(user.balance)} HYPE</span>
              </div>
            </div>

            <div className="mb-5 flex items-center gap-2">
              {QUICK_AMOUNTS.map((v) => (
                <button
                  key={v}
                  onClick={() => handleQuick(v)}
                  className="tap-scale flex-1 rounded-full border border-base-border bg-base-muted py-2 text-xs font-semibold text-ink-700"
                >
                  {v}
                </button>
              ))}
              <button
                onClick={handleMax}
                className="tap-scale flex-1 rounded-full border border-base-border bg-base-muted py-2 text-xs font-semibold text-ink-700"
              >
                Max
              </button>
            </div>

            {error && <p className="mb-3 text-center text-xs font-medium text-accent-down">{error}</p>}

            <SlideToConfirm
              label={`Slide to invest ${amount ? formatHype(numeric) : ''} HYPE`}
              onConfirm={handleSubmit}
              disabled={numeric <= 0}
              busy={busy}
            />
          </>
        )}
      </div>
    </div>
  );
}
