import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { ApiClientError } from '../lib/api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login({ usernameOrEmail, password });
      navigate('/');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-base-bg px-6 safe-top">
      <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-2xl shadow-glow">💠</div>
      <h1 className="mb-1 text-3xl font-extrabold tracking-tight text-ink-900">HYPE</h1>
      <p className="mb-8 text-sm text-ink-400">Log in to keep riding your trends.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          value={usernameOrEmail}
          onChange={(e) => setUsernameOrEmail(e.target.value)}
          placeholder="Username or email"
          autoComplete="username"
          className="w-full rounded-2xl border border-base-border bg-white px-4 py-3 text-sm text-ink-900 shadow-card outline-none placeholder:text-ink-400"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          className="w-full rounded-2xl border border-base-border bg-white px-4 py-3 text-sm text-ink-900 shadow-card outline-none placeholder:text-ink-400"
        />

        {error && <p className="text-center text-xs font-medium text-accent-down">{error}</p>}

        <button
          type="submit"
          disabled={busy || !usernameOrEmail || !password}
          className="tap-scale mt-2 w-full rounded-full bg-brand py-3.5 text-sm font-bold text-white shadow-glow disabled:opacity-40"
        >
          {busy ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-400">
        New here?{' '}
        <Link to="/signup" className="font-semibold text-brand">
          Create an account
        </Link>
      </p>
    </div>
  );
}
