import { useFetch } from './useFetch';

export function useJsonResource(key, fetcher, options) {
  const { status, refetch } = useFetch(key, fetcher, options);
  const response = status.kind === 'success' ? status : status.stale;
  const data = response?.body.kind === 'json' ? response.body.json : undefined;
  const loading = status.kind === 'idle' || status.kind === 'loading';
  const statusCode = status.kind === 'non-success' ? status.response.status : undefined;
  const message = status.kind === 'non-success' && status.body.kind === 'json'
    ? status.body.json?.message
    : undefined;
  return { data, loading, statusCode, message, refetch };
}
