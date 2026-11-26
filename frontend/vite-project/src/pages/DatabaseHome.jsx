import React, { useCallback, useEffect, useState } from 'react';
import { authenticateDatabaseAdmin, createPromoCode, createPromoter, savePromoterPromoCode } from '../services/databaseService';
import { Badge, Button, DatabaseShell, DataTable, Field, Modal } from '../database-generic/index.js';
import { useFetchCache } from '../api/useFetch';
import { tourCacheKey, toursCacheKey } from '../services/bookingService';
import { useDatabaseResources } from '../services/databaseResources';
import { useTourCatalog } from '../services/tourResources';
import TourEditor from './TourEditor';
import PromoterCodeField from './PromoterCodeField';
import './DatabaseHome.css';

const sections = [
  { id: 'bookings', title: 'Bookings', description: 'Reservations and checkout attempts' },
  { id: 'clients', title: 'Clients', description: 'Customer and enquiry records' },
  { id: 'tours', title: 'Tours', description: 'Tour catalogue' },
  { id: 'promoCodes', title: 'Promo Codes', description: 'Discount codes' },
  { id: 'promoters', title: 'Promoters', description: 'Company contacts' },
];

function BookingPaymentStatus({ status, total }) {
  if (status === 'paid') return <Badge tone="success">{total === 0 ? 'Confirmed · free' : 'Paid'}</Badge>;
  if (status === 'pending') return <Badge tone="warning">Awaiting payment</Badge>;
  if (status === 'checkout_failed') return <Badge tone="danger">Checkout failed</Badge>;
  return <Badge>Payment unverified</Badge>;
}

const bookingColumns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'tourName', label: 'Tour' },
  { key: 'date', label: 'Date' },
  { key: 'time', label: 'Time' },
  { key: 'persons', label: 'Persons' },
  { key: 'totalPrice', label: 'Total', render: (price, row) => price == null ? '—' : `${price} ${row.currency || 'EUR'}` },
  { key: 'paymentStatus', label: 'Payment', render: (status, row) => <BookingPaymentStatus status={status} total={row.totalPrice} /> },
  { key: 'promoCode', label: 'Promo code', render: (code) => code || '—' },
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
  { key: 'startingPoint', label: 'Starting point' },
  { key: 'priceCents', label: 'Price', render: (value) => Number.isInteger(value) ? `€${value / 100} per person` : '—' },
  { key: 'maxPersons', label: 'Group size', render: (value) => Number.isInteger(value) ? `1–${value} people` : '—' },
];

