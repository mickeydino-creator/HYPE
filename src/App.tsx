import { Navigate, HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import { ThemeProvider } from './lib/theme';
import BottomNav from './components/BottomNav';
import Feed from './pages/Feed';
import Discover from './pages/Discover';
import Create from './pages/Create';
import Portfolio from './pages/Portfolio';
import Profile from './pages/Profile';
import TrendDetail from './pages/TrendDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Admin from './pages/Admin';

function ProtectedShell() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-bg">
        <p className="text-sm text-ink-400">Loading HYPE…</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const hideNav = location.pathname.startsWith('/trend/');

  return (
    <div className="min-h-screen bg-base-bg bg-noise text-ink-900">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Feed />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/create" element={<Create />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/u/:username" element={<Profile />} />
        <Route path="/trend/:id" element={<TrendDetail />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!hideNav && <BottomNav />}
    </div>
  );
}

function AuthGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-bg">
        <p className="text-sm text-ink-400">Loading HYPE…</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/" replace /> : <Signup />} />
      <Route path="/*" element={<ProtectedShell />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <AuthGate />
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
