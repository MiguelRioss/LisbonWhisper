import { API_BASE } from './apiBase';

export const bookingsCacheKey = `${API_BASE}/bookings`;
export const toursCacheKey = `${API_BASE}/tours`;
export const tourCacheKey = (id) => `${toursCacheKey}/${encodeURIComponent(id)}`;

export const fetchPublicData = (signal, url) => fetch(url, { signal });

// POST: Create a new booking
export const createBooking = async (bookingData) => {
  const response = await fetch(`${API_BASE}/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ booking: bookingData }),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message || `Failed to create booking: ${response.statusText}`);
  }

  return payload;
};
