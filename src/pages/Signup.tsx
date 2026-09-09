import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { ApiClientError } from '../lib/api';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signup({ username, email, password });
      navigate('/');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 safe-top">
      <h1 className="mb-1 text-3xl font-extrabold tracking-tight">Join HYPE</h1>
      <p className="mb-8 text-sm text-white/45">
        Get 1,000 virtual HYPE to start backing trends. No real money, ever.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          autoComplete="username"
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none placeholder:text-white/30"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
          autoComplete="email"
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none placeholder:text-white/30"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password (min. 8 characters)"
          autoComplete="new-password"
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none placeholder:text-white/30"
        />

        {error && <p className="text-center text-xs font-medium text-accent-down">{error}</p>}

        <button
          type="submit"
          disabled={busy || !username || !email || password.length < 8}
          className="tap-scale mt-2 w-full rounded-full bg-white py-3.5 text-sm font-bold text-black disabled:opacity-40"
        >
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-white/45">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-white">
          Log in
        </Link>
      </p>
    </div>
  );
}
