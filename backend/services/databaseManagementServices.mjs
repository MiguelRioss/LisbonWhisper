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
  catalog,
  adminSessionData,
}) {
  return {
    authenticateAdmin,
    validateSessionToken,
    getDatabaseHomeData,
    getBookingsView,
    getDatabaseClientsView,
    getPromoCodes,
    createPromoCode,
    updateTourMedia,
    updateTourDetails,
  };

  function mediaUrl(value, label) {
    const url = typeof value === 'string' ? value.trim() : '';
    if (url.length <= 2048 && !/[\s\\\u0000-\u001f\u007f]/.test(url)) {
      if (url.startsWith('/') && !url.startsWith('//')) return url;
      try {
        const parsed = new URL(url);
        if (parsed.protocol === 'https:' && !parsed.username && !parsed.password) return url;
      } catch {
        // Invalid URLs are reported below.
      }
    }
    throw { status: 400, message: `${label} must be an HTTPS URL or a site-relative path.` };
  }

  async function updateTourMedia(id, input) {
    if (!Array.isArray(input?.carouselImages) || input.carouselImages.length < 1 || input.carouselImages.length > 10) {
      throw { status: 400, message: 'Enter between 1 and 10 carousel image URLs.' };
    }
    const image = mediaUrl(input.image, 'Main image');
    const tour = await catalog.updateTour(id, {
      videoSrc: mediaUrl(input.videoSrc, 'Home page video'),
      image,
      backgroundImage: image,
      availabilityImage: mediaUrl(input.availabilityImage, 'Check Availability image'),
      carouselImages: input.carouselImages.map((url) => mediaUrl(url, 'Carousel image')),
    });
    if (!tour) throw { status: 404, message: 'Tour not found' };
    return { tour };
  }

  async function updateTourDetails(id, input) {
    function text(value, label, maximum) {
      const result = typeof value === 'string' ? value.trim() : '';
      if (!result || result.length > maximum) {
        throw { status: 400, message: `${label} must be between 1 and ${maximum} characters.` };
      }
      return result;
    }
    const { priceCents, maxPersons } = input || {};
    if (!Number.isInteger(priceCents) || priceCents < 100 || priceCents > 1000000) {
      throw { status: 400, message: 'Price per person must be between €1 and €10,000.' };
    }
    if (!Number.isInteger(maxPersons) || maxPersons < 1 || maxPersons > 20) {
      throw { status: 400, message: 'Maximum group size must be between 1 and 20.' };
    }
    const description = text(input.description, 'Short description', 300);
    if (!Array.isArray(input.additionalDetails) || input.additionalDetails.length > 10) {
      throw { status: 400, message: 'Enter at most 10 additional paragraphs.' };
    }
    const tour = await catalog.updateTour(id, {
      title: text(input.title, 'Tour name', 120),
      tag: text(input.tag, 'Tour label', 40),
      description,
      descriptions: [description, ...input.additionalDetails.map((paragraph) => text(paragraph, 'Paragraph', 2000))],
      startingPoint: text(input.startingPoint, 'Starting point', 200),
      priceCents,
      maxPersons,
    });
    if (!tour) throw { status: 404, message: 'Tour not found' };
    return { tour };
  }
  async function getPromoCodes() {
    return { promoCodes: await catalog.getPromoCodes() };
  }

  async function createPromoCode(input) {
    const code = typeof input?.code === 'string' ? input.code.trim().toUpperCase() : '';
    const discountPercent = input?.discountPercent;
    if (!/^[A-Z0-9][A-Z0-9_-]{0,31}$/.test(code)) {
      throw { status: 400, message: 'Enter a code of 1–32 letters, digits, hyphens or underscores, starting with a letter or digit.' };
    }
    if (!Number.isInteger(discountPercent) || discountPercent < 1 || discountPercent > 100) {
      throw { status: 400, message: 'Enter a whole percentage from 1 to 100.' };
    }
    const promoCode = { code, discountPercent, createdAt: new Date().toISOString() };
    if (!(await catalog.createPromoCode(promoCode))) {
      throw { status: 409, message: 'That promo code already exists.' };
    }
    return { promoCode };
  }

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

    const [totalClients, tours] = await Promise.all([catalog.countClients(), catalog.getTours()]);

    return {
      title: 'Lisbon Whisper Database',
      subtitle: 'Database admin home',
      generatedAt: new Date().toISOString(),
      tours,
      stats: {
        totalBookings: bookings.length,
        upcomingBookings,
        next7DaysBookings: weekBookings,
        totalClients,
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

  async function getDatabaseClientsView({ count, offset }) {
    const safeCount = parseNumber(count, 200, 1, 1000);
    const safeOffset = parseNumber(offset, 0, 0, 100000);

    const [clients, total] = await Promise.all([
      catalog.getClients({ count: safeCount, offset: safeOffset }),
      catalog.countClients(),
    ]);
    return { clients, total, count: clients.length };
  }
}
