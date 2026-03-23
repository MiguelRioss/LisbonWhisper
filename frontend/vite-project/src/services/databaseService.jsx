const API_BASE = 'https://lisbonwhisper.onrender.com';

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
