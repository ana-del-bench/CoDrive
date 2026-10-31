import { useEffect, useState } from 'react';
import { fetchRoute, type RoutePlan } from './api';
import { routeKey, type LocatedStop } from './route';

// Routes already fetched this session, so switching tabs does not ask Geoapify again.
const cache = new Map<string, RoutePlan>();

type State = { key: string; plan: RoutePlan | null; failed: boolean };

/** Fetches the driving route through the stops. Returns what is known now; never throws. */
export function useRoute(stops: LocatedStop[]) {
  const key = stops.length >= 2 ? routeKey(stops) : '';
  const [state, setState] = useState<State>({ key: '', plan: null, failed: false });

  useEffect(() => {
    if (!key) return;
    const cached = cache.get(key);
    if (cached) {
      setState({ key, plan: cached, failed: false });
      return;
    }
    let active = true;
    fetchRoute(stops)
      .then((plan) => {
        cache.set(key, plan);
        if (active) setState({ key, plan, failed: false });
      })
      .catch(() => {
        if (active) setState({ key, plan: null, failed: true });
      });
    return () => {
      active = false;
    };
    // `stops` is covered by `key`, which changes whenever a location does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const current = state.key === key ? state : null;
  return {
    plan: current?.plan ?? null,
    failed: current?.failed ?? false,
    loading: key !== '' && current === null,
  };
}
