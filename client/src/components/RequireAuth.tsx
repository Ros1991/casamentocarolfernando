import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { Splash } from './Splash';

export function RequireAuth() {
  const status = useStore((s) => s.authStatus);
  const loadMe = useStore((s) => s.loadMe);
  const loadConfig = useStore((s) => s.loadConfig);
  const location = useLocation();

  useEffect(() => {
    void loadConfig().catch(() => undefined);
    if (status === 'loading') void loadMe();
  }, [status, loadMe, loadConfig]);

  if (status === 'loading') return <Splash />;
  if (status === 'anon') return <Navigate to="/entrar" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
