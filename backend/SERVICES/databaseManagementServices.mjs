function parseNumber(value, fallback, min, max) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const floored = Math.floor(parsed);
  return Math.max(min, Math.min(max, floored));
}

function isDateInFuture(isoDate = '') {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }
  return parsed.getTime() >= Date.now();
}

function isDateWithinNextDays(isoDate = '', days = 7) {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  const now = Date.now();
  const end = now + days * 24 * 60 * 60 * 1000;
  const value = parsed.getTime();
  return value >= now && value <= end;
}

function normalizeBookingsPayload(bookingsResponse) {
  const bookings = Array.isArray(bookingsResponse?.bookings) ? bookingsResponse.bookings : [];

  return bookings.map((booking) => ({
    id: booking?._id || booking?.id || '',
    name: booking?.name || '',
    email: booking?.email || '',
    date: booking?.date || '',
    time: booking?.time || '',
    persons: booking?.persons ?? '',
    totalPrice: booking?.totalPrice ?? '',
    currency: booking?.currency || 'EUR',
    tourName: booking?.tourName || '',
    message: booking?.message || '',
    createdAt: booking?.createdAt || '',
  }));
}

export default function createDatabaseManagementServices({
  bookingsData,
  mailchimpData,
  adminSessionData,
}) {
  return {
    authenticateAdmin,
    validateSessionToken,
    getDatabaseHomeData,
    getBookingsView,
    getMailchimpClientsView,
  };

  function authenticateAdmin({ username, password }) {
    const isValid = adminSessionData.verifyCredentials(username, password);
    if (!isValid) {
      throw { status: 401, message: 'Invalid admin credentials' };
    }

    const session = adminSessionData.createSession(username);
    return {
      status: 'authenticated',
      tokenType: 'Bearer',
      token: session.token,
      username: session.username,
      expiresAt: new Date(session.expiresAt).toISOString(),
    };
  }

  function validateSessionToken(token) {
    if (!token) {
      throw {
        status: 401,
        message: 'Missing Authorization header. Use: Authorization: Bearer <token>',
      };
    }

    const activeSession = adminSessionData.getActiveSession();
    if (!activeSession) {
      throw {
        status: 401,
        message: 'No active admin session. Authenticate at POST /database/auth',
      };
    }

    const isExpired = Date.now() > activeSession.expiresAt;
    const isDifferentToken = token !== activeSession.token;

    if (isExpired || isDifferentToken) {
      if (isExpired) {
        adminSessionData.clearSession();
      }

      throw { status: 401, message: 'Invalid or expired bearer token' };
    }

    return {
      username: activeSession.username,
      expiresAt: activeSession.expiresAt,
    };
  }

  async function getDatabaseHomeData() {
    const bookingsResponse = await bookingsData.getBookings();
    const bookings = normalizeBookingsPayload(bookingsResponse);

    const upcomingBookings = bookings.filter((booking) => isDateInFuture(booking?.date)).length;
    const weekBookings = bookings.filter((booking) => isDateWithinNextDays(booking?.date, 7)).length;

    let mailchimpTotalClients = null;
    let mailchimpStatus = 'unavailable';

    try {
      const mailchimpResponse = await mailchimpData.getAudienceMembers({ count: 1, offset: 0 });
      mailchimpTotalClients = mailchimpResponse.totalItems;
      mailchimpStatus = 'connected';
    } catch (mailchimpError) {
      console.warn('Mailchimp clients unavailable for /database/home', {
        message: mailchimpError?.message || String(mailchimpError),
      });
    }

    return {
      title: 'Lisbon Whisper Database',
      subtitle: 'Database admin home',
      generatedAt: new Date().toISOString(),
      stats: {
        totalBookings: bookings.length,
        upcomingBookings,
        next7DaysBookings: weekBookings,
        mailchimpTotalClients,
        mailchimpStatus,
      },
    };
  }

  async function getBookingsView({ limit }) {
    const safeLimit = parseNumber(limit, 200, 1, 2000);
    const bookingsResponse = await bookingsData.getBookings();
    const bookings = normalizeBookingsPayload(bookingsResponse);

    const sorted = bookings.sort((a, b) => {
      const aTime = Date.parse(a.createdAt || a.date || '');
      const bTime = Date.parse(b.createdAt || b.date || '');

      if (!Number.isFinite(aTime) && !Number.isFinite(bTime)) return 0;
      if (!Number.isFinite(aTime)) return 1;
      if (!Number.isFinite(bTime)) return -1;
      return bTime - aTime;
    });

    return {
      total: sorted.length,
      count: Math.min(safeLimit, sorted.length),
      bookings: sorted.slice(0, safeLimit),
    };
  }

  async function getMailchimpClientsView({ count, offset }) {
    const safeCount = parseNumber(count, 200, 1, 1000);
    const safeOffset = parseNumber(offset, 0, 0, 100000);

    try {
      const clientsResponse = await mailchimpData.getAudienceMembers({
        count: safeCount,
        offset: safeOffset,
      });

      return {
        total: clientsResponse.totalItems,
        count: clientsResponse.count,
        audienceId: clientsResponse.audienceId,
        clients: clientsResponse.members,
      };
    } catch (error) {
      throw {
        status: 502,
        message:
          'Failed to load Mailchimp clients. Check MAILCHIMP_API_KEY, MAILCHIMP_SERVER_PREFIX and MAILCHIMP_AUDIENCE_ID.',
        details: error?.message || String(error),
      };
    }
  }
}
