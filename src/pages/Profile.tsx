import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useUserProfile } from '../lib/hooks';
import { formatHype } from '../lib/format';
import { ApiClientError } from '../lib/api';

export default function Profile() {
  const { username: routeUsername } = useParams();
  const { user: me, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  const username = routeUsername ?? me?.username;
  const { data, loading } = useUserProfile(username);

  const isSelf = !!me && data?.user.id === me.id;

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (me) {
      setDisplayName(me.displayName);
      setBio(me.bio);
    }
  }, [me]);

  if (loading) {
    return (
      <div className="mx-auto max-w-md px-4 pt-16 text-center">
        <p className="text-ink-400">Loading…</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-md px-4 pt-16 text-center">
        <p className="text-ink-500">User not found.</p>
      </div>
    );
  }

  const { createdTrends, portfolioValue } = data;
  // For our own profile, prefer the live auth state so edits reflect immediately
  // without waiting on a refetch of the public profile endpoint.
  const user = isSelf && me ? me : data.user;
  const displayedBalance = isSelf && me ? me.balance : undefined;

  async function handleSave() {
    setBusy(true);
    setError(null);
    try {
      await updateProfile({ displayName, bio });
      setEditing(false);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-28 pt-4 safe-top">
      {!isSelf && (
        <button onClick={() => navigate(-1)} className="mb-4 text-sm font-medium text-ink-500">
          ← Back
        </button>
      )}

      <header className="mb-6 flex flex-col items-center text-center">
        <img
          src={user.avatar}
          alt={user.username}
          className="mb-3 h-24 w-24 rounded-full border-4 border-white object-cover shadow-card"
        />
        {editing ? (
          <div className="w-full max-w-xs">
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mb-2 w-full rounded-xl border border-base-border bg-base-muted px-3 py-2 text-center text-sm text-ink-900 outline-none"
              placeholder="Display name"
            />
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              className="w-full resize-none rounded-xl border border-base-border bg-base-muted px-3 py-2 text-center text-sm text-ink-900 outline-none"
              placeholder="Bio"
            />
          </div>
        ) : (
          <>
            <h1 className="text-xl font-extrabold text-ink-900">{user.displayName}</h1>
            <p className="mb-2 text-sm text-ink-400">@{user.username}</p>
            <p className="max-w-xs text-sm text-ink-500">{user.bio || 'No bio yet.'}</p>
          </>
        )}
      </header>

      <div className="mb-6 grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-base-border bg-white p-3 text-center shadow-card">
          <p className="text-lg font-extrabold text-ink-900">{displayedBalance !== undefined ? formatHype(displayedBalance) : '—'}</p>
          <p className="text-[11px] text-ink-400">Balance</p>
        </div>
        <div className="rounded-2xl border border-base-border bg-white p-3 text-center shadow-card">
          <p className="text-lg font-extrabold text-ink-900">{formatHype(portfolioValue)}</p>
          <p className="text-[11px] text-ink-400">Portfolio</p>
        </div>
        <div className="rounded-2xl border border-base-border bg-white p-3 text-center shadow-card">
          <p className="text-lg font-extrabold text-ink-900">{createdTrends.length}</p>
          <p className="text-[11px] text-ink-400">Trends</p>
        </div>
      </div>

      {isSelf && (
        <div className="mb-6 flex flex-col gap-2">
          {editing ? (
            <>
              {error && <p className="text-center text-xs font-medium text-accent-down">{error}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="tap-scale flex-1 rounded-full border border-base-border bg-white py-3 text-sm font-semibold text-ink-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={busy}
                  className="tap-scale flex-1 rounded-full bg-brand py-3 text-sm font-bold text-white shadow-glow disabled:opacity-40"
                >
                  {busy ? 'Saving…' : 'Save'}
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/portfolio')}
                className="tap-scale w-full rounded-full border border-base-border bg-white py-3 text-sm font-semibold text-ink-700 shadow-card"
              >
                View full portfolio
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(true)}
                  className="tap-scale flex-1 rounded-full border border-base-border bg-white py-3 text-sm font-semibold text-ink-700 shadow-card"
                >
                  Edit profile
                </button>
                <button
                  onClick={() => logout()}
                  className="tap-scale flex-1 rounded-full border border-base-border bg-white py-3 text-sm font-semibold text-accent-down shadow-card"
                >
                  Log out
                </button>
              </div>
              {me?.role === 'ADMIN' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="tap-scale w-full rounded-full border border-base-border bg-white py-3 text-sm font-semibold text-ink-700 shadow-card"
                >
                  Admin dashboard
                </button>
              )}
            </>
          )}
        </div>
      )}

      <section>
        <h2 className="mb-3 text-sm font-bold text-ink-700">Trends created</h2>
        {createdTrends.length === 0 ? (
          <p className="text-sm text-ink-400">No trends created yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {createdTrends.map((trend) => {
              const positive = trend.change24h >= 0;
              return (
                <button
                  key={trend.id}
                  onClick={() => navigate(`/trend/${trend.id}`)}
                  className="tap-scale overflow-hidden rounded-2xl border border-base-border bg-white text-left shadow-card"
                >
                  <img src={trend.image} alt={trend.name} className="h-24 w-full bg-base-muted object-cover" />
                  <div className="p-2.5">
                    <p className="truncate text-xs font-bold text-ink-900">{trend.name}</p>
                    <p className={positive ? 'text-[11px] font-semibold text-accent-up' : 'text-[11px] font-semibold text-accent-down'}>
                      {formatHype(trend.price)} · {positive ? '+' : ''}
                      {trend.change24h.toFixed(1)}%
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