const promoCodeColumns = [
  { key: 'code', label: 'Code' },
  { key: 'discountPercent', label: 'Discount', render: (percentage) => `${percentage}%` },
  {
    key: 'promoters',
    label: 'Promoters',
    render: (promoters) => promoters?.length ? (
      <ul className="lisbon-promo-promoters">
        {promoters.map(({ _id, companyName, firstName, lastName }) => (
          <li key={_id}>{companyName} · {firstName} {lastName}</li>
        ))}
      </ul>
    ) : 'Unassigned',
  },
  { key: 'createdAt', label: 'Created', render: formatDate },
];
const promoterColumns = [
  { key: 'companyName', label: 'Company' },
  { key: 'firstName', label: 'First name' },
  { key: 'lastName', label: 'Last name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'promoCode', label: 'Promo code' },
];

function PromoterCodeEditor({ promoter, resource, token, onClose, onSaved, onCodeCreated }) {
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving || creating) return;
    const code = new FormData(event.currentTarget).get('promoCode');
    if (code === null) return;
    setSaving(true);
    setError('');
    try {
      await savePromoterPromoCode(token, promoter._id, code || null);
      onSaved();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <Modal open className="lisbon-tour-editor" title={`Promo code · ${promoter.companyName}`} onClose={() => { if (!saving && !creating) onClose(); }}>
      <form className="lisbon-tour-media-form" onSubmit={handleSubmit}>
        <PromoterCodeField resource={resource} token={token} value={promoter.promoCode} disabled={saving} onCreating={setCreating} onCreated={onCodeCreated} />
        {error && <p role="alert">{error}</p>}
        <Button type="submit" variant="primary" disabled={saving || creating}>
          {saving ? 'Saving…' : 'Save promo code'}
        </Button>
      </form>
    </Modal>
  );
}
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
  const [selectedTour, setSelectedTour] = useState(null);
  const [selectedPromoter, setSelectedPromoter] = useState(null);
  const [mediaNotice, setMediaNotice] = useState('');
  const { invalidate } = useFetchCache();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_STORAGE_KEY) || '');
  const catalog = useTourCatalog(Boolean(token) && section === 'tours');
  const { summary, records, promoCodeOptions, invalidateSection } = useDatabaseResources(token, section);
  const dashboard = summary.data;
  const [promoCodesError, setPromoCodesError] = useState('');
  const [savingPromoCode, setSavingPromoCode] = useState(false);
  const [promoterError, setPromoterError] = useState('');
  const [savingPromoter, setSavingPromoter] = useState(false);
  const [creatingPromoterCode, setCreatingPromoterCode] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  const clearSession = useCallback(() => {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken('');
    setSection('bookings');
    setSelectedTour(null);
    setSelectedPromoter(null);
    setMediaNotice('');
    setPromoCodesError('');
    setPromoterError('');
    setPassword('');
    setLoginError('');
  }, []);

  const sessionExpired = summary.statusCode === 401 || records.statusCode === 401 || promoCodeOptions.statusCode === 401;
  useEffect(() => {
    if (!token || !sessionExpired) return;
    clearSession();
    setLoginError('Session expired. Please sign in again.');
  }, [token, sessionExpired, clearSession]);

  const activeResource = section === 'tours' ? catalog : records;

  function refresh() {
    summary.refetch();
    activeResource.refetch();
    if (section === 'promoters') promoCodeOptions.refetch();
  }

  const handleLogin = async (event) => {
    event.preventDefault();
    setSigningIn(true);
    setLoginError('');

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
      setLoginError(message);
    } finally {
      setSigningIn(false);
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
      await createPromoCode(token, {
        code: fields.get('code'),
        discountPercent: Number(fields.get('discountPercent')),
      });
      invalidateSection('promoCodes');
      form.reset();
    } catch (err) {
      setPromoCodesError(err.message);
    } finally {
      setSavingPromoCode(false);
    }
  }

  async function handleCreatePromoter(event) {
    event.preventDefault();
    if (savingPromoter || creatingPromoterCode) return;
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    setPromoterError('');
    setSavingPromoter(true);
    try {
      await createPromoter(token, fields);
      invalidateSection('promoters');
      if (fields.promoCode) invalidateSection('promoCodes');
      form.reset();
    } catch (err) {
      setPromoterError(err.message);
    } finally {
      setSavingPromoter(false);
    }
  }

  const table = {
    bookings: { columns: bookingColumns, getRowId: (row) => row.id || `${row.email}-${row.date}-${row.time}` },
    clients: { columns: clientColumns, getRowId: (row) => row._id || row.email },
    tours: { columns: tourColumns, getRowId: (row) => row.slug },
    promoCodes: { columns: promoCodeColumns, getRowId: (row) => row.code },
    promoters: { columns: promoterColumns, getRowId: (row) => row._id },
  }[section];
  const payload = section === 'tours' ? catalog.tours : records.data?.[section];
  const rows = Array.isArray(payload) ? payload : [];
  const recordsError = !activeResource.loading && !Array.isArray(payload)
    ? activeResource.message || `Unable to load ${activeSection.title.toLowerCase()}.`
    : undefined;
  const summaryError = token && !summary.loading && !dashboard
    ? summary.message || 'Unable to load dashboard totals.'
    : undefined;

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
            <Button onClick={refresh} disabled={summary.loading || activeResource.loading || savingPromoCode || savingPromoter}>Refresh</Button>
            <Button onClick={clearSession} disabled={savingPromoCode || savingPromoter}>Sign out</Button>
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
                <Button type="submit" variant="primary" disabled={signingIn}>
                  {signingIn ? 'Signing in…' : 'Sign in'}
                </Button>
              </div>
            </form>
          </section>
        ) : (
          <>
            <dl className="lisbon-database-stats">
              {[
                ['Confirmed Bookings', dashboard?.stats?.confirmedBookings],
                ['Pending Checkouts', dashboard?.stats?.pendingCheckouts],
                ['Upcoming Confirmed', dashboard?.stats?.upcomingBookings],
                ['Confirmed Next 7 Days', dashboard?.stats?.next7DaysBookings],
                ['Clients', dashboard?.stats?.totalClients],
              ].map(([label, value]) => (
                <div className="db-card" key={label}><dt>{label}</dt><dd>{value ?? '—'}</dd></div>
              ))}
            </dl>

            <div className="db-toolbar">
              <div>
                <h2>{activeSection.title}</h2>
                <p className="db-muted">{rows.length} records loaded</p>
              </div>
              <p className="db-muted">
                Signed in as {dashboard?.authenticatedAs || username} · Last refresh {formatDate(dashboard?.generatedAt)}
              </p>
            </div>

            {section === 'promoCodes' && (
              <form className="db-form db-card lisbon-database-entry-form" onSubmit={handleCreatePromoCode}>
                <Field label="Code" name="code" maxLength={32} pattern="[A-Za-z0-9][A-Za-z0-9_\\-]{0,31}" required />
                <Field label="Discount (%)" name="discountPercent" type="number" min={1} max={100} step={1} required />
                <div className="db-actions">
                  <Button type="submit" variant="primary" disabled={activeResource.loading || savingPromoCode}>
                    {savingPromoCode ? 'Saving…' : 'Create code'}
                  </Button>
                </div>
                {promoCodesError && <p role="alert">{promoCodesError}</p>}
              </form>
            )}
            {section === 'promoters' && (
              <form className="db-form db-card lisbon-database-entry-form" onSubmit={handleCreatePromoter}>
                <Field label="Company name" name="companyName" autoComplete="organization" maxLength={160} required />
                <Field label="First name" name="firstName" autoComplete="given-name" maxLength={80} required />
                <Field label="Last name" name="lastName" autoComplete="family-name" maxLength={80} required />
                <Field label="Email" name="email" type="email" autoComplete="email" maxLength={254} required />
                <Field label="Phone number (optional)" name="phone" type="tel" autoComplete="tel" maxLength={40} />
                <PromoterCodeField
                  resource={promoCodeOptions}
                  token={token}
                  disabled={savingPromoter}
                  onCreating={setCreatingPromoterCode}
                  onCreated={() => invalidateSection('promoCodes')}
                />
                <div className="db-actions">
                  <Button type="submit" variant="primary" disabled={activeResource.loading || savingPromoter || creatingPromoterCode}>
                    {savingPromoter ? 'Saving…' : 'Add promoter'}
                  </Button>
                </div>
                {promoterError && <p role="alert">{promoterError}</p>}
              </form>
            )}
            <DataTable
              {...table}
              rows={rows}
              error={recordsError}
              loading={activeResource.loading && rows.length === 0}
              caption={activeSection.title}
              actions={section === 'tours' ? (tour) => (
                <>
                  <Button aria-label={`Edit tour ${tour.title}`} onClick={() => {
                    setMediaNotice('');
                    setSelectedTour({ tour, mode: 'details' });
                  }}>
                    Edit tour
                  </Button>
                  <Button aria-label={`Media Content for ${tour.title}`} onClick={() => {
                    setMediaNotice('');
                    setSelectedTour({ tour, mode: 'media' });
                  }}>
                    Media Content
                  </Button>
                </>
              ) : section === 'promoters' ? (promoter) => (
                <Button aria-label={`Assign promo code to ${promoter.firstName} ${promoter.lastName}`} onClick={() => setSelectedPromoter(promoter)}>
                  Assign promo code
                </Button>
              ) : undefined}
            />
            {section === 'tours' && mediaNotice && <p role="status">{mediaNotice}</p>}
            {selectedTour && (
              <TourEditor
                {...selectedTour}
                token={token}
                onClose={() => setSelectedTour(null)}
                onSaved={(slug, notice) => {
                  invalidate(toursCacheKey);
                  invalidate(tourCacheKey(slug));
                  setSelectedTour(null);
                  setMediaNotice(notice);
                }}
              />
            )}
            {selectedPromoter && (
              <PromoterCodeEditor
                promoter={selectedPromoter}
                resource={promoCodeOptions}
                token={token}
                onCodeCreated={() => invalidateSection('promoCodes')}
                onClose={() => setSelectedPromoter(null)}
                onSaved={() => {
                  invalidateSection('promoters');
                  invalidateSection('promoCodes');
                  setSelectedPromoter(null);
                }}
              />
            )}
          </>
        )}
        {loginError && <p role="alert">{loginError}</p>}
        {summaryError && <p role="alert">{summaryError}</p>}
      </DatabaseShell>
    </div>
  );
}

export default DatabaseHome;
