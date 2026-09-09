import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../lib/store';
import { formatHype } from '../lib/format';

export default function Profile() {
  const { userId } = useParams();
  const { state, currentUser, getTrend } = useStore();
  const navigate = useNavigate();

  const user = userId ? state.users[userId] : currentUser;
  const isMe = user?.id === currentUser.id;

  const createdTrends = useMemo(
    () => (user ? user.createdTrendIds.map((id) => getTrend(id)).filter(Boolean) : []),
    [user, getTrend]
  ) as ReturnType<typeof getTrend>[];

  const portfolioValue = useMemo(() => {
    if (!user) return 0;
    return user.holdings.reduce((sum, h) => {
      const trend = getTrend(h.trendId);
      return sum + (trend ? h.units * trend.price : 0);
    }, 0);
  }, [user, getTrend]);

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 pt-16 text-center">
        <p className="text-white/50">User not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-28 pt-4 safe-top">
      {!isMe && (
        <button onClick={() => navigate(-1)} className="mb-4 text-sm text-white/50">
          ← Back
        </button>
      )}

      <header className="mb-6 flex flex-col items-center text-center">
        <img src={user.avatar} alt={user.username} className="mb-3 h-24 w-24 rounded-full border-2 border-white/10 object-cover" />
        <h1 className="text-xl font-extrabold">{user.displayName}</h1>
        <p className="mb-2 text-sm text-white/40">@{user.username}</p>
        <p className="max-w-xs text-sm text-white/60">{user.bio}</p>
      </header>

      <div className="mb-6 grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-base-border bg-base-card p-3 text-center">
          <p className="text-lg font-extrabold">{formatHype(user.balance)}</p>
          <p className="text-[11px] text-white/40">Balance</p>
        </div>
        <div className="rounded-2xl border border-base-border bg-base-card p-3 text-center">
          <p className="text-lg font-extrabold">{formatHype(portfolioValue)}</p>
          <p className="text-[11px] text-white/40">Portfolio</p>
        </div>
        <div className="rounded-2xl border border-base-border bg-base-card p-3 text-center">
          <p className="text-lg font-extrabold">{createdTrends.length}</p>
          <p className="text-[11px] text-white/40">Trends</p>
        </div>
      </div>

      {isMe && (
        <button
          onClick={() => navigate('/portfolio')}
          className="tap-scale mb-6 w-full rounded-full border border-white/15 py-3 text-sm font-semibold"
        >
          View full portfolio
        </button>
      )}

      <section>
        <h2 className="mb-3 text-sm font-bold text-white/70">Trends created</h2>
        {createdTrends.length === 0 ? (
          <p className="text-sm text-white/40">No trends created yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {createdTrends.map((trend) => {
              if (!trend) return null;
              const first = trend.history[0]?.p ?? trend.price;
              const change = first > 0 ? ((trend.price - first) / first) * 100 : 0;
              const positive = change >= 0;
              return (
                <button
                  key={trend.id}
                  onClick={() => navigate(`/trend/${trend.id}`)}
                  className="tap-scale overflow-hidden rounded-2xl border border-base-border bg-base-card text-left"
                >
                  <img src={trend.image} alt={trend.name} className="h-24 w-full object-cover" />
                  <div className="p-2.5">
                    <p className="truncate text-xs font-bold">{trend.name}</p>
                    <p className={positive ? 'text-[11px] font-semibold text-accent-up' : 'text-[11px] font-semibold text-accent-down'}>
                      {formatHype(trend.price)} · {positive ? '+' : ''}
                      {change.toFixed(1)}%
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
