import { useCallback, useEffect, useState } from 'react';

export type AppRoute = '/' | '/app' | '/account' | '/login' | '/signup';

const routes = new Set<AppRoute>(['/', '/app', '/account', '/login', '/signup']);

function getCurrentRoute(): AppRoute {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  return routes.has(path as AppRoute) ? (path as AppRoute) : '/';
}

export function useRoute() {
  const [route, setRoute] = useState<AppRoute>(() => getCurrentRoute());

  useEffect(() => {
    const handlePopState = () => setRoute(getCurrentRoute());
    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((nextRoute: AppRoute) => {
    window.history.pushState(null, '', nextRoute);
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const replace = useCallback((nextRoute: AppRoute) => {
    window.history.replaceState(null, '', nextRoute);
    setRoute(nextRoute);
    window.scrollTo({ top: 0 });
  }, []);

  return { route, navigate, replace };
}
