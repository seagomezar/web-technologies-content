import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import { ensureKoruMachineRegistry } from './utils/stateMachine';

ensureKoruMachineRegistry();

const Dashboard = lazy(() => import('./pages/Dashboard'));
const LiveSession = lazy(() => import('./pages/LiveSession'));
const Replay = lazy(() => import('./pages/Replay'));
const Analysis = lazy(() => import('./pages/Analysis'));

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Koru — AI Motorsport Coaching',
  '/dashboard': 'Dashboard | Koru',
  '/live': 'Live Session | Koru',
  '/replay': 'Replay | Koru',
  '/analysis': 'Lap Analysis | Koru',
};

function RouteTitleSync() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = ROUTE_TITLES[pathname] ?? 'Koru — AI Motorsport Coaching';
  }, [pathname]);
  return null;
}

export default function App() {
  const [apiKey, setApiKey] = useState<string | null>(
    () => localStorage.getItem('gemini_api_key')
  );

  const handleApiKeyChange = (key: string) => {
    if (key) {
      localStorage.setItem('gemini_api_key', key);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
    setApiKey(key || null);
  };

  return (
    <BrowserRouter>
      <RouteTitleSync />
      <div className="app">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/*" element={
            <>
              <a href="#main-content" className="skip-link visually-hidden">
                Skip to main content
              </a>
              <Navbar apiKey={apiKey} onApiKeyChange={handleApiKeyChange} />
              <main id="main-content" className="main-content">
                <Suspense fallback={<div className="chart-empty"><progress aria-label="Loading view" /></div>}>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/live" element={<LiveSession apiKey={apiKey} />} />
                    <Route path="/replay" element={<Replay apiKey={apiKey} />} />
                    <Route path="/analysis" element={<Analysis apiKey={apiKey} />} />
                  </Routes>
                </Suspense>
              </main>
            </>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
