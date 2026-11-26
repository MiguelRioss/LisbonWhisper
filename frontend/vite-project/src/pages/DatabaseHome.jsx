import React, { useCallback, useEffect, useState } from 'react';
import {
  authenticateDatabaseAdmin,
  fetchDatabaseBookings,
  fetchDatabaseHome,
  requestPromoCodes,
  fetchDatabaseClients,
} from '../services/databaseService';
import { Button, DatabaseShell, DataTable, Field } from '../database-generic/index.js';
import { useFetch } from '../api/useFetch';
import { fetchPublicData, toursCacheKey } from '../services/bookingService';
import './DatabaseHome.css';

const sections = [
  { id: 'bookings', title: 'Bookings', description: 'Tour reservations' },
  { id: 'clients', title: 'Clients', description: 'Customer and enquiry records' },
  { id: 'tours', title: 'Tours', description: 'Tour catalogue' },
  { id: 'promoCodes', title: 'Promo Codes', description: 'Discount codes' },
];

const bookingColumns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'tourName', label: 'Tour' },
  { key: 'date', label: 'Date' },
  { key: 'time', label: 'Time' },
  { key: 'persons', label: 'Persons' },
  { key: 'totalPrice', label: 'Total', render: (price, row) => price == null ? '—' : `${price} ${row.currency || 'EUR'}` },
  { key: 'createdAt', label: 'Created', render: formatDate },
];

const clientColumns = [
  { key: 'email', label: 'Email' },
  { key: 'name', label: 'Name' },
  { key: 'phone', label: 'Phone' },
  { key: 'sources', label: 'Sources', render: (sources) => sources?.join(', ') || '—' },
  { key: 'createdAt', label: 'First seen', render: formatDate },
  { key: 'lastSeenAt', label: 'Last seen', render: formatDate },
];

const tourColumns = [
  { key: 'title', label: 'Tour' },
  { key: 'slug', label: 'URL slug' },
  { key: 'description', label: 'Description' },
];

