import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import api from './API/api.mjs';

import onlineData from './DATA/dataBase.mjs';
import localData from './DATA/dataBaseLocal.mjs';
import services from './SERVICES/services.mjs';

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
      const bookings = Array.isArray(bookingsResponse?.bookings) ? bookingsResponse.bookings : [];

      const upcomingBookings = bookings.filter((booking) => isDateInFuture(booking?.date)).length;
      const weekBookings = bookings.filter((booking) => isDateWithinNextDays(booking?.date, 7)).length;

      return res.json({
        title: 'Lisbon Whisper Database',
        subtitle: 'Database admin home',
        authenticatedAs: req.databaseAdmin.username,
        tokenExpiresAt: new Date(req.databaseAdmin.expiresAt).toISOString(),
        generatedAt: new Date().toISOString(),
        stats: {
          totalBookings: bookings.length,
          upcomingBookings,
          next7DaysBookings: weekBookings,
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
