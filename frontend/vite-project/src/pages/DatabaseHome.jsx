import React, { useCallback, useEffect, useState } from 'react';
import {
  authenticateDatabaseAdmin,
  fetchDatabaseBookings,
  fetchDatabaseHome,
  fetchMailchimpClients,
} from '../services/databaseService';
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
  const [bookings, setBookings] = useState([]);
  const [mailchimpClients, setMailchimpClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingsError, setBookingsError] = useState('');
  const [mailchimpError, setMailchimpError] = useState('');
  const [lastRefresh, setLastRefresh] = useState('');

  const clearSession = useCallback(() => {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken('');
    setDashboard(null);
    setBookings([]);
    setMailchimpClients([]);
    setPassword('');
    setError('');
    setBookingsError('');
    setMailchimpError('');
  }, []);

  const loadDashboard = useCallback(async (tokenValue) => {
    setLoading(true);
    setError('');
    setBookingsError('');
    setMailchimpError('');

    try {
      const [homeResult, bookingsResult, clientsResult] = await Promise.allSettled([
        fetchDatabaseHome(tokenValue),
        fetchDatabaseBookings(tokenValue, { limit: 300 }),
        fetchMailchimpClients(tokenValue, { count: 300, offset: 0 }),
      ]);

      let authExpired = false;

      if (homeResult.status === 'fulfilled') {
        setDashboard(homeResult.value);
      } else {
        const homeError = homeResult.reason?.message || 'Unable to load dashboard';
        if (homeError.toLowerCase().includes('invalid or expired bearer token')) {
          authExpired = true;
        } else {
          setError(homeError);
        }
      }

      if (bookingsResult.status === 'fulfilled') {
        setBookings(Array.isArray(bookingsResult.value?.bookings) ? bookingsResult.value.bookings : []);
      } else {
        const bookingMessage = bookingsResult.reason?.message || 'Unable to load bookings';
        if (bookingMessage.toLowerCase().includes('invalid or expired bearer token')) {
          authExpired = true;
        }
        setBookingsError(bookingMessage);
        setBookings([]);
      }

      if (clientsResult.status === 'fulfilled') {
        setMailchimpClients(Array.isArray(clientsResult.value?.clients) ? clientsResult.value.clients : []);
      } else {
        const clientsMessage = clientsResult.reason?.message || 'Unable to load Mailchimp clients';
        if (clientsMessage.toLowerCase().includes('invalid or expired bearer token')) {
          authExpired = true;
        }
        setMailchimpError(clientsMessage);
        setMailchimpClients([]);
      }

      if (authExpired) {
        clearSession();
        setError('Session expired. Please authenticate again.');
        return;
      }

      setLastRefresh(new Date().toISOString());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load database home';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

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

  const handleLogout = () => clearSession();

  return (
    <main className="database-page">
      <section className="database-shell">
        <header className="database-header">
          <p className="database-kicker">Lisbon Whisper</p>
          <h1 className="database-title">Database Management</h1>
          <p className="database-subtitle">Clients from Mailchimp and all booking records in one place.</p>
        </header>

        {!token ? (
          <section className="database-login-card">
            <h2>Admin Access</h2>
            <p>Sign in to open the database management panel.</p>

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
                <p className="toolbar-label">Admin Session</p>
                <p className="toolbar-value">Active</p>
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

              <article className="database-stat-card">
                <p className="stat-label">Mailchimp Clients</p>
                <p className="stat-value">{dashboard?.stats?.mailchimpTotalClients ?? '-'}</p>
              </article>
            </div>

            <div className="database-meta">
              <p>
                <strong>Authenticated as:</strong> {dashboard?.authenticatedAs || 'admin'}
              </p>
              <p>
                <strong>Last refresh:</strong> {formatDate(lastRefresh || dashboard?.generatedAt)}
              </p>
            </div>

            <section className="database-table-section">
              <div className="table-heading">
                <h2>Bookings View</h2>
                <p>{bookings.length} records loaded</p>
              </div>
              {bookingsError && <p className="database-error">{bookingsError}</p>}
              {!bookingsError && (
                <div className="table-shell">
                  <table className="database-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Tour</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Persons</th>
                        <th>Total</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.length === 0 ? (
                        <tr>
                          <td colSpan={8}>No bookings found.</td>
                        </tr>
                      ) : (
                        bookings.map((booking) => (
                          <tr key={booking.id || `${booking.email}-${booking.date}-${booking.time}`}>
                            <td>{booking.name || '-'}</td>
                            <td>{booking.email || '-'}</td>
                            <td>{booking.tourName || '-'}</td>
                            <td>{booking.date || '-'}</td>
                            <td>{booking.time || '-'}</td>
                            <td>{booking.persons || '-'}</td>
                            <td>
                              {booking.totalPrice || booking.totalPrice === 0
                                ? `${booking.totalPrice} ${booking.currency || 'EUR'}`
                                : '-'}
                            </td>
                            <td>{formatDate(booking.createdAt)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="database-table-section">
              <div className="table-heading">
                <h2>Mailchimp Clients</h2>
                <p>{mailchimpClients.length} records loaded</p>
              </div>
              {mailchimpError && <p className="database-error">{mailchimpError}</p>}
              {!mailchimpError && (
                <div className="table-shell">
                  <table className="database-table">
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Source</th>
                        <th>Rating</th>
                        <th>Last Changed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mailchimpClients.length === 0 ? (
                        <tr>
                          <td colSpan={6}>No clients found.</td>
                        </tr>
                      ) : (
                        mailchimpClients.map((client) => (
                          <tr key={client.id || client.email}>
                            <td>{client.email || '-'}</td>
                            <td>
                              {client.fullName ||
                                [client.firstName, client.lastName].filter(Boolean).join(' ') ||
                                '-'}
                            </td>
                            <td>{client.status || '-'}</td>
                            <td>{client.source || '-'}</td>
                            <td>{client.memberRating ?? '-'}</td>
                            <td>{formatDate(client.lastChanged)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </section>
        )}

        {loading && <p className="database-status">Loading...</p>}
        {error && <p className="database-error database-error--global">{error}</p>}
      </section>
    </main>
  );
}

export default DatabaseHome;
