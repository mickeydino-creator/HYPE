import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import { StoreProvider } from './lib/store';
import BottomNav from './components/BottomNav';
import Feed from './pages/Feed';
import Discover from './pages/Discover';
import Create from './pages/Create';
import Portfolio from './pages/Portfolio';
import Profile from './pages/Profile';
import TrendDetail from './pages/TrendDetail';

function Shell() {
  const location = useLocation();
  const hideNav = location.pathname.startsWith('/trend/');

  return (
    <div className="min-h-screen bg-black bg-noise text-white">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Feed />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/create" element={<Create />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/u/:userId" element={<Profile />} />
        <Route path="/trend/:id" element={<TrendDetail />} />
      </Routes>
      {!hideNav && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Shell />
      </HashRouter>
    </StoreProvider>
  );
}
