import { useEffect } from 'react';
import { useJsonResource } from '../api/useJsonResource';
import { fetchPublicData, bookingsCacheKey, toursCacheKey, tourCacheKey } from './bookingService';

const TOUR_CACHE_AGE_MS = 5 * 60 * 1000;
const AVAILABILITY_REFRESH_MS = 30 * 1000;

export function useTourCatalog(enabled = true) {
  const resource = useJsonResource(enabled ? toursCacheKey : null, fetchPublicData, { maxAgeMs: TOUR_CACHE_AGE_MS });
  return { ...resource, tours: Array.isArray(resource.data?.tours) ? resource.data.tours : undefined };
}

export function useTourDetails(id) {
  return useJsonResource(tourCacheKey(id), fetchPublicData, { maxAgeMs: TOUR_CACHE_AGE_MS });
}

export function useTourAvailability(enabled) {
  const resource = useJsonResource(enabled ? bookingsCacheKey : null, fetchPublicData, { maxAgeMs: AVAILABILITY_REFRESH_MS });
  const { refetch } = resource;
  useEffect(() => {
    if (!enabled) return;
    const timer = setInterval(refetch, AVAILABILITY_REFRESH_MS);
    return () => clearInterval(timer);
  }, [enabled, refetch]);
  return { ...resource, bookings: Array.isArray(resource.data?.bookings) ? resource.data.bookings : undefined };
}
