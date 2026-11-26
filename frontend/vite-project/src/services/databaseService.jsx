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
async function createRecord(token, section, record, errorMessage) {
  const response = await fetch(`${API_BASE}/database/${section}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(record),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(buildErrorMessage(errorMessage, payload, response.statusText || `HTTP ${response.status}`));
  }
  return payload;
}

export const createPromoCode = (token, record) => createRecord(token, 'promo-codes', record, 'Promo codes');
export const createPromoter = (token, record) => createRecord(token, 'promoters', record, 'Unable to add promoter');

export async function savePromoterPromoCode(token, id, promoCode) {
  const response = await fetch(`${API_BASE}/database/promoters/${encodeURIComponent(id)}/promo-code`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ promoCode }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(buildErrorMessage('Unable to assign promo code', payload, response.statusText));
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
