import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../lib/auth';
import { apiGet, apiSend } from '../lib/api';
import { formatHype, timeAgo } from '../lib/format';

interface Stats {
  userCount: number;
  trendCount: number;
  transactionCount: number;
  totalHypeInCirculation: number;
  totalTradedVolume: number;
}

interface AdminUser {
  id: string;
  username: string;
  displayName: string;
  balance: number;
  role: 'USER' | 'ADMIN';
  suspended: boolean;
  createdAt: string;
}

interface AdminTrend {
  id: string;
  name: string;
  creatorUsername: string;
  price: number;
  investorCount: number;
  removed: boolean;
}

interface AdminTransaction {
  id: string;
  username: string;
  trendName: string;
  type: string;
  units: number;
  totalValue: number;
  createdAt: string;
}

type Tab = 'stats' | 'users' | 'trends' | 'transactions';

export default function Admin() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('stats');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [trends, setTrends] = useState<AdminTrend[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    apiGet<Stats>('/admin/stats').then(setStats).catch(() => {});
    apiGet<{ users: AdminUser[] }>('/admin/users').then((r) => setUsers(r.users)).catch(() => {});
    apiGet<{ trends: AdminTrend[] }>('/admin/trends').then((r) => setTrends(r.trends)).catch(() => {});
    apiGet<{ transactions: AdminTransaction[] }>('/admin/transactions').then((r) => setTransactions(r.transactions)).catch(() => {});
  }, [user, refreshKey]);

  if (!user) return null;
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />;

  async function suspend(id: string, suspended: boolean) {
    await apiSend('POST', `/admin/users/${id}/${suspended ? 'unsuspend' : 'suspend'}`);
    setRefreshKey((k) => k + 1);
  }

  async function removeTrend(id: string) {
    await apiSend('DELETE', `/admin/trends/${id}`);
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-28 pt-4 safe-top">
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight">Admin</h1>
        <p className="text-sm text-white/45">Platform overview & moderation.</p>
      </header>

      <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto">
        {(['stats', 'users', 'trends', 'transactions'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              'tap-scale shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold capitalize',
              tab === t ? 'border-white bg-white text-black' : 'border-white/10 bg-white/[0.03] text-white/60'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'stats' && stats && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Users" value={stats.userCount} />
          <StatCard label="Trends" value={stats.trendCount} />
          <StatCard label="Transactions" value={stats.transactionCount} />
          <StatCard label="HYPE in circulation" value={formatHype(stats.totalHypeInCirculation)} />
          <StatCard label="Traded volume" value={formatHype(stats.totalTradedVolume)} full />
        </div>
      )}

      {tab === 'users' && (
        <div className="flex flex-col gap-2">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between rounded-2xl border border-base-border bg-base-card p-3">
              <div>
                <p className="text-sm font-bold">
                  @{u.username} {u.role === 'ADMIN' && <span className="text-[10px] text-white/40">ADMIN</span>}
                </p>
                <p className="text-xs text-white/40">{formatHype(u.balance)} HYPE · joined {timeAgo(u.createdAt)} ago</p>
              </div>
              {u.role !== 'ADMIN' && (
                <button
                  onClick={() => suspend(u.id, u.suspended)}
                  className={clsx(
                    'tap-scale rounded-full border px-3 py-1.5 text-xs font-semibold',
                    u.suspended ? 'border-accent-up/40 text-accent-up' : 'border-accent-down/40 text-accent-down'
                  )}
                >
                  {u.suspended ? 'Unsuspend' : 'Suspend'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'trends' && (
        <div className="flex flex-col gap-2">
          {trends.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-2xl border border-base-border bg-base-card p-3">
              <div>
                <p className="text-sm font-bold">{t.name}</p>
                <p className="text-xs text-white/40">
                  @{t.creatorUsername} · {formatHype(t.price)} HYPE · {t.investorCount} investors
                  {t.removed && ' · removed'}
                </p>
              </div>
              {!t.removed && (
                <button
                  onClick={() => removeTrend(t.id)}
                  className="tap-scale rounded-full border border-accent-down/40 px-3 py-1.5 text-xs font-semibold text-accent-down"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'transactions' && (
        <div className="flex flex-col gap-2">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-xl border border-base-border bg-base-card px-3 py-2.5">
              <div>
                <p className="text-xs font-semibold">
                  @{t.username} {t.type.toLowerCase()} {t.trendName}
                </p>
                <p className="text-[11px] text-white/35">{timeAgo(t.createdAt)} ago</p>
              </div>
              <p className="text-xs font-bold">{formatHype(t.totalValue)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, full }: { label: string; value: string | number; full?: boolean }) {
  return (
    <div className={clsx('rounded-2xl border border-base-border bg-base-card p-4', full && 'col-span-2')}>
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-xs text-white/40">{label}</p>
    </div>
  );
}
