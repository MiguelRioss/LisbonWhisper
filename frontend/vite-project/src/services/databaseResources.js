import { useEffect } from 'react';
import { useFetchCache } from '../api/useFetch';
import { useJsonResource } from '../api/useJsonResource';
import { API_BASE } from './apiBase';

const MAX_AGE_MS = 60 * 1000;
const endpoints = {
  home: '/database/home',
  bookings: '/database/bookings?limit=300',
  clients: '/database/clients?count=300&offset=0',
  promoCodes: '/database/promo-codes',
  promoters: '/database/promoters',
};

function sessionKey(token, path) {
  return token && path ? `admin:${token}:${path}` : null;
}

export function useDatabaseResources(token, section) {
  const { evict, invalidate } = useFetchCache();
  const path = endpoints[section];
  const options = { maxAgeMs: MAX_AGE_MS };
  const read = (url, signal) => fetch(`${API_BASE}${url}`, {
    signal, cache: 'no-store', headers: { Authorization: `Bearer ${token}` },
  });
  const summary = useJsonResource(sessionKey(token, endpoints.home), (signal) => read(endpoints.home, signal), options);
  const records = useJsonResource(sessionKey(token, path), (signal) => read(path, signal), options);
  const promoCodeOptions = useJsonResource(
    sessionKey(section === 'promoters' ? token : null, endpoints.promoCodes),
    (signal) => read(endpoints.promoCodes, signal),
    options,
  );

  useEffect(() => {
    if (!token) return;
    return () => Object.values(endpoints).forEach((endpoint) => evict(sessionKey(token, endpoint)));
  }, [token, evict]);

  return {
    summary,
    records,
    promoCodeOptions,
    invalidateSection: (name) => {
      const key = sessionKey(token, endpoints[name]);
      if (key) invalidate(key);
    },
  };
}
