import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import api from './API/api.mjs';

import onlineData from './DATA/dataBase.mjs';
import localData from './DATA/dataBaseLocal.mjs';
import services from './SERVICES/services.mjs';
import { getAudienceMembers } from './EMAIL/mailchimpMarketing.mjs';

import { connectToMongo } from './DATA/mongoDb.mjs';

const PORT = 1904;
const DATABASE_ADMIN_USERNAME = process.env.DATABASE_ADMIN_USERNAME || 'admin';
const DATABASE_ADMIN_PASSWORD = process.env.DATABASE_ADMIN_PASSWORD || 'lisbonWhisper456fgh';
const DATABASE_TOKEN_TTL_MS = Number(process.env.DATABASE_TOKEN_TTL_MS || 1000 * 60 * 60 * 12);

let activeDatabaseSession = null;

function createDatabaseToken() {
  return crypto.randomBytes(32).toString('hex');
}

function extractBearerToken(authorizationHeader = '') {
  if (!authorizationHeader.startsWith('Bearer ')) {
    return '';
  }
  return authorizationHeader.slice('Bearer '.length).trim();
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

function parseNumber(value, fallback, min, max) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const floored = Math.floor(parsed);
  return Math.max(min, Math.min(max, floored));
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

async function startServer() {
  console.log('Start setting up server');

  let dataInit;

  // Connect to MongoDB (fallback to local in-memory DB when unavailable)
  try {
    await connectToMongo();
    console.log('Connected to MongoDB');
    dataInit = onlineData();
  } catch (err) {
    console.warn('MongoDB unavailable, using local in-memory DB for this run.', {
      message: err?.message || String(err),
    });
    dataInit = localData();
  }

  const app = express();


  const allowedOrigins = [
    'http://localhost:5173',
    'https://lisbonwhisper.com',
    'https://www.lisbonwhisper.com',
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const isAllowed =
          allowedOrigins.includes(origin) || /https:\/\/.*\.vercel\.app$/.test(origin);
        return isAllowed ? callback(null, true) : callback(new Error('Not allowed by CORS'));
      },
      methods: 'GET,POST,PUT,DELETE',
      credentials: true,
    })
  );

  app.use(express.json());

  const WhisperServices = services(dataInit);
  const whispers_API = api(WhisperServices);

  function requireDatabaseAuth(req, res, next) {
    const token = extractBearerToken(req.headers.authorization || '');

    if (!token) {
      return res.status(401).json({
        status: 401,
        message: 'Missing Authorization header. Use: Authorization: Bearer <token>',
      });
    }

    if (!activeDatabaseSession) {
      return res.status(401).json({
        status: 401,
        message: 'No active admin session. Authenticate at POST /database/auth',
      });
    }

    const isExpired = Date.now() > activeDatabaseSession.expiresAt;
    const isDifferentToken = token !== activeDatabaseSession.token;

    if (isExpired || isDifferentToken) {
      if (isExpired) {
        activeDatabaseSession = null;
      }

      return res.status(401).json({
        status: 401,
        message: 'Invalid or expired bearer token',
      });
    }

    req.databaseAdmin = {
      username: activeDatabaseSession.username,
      expiresAt: activeDatabaseSession.expiresAt,
    };

    return next();
  }

  app.get('/', (req, res) => {
    res.send('Welcome to the Whisper API!');
  });

  app.post('/database/auth', (req, res) => {
    const username = String(req.body?.username || '').trim();
    const password = String(req.body?.password || '');

    if (username !== DATABASE_ADMIN_USERNAME || password !== DATABASE_ADMIN_PASSWORD) {
      return res.status(401).json({
        status: 401,
        message: 'Invalid admin credentials',
      });
    }

    const token = createDatabaseToken();
    const expiresAt = Date.now() + DATABASE_TOKEN_TTL_MS;

    activeDatabaseSession = {
      token,
      username,
      expiresAt,
    };

    return res.json({
      status: 'authenticated',
      tokenType: 'Bearer',
      token,
      username,
      expiresAt: new Date(expiresAt).toISOString(),
    });
  });

  app.get('/database/home', requireDatabaseAuth, async (req, res) => {
    try {
      const bookingsResponse = await WhisperServices.getBookingAndProcessServices();
      const bookings = normalizeBookingsPayload(bookingsResponse);

      const upcomingBookings = bookings.filter((booking) => isDateInFuture(booking?.date)).length;
      const weekBookings = bookings.filter((booking) => isDateWithinNextDays(booking?.date, 7)).length;

      let mailchimpTotalClients = null;
      let mailchimpStatus = 'unavailable';

      try {
        const mailchimpResponse = await getAudienceMembers({ count: 1, offset: 0 });
        mailchimpTotalClients = mailchimpResponse.totalItems;
        mailchimpStatus = 'connected';
      } catch (mailchimpError) {
        console.warn('Mailchimp clients unavailable for /database/home', {
          message: mailchimpError?.message || String(mailchimpError),
        });
      }

      return res.json({
        title: 'Lisbon Whisper Database',
        subtitle: 'Database admin home',
        authenticatedAs: req.databaseAdmin.username,
        generatedAt: new Date().toISOString(),
        stats: {
          totalBookings: bookings.length,
          upcomingBookings,
          next7DaysBookings: weekBookings,
          mailchimpTotalClients,
          mailchimpStatus,
        },
      });
    } catch (error) {
      console.error('Error loading /database/home', error);
      return res.status(500).json({
        status: 500,
        message: 'Failed to load database home data',
      });
    }
  });

  app.get('/database/bookings', requireDatabaseAuth, async (req, res) => {
    try {
      const limit = parseNumber(req.query.limit, 200, 1, 2000);
      const bookingsResponse = await WhisperServices.getBookingAndProcessServices();
      const bookings = normalizeBookingsPayload(bookingsResponse);

      const sorted = bookings.sort((a, b) => {
        const aTime = Date.parse(a.createdAt || a.date || '');
        const bTime = Date.parse(b.createdAt || b.date || '');

        if (!Number.isFinite(aTime) && !Number.isFinite(bTime)) return 0;
        if (!Number.isFinite(aTime)) return 1;
        if (!Number.isFinite(bTime)) return -1;
        return bTime - aTime;
      });

      return res.json({
        total: sorted.length,
        count: Math.min(limit, sorted.length),
        bookings: sorted.slice(0, limit),
      });
    } catch (error) {
      console.error('Error loading /database/bookings', error);
      return res.status(500).json({
        status: 500,
        message: 'Failed to load bookings',
      });
    }
  });

  app.get('/database/mailchimp/clients', requireDatabaseAuth, async (req, res) => {
    const count = parseNumber(req.query.count, 200, 1, 1000);
    const offset = parseNumber(req.query.offset, 0, 0, 100000);

    try {
      const clientsResponse = await getAudienceMembers({ count, offset });
      return res.json({
        total: clientsResponse.totalItems,
        count: clientsResponse.count,
        audienceId: clientsResponse.audienceId,
        clients: clientsResponse.members,
      });
    } catch (error) {
      console.error('Error loading /database/mailchimp/clients', error);
      return res.status(502).json({
        status: 502,
        message:
          'Failed to load Mailchimp clients. Check MAILCHIMP_API_KEY, MAILCHIMP_SERVER_PREFIX and MAILCHIMP_AUDIENCE_ID.',
      });
    }
  });

  app.get('/bookings', whispers_API.getBookings);
  // app.get('/bookings/:id', whispers_API.getBookingById);

  // app.get('/getStoryTeller', whispers_API.getStoryTellers);
  // app.get('/getStoryTeller/:id', whispers_API.getStoryTellerById);

  // app.get('/walkingTours', whispers_API.getWalkingTours);
  // app.get('/walkingTours/:id', whispers_API.getWalkingTourById);

  app.post('/bookings', whispers_API.createBooking);
  app.post('/contact-form', whispers_API.sendContactForm);

  app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));

  console.log('End setting up server');
}

startServer();
