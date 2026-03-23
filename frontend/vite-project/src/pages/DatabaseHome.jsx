import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { authenticateDatabaseAdmin, fetchDatabaseHome } from '../services/databaseService';
import './DatabaseHome.css';

const TOKEN_STORAGE_KEY = 'lisbonWhisperDatabaseBearerToken';

function formatDate(isoDate) {
  if (!isoDate) return '-';
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function DatabaseHome() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_STORAGE_KEY) || '');
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tokenPreview = useMemo(() => {
    if (!token) return '';
    if (token.length <= 16) return token;
    return `${token.slice(0, 8)}...${token.slice(-8)}`;
  }, [token]);

  const loadDashboard = useCallback(async (tokenValue) => {
    setLoading(true);
    setError('');

    try {
      const data = await fetchDatabaseHome(tokenValue);
      setDashboard(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load database home';
      setError(message);
      setDashboard(null);

      if (message.toLowerCase().includes('invalid or expired bearer token')) {
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken('');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }
    loadDashboard(token);
  }, [token, loadDashboard]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const authResponse = await authenticateDatabaseAdmin({ username, password });
      const nextToken = authResponse?.token || '';

      if (!nextToken) {
        throw new Error('Authentication succeeded but no token was returned');
      }

      sessionStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
      setToken(nextToken);
      setPassword('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken('');
    setDashboard(null);
    setPassword('');
    setError('');
  };

  return (
    <main className="database-page">
      <section className="database-shell">
        <header className="database-header">
          <p className="database-kicker">Lisbon Whisper</p>
          <h1 className="database-title">Database Management</h1>
          <p className="database-subtitle">
            This route is protected and requires an <strong>Authorization Bearer token</strong> in
            the request header.
          </p>
        </header>

        {!token ? (
          <section className="database-login-card">
            <h2>Admin Access</h2>
            <p>Use the single active account to get a Bearer token for this page.</p>

            <form className="database-login-form" onSubmit={handleLogin}>
              <label htmlFor="db-admin-username">Username</label>
              <input
                id="db-admin-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />

              <label htmlFor="db-admin-password">Password</label>
              <input
                id="db-admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />

              <button type="submit" disabled={loading}>
                {loading ? 'Authenticating...' : 'Authenticate'}
              </button>
            </form>
          </section>
        ) : (
          <section className="database-dashboard">
            <div className="database-toolbar">
              <div>
                <p className="toolbar-label">Active Session Token</p>
                <p className="toolbar-value">{tokenPreview}</p>
              </div>
              <div className="toolbar-actions">
                <button type="button" onClick={() => loadDashboard(token)} disabled={loading}>
                  Refresh
                </button>
                <button type="button" className="logout-button" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>

            <div className="database-code-block">
              <p>Required header:</p>
              <code>Authorization: Bearer {tokenPreview}</code>
            </div>

            <div className="database-stats-grid">
              <article className="database-stat-card">
                <p className="stat-label">Total Bookings</p>
                <p className="stat-value">{dashboard?.stats?.totalBookings ?? '-'}</p>
              </article>

              <article className="database-stat-card">
                <p className="stat-label">Upcoming Bookings</p>
                <p className="stat-value">{dashboard?.stats?.upcomingBookings ?? '-'}</p>
              </article>

              <article className="database-stat-card">
                <p className="stat-label">Next 7 Days</p>
                <p className="stat-value">{dashboard?.stats?.next7DaysBookings ?? '-'}</p>
              </article>
            </div>

            <div className="database-meta">
              <p>
                <strong>Authenticated as:</strong> {dashboard?.authenticatedAs || 'admin'}
              </p>
              <p>
                <strong>Token expires:</strong> {formatDate(dashboard?.tokenExpiresAt)}
              </p>
              <p>
                <strong>Last refresh:</strong> {formatDate(dashboard?.generatedAt)}
              </p>
            </div>
          </section>
        )}

        {loading && <p className="database-status">Loading...</p>}
        {error && <p className="database-error">{error}</p>}
      </section>
    </main>
  );
}

export default DatabaseHome;