const promoCodeColumns = [
  { key: 'code', label: 'Code' },
  { key: 'discountPercent', label: 'Discount', render: (percentage) => `${percentage}%` },
  { key: 'createdAt', label: 'Created', render: formatDate },
];
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
  const [section, setSection] = useState('bookings');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_STORAGE_KEY) || '');
  const { status: toursStatus, refetch: refetchTours } = useFetch(token ? toursCacheKey : null, fetchPublicData);
  const tourResult = toursStatus.kind === 'success' ? toursStatus : toursStatus.stale;
  const tours = tourResult?.body.kind === 'json' ? tourResult.body.json?.tours : undefined;
  const toursLoading = toursStatus.kind === 'idle' || toursStatus.kind === 'loading';
  const toursError = !toursLoading && (toursStatus.kind !== 'success' || !Array.isArray(tours))
    ? 'Unable to load tours from the API.'
    : '';
  const [dashboard, setDashboard] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [clients, setClients] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [promoCodesError, setPromoCodesError] = useState('');
  const [savingPromoCode, setSavingPromoCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingsError, setBookingsError] = useState('');
  const [clientsError, setClientsError] = useState('');
  const [lastRefresh, setLastRefresh] = useState('');

  const clearSession = useCallback(() => {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken('');
    setSection('bookings');
    setLastRefresh('');
    setDashboard(null);
    setBookings([]);
    setClients([]);
    setPromoCodes([]);
    setPromoCodesError('');
    setPassword('');
    setError('');
    setBookingsError('');
    setClientsError('');
  }, []);

  const loadDashboard = useCallback(async (tokenValue) => {
    setLoading(true);
    setError('');
    setBookingsError('');
    setClientsError('');

    try {
      setPromoCodesError('');
      const [homeResult, bookingsResult, clientsResult, promoCodesResult] = await Promise.allSettled([
        fetchDatabaseHome(tokenValue),
        fetchDatabaseBookings(tokenValue, { limit: 300 }),
        fetchDatabaseClients(tokenValue, { count: 300, offset: 0 }),
        requestPromoCodes(tokenValue),
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
        setClients(Array.isArray(clientsResult.value?.clients) ? clientsResult.value.clients : []);
      } else {
        const clientsMessage = clientsResult.reason?.message || 'Unable to load clients';
        if (clientsMessage.toLowerCase().includes('invalid or expired bearer token')) {
          authExpired = true;
        }
        setClientsError(clientsMessage);
        setClients([]);
      }

      if (promoCodesResult.status === 'fulfilled') {
        setPromoCodes(promoCodesResult.value?.promoCodes || []);
      } else {
        setPromoCodesError(promoCodesResult.reason?.message || 'Unable to load promo codes');
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

  const activeSection = sections.find(({ id }) => id === section);

  async function handleCreatePromoCode(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    setPromoCodesError('');
    setSavingPromoCode(true);
    try {
      const { promoCode } = await requestPromoCodes(token, {
        code: fields.get('code'),
        discountPercent: Number(fields.get('discountPercent')),
      });
      setPromoCodes((current) => [...current, promoCode].sort((a, b) => a.code.localeCompare(b.code)));
      form.reset();
    } catch (err) {
      setPromoCodesError(err.message);
    } finally {
      setSavingPromoCode(false);
    }
  }

  const table = {
    bookings: {
      rows: bookings,
      columns: bookingColumns,
      getRowId: (row) => row.id || `${row.email}-${row.date}-${row.time}`,
      error: bookingsError,
    },
    clients: { rows: clients, columns: clientColumns, getRowId: (row) => row._id || row.email, error: clientsError },
    tours: { rows: Array.isArray(tours) ? tours : [], columns: tourColumns, getRowId: (row) => row.slug, error: toursError },
    promoCodes: { rows: promoCodes, columns: promoCodeColumns, getRowId: (row) => row.code },
  }[section];

  return (
    <div className="lisbon-database">
      <DatabaseShell
        as="div"
        title="Database Management"
        description={token ? 'Tour reservations, clients and tour information.' : undefined}
        brand={<span>Lisbon Whisper</span>}
        sections={token ? sections : undefined}
        selected={section}
        onSelect={setSection}
        headerActions={token && (
          <div className="db-actions">
            <Button onClick={() => { loadDashboard(token); refetchTours(); }} disabled={loading || savingPromoCode}>Refresh</Button>
            <Button onClick={clearSession} disabled={savingPromoCode}>Sign out</Button>
          </div>
        )}
      >
        {!token ? (
          <section className="db-card lisbon-database-login">
            <h2>Administrator sign in</h2>
            <form className="db-form" onSubmit={handleLogin}>
              <Field label="Username" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required />
              <Field label="Password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
              <div className="db-actions">
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign in'}
                </Button>
              </div>
            </form>
          </section>
        ) : (
          <>
            <dl className="lisbon-database-stats">
              {[
                ['Total Bookings', dashboard?.stats?.totalBookings],
                ['Upcoming Bookings', dashboard?.stats?.upcomingBookings],
                ['Next 7 Days', dashboard?.stats?.next7DaysBookings],
                ['Clients', dashboard?.stats?.totalClients],
              ].map(([label, value]) => (
                <div className="db-card" key={label}><dt>{label}</dt><dd>{value ?? '—'}</dd></div>
              ))}
            </dl>

            <div className="db-toolbar">
              <div>
                <h2>{activeSection.title}</h2>
                <p className="db-muted">{table.rows.length} records loaded</p>
              </div>
              <p className="db-muted">
                Signed in as {dashboard?.authenticatedAs || username} · Last refresh {formatDate(lastRefresh || dashboard?.generatedAt)}
              </p>
            </div>

            {section === 'promoCodes' && (
              <form className="db-form db-card lisbon-database-promo-form" onSubmit={handleCreatePromoCode}>
                <Field label="Code" name="code" maxLength={32} pattern="[A-Za-z0-9][A-Za-z0-9_\\-]{0,31}" required />
                <Field label="Discount (%)" name="discountPercent" type="number" min={1} max={100} step={1} required />
                <div className="db-actions">
                  <Button type="submit" variant="primary" disabled={loading || savingPromoCode}>
                    {savingPromoCode ? 'Saving…' : 'Create code'}
                  </Button>
                </div>
                {promoCodesError && <p role="alert">{promoCodesError}</p>}
              </form>
            )}
            <DataTable
              {...table}
              loading={(section === 'tours' ? toursLoading : loading) && table.rows.length === 0}
              caption={activeSection.title}
            />
          </>
        )}
        {error && <p role="alert">{error}</p>}
      </DatabaseShell>
    </div>
  );
}

export default DatabaseHome;
