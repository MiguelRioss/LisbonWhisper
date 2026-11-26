import { API_BASE } from './apiBase';

export async function saveTour(token, id, changes, { media = false } = {}) {
  const response = await fetch(`${API_BASE}/database/tours/${encodeURIComponent(id)}${media ? '/media' : ''}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(changes),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 404 && !payload) {
      throw new Error('Tour editing is unavailable on this server. Check that the backend has been updated.');
    }
    throw new Error(buildErrorMessage('Unable to save tour', payload, response.statusText));
  }
  return payload;
}
export async function requestPromoCodes(token, promoCode) {
  const response = await fetch(`${API_BASE}/database/promo-codes`, {
    method: promoCode ? 'POST' : 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(promoCode && { 'Content-Type': 'application/json' }),
    },
    body: promoCode ? JSON.stringify(promoCode) : undefined,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(buildErrorMessage('Promo codes', payload, response.statusText));
  }
  return payload;
}

function buildErrorMessage(prefix, payload, fallbackStatusText = '') {
  if (payload?.message) {
    return `${prefix}: ${payload.message}`;
  }
  if (fallbackStatusText) {
    return `${prefix}: ${fallbackStatusText}`;
  }
  return prefix;
}

export const authenticateDatabaseAdmin = async ({ username, password }) => {
  const response = await fetch(`${API_BASE}/database/auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(buildErrorMessage('Authentication failed', payload, response.statusText));
  }

  return payload;
};

export const fetchDatabaseHome = async (token) => {
  const response = await fetch(`${API_BASE}/database/home`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(buildErrorMessage('Failed to load database home', payload, response.statusText));
  }

  return payload;
};

export const fetchDatabaseBookings = async (token, { limit = 200 } = {}) => {
  const response = await fetch(`${API_BASE}/database/bookings?limit=${encodeURIComponent(limit)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(buildErrorMessage('Failed to load bookings', payload, response.statusText));
  }

  return payload;
};

export const fetchDatabaseClients = async (token, { count = 200, offset = 0 } = {}) => {
  const query = new URLSearchParams({
    count: String(count),
    offset: String(offset),
  });

  const response = await fetch(`${API_BASE}/database/clients?${query.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(buildErrorMessage('Failed to load clients', payload, response.statusText));
  }

  return payload;
};
