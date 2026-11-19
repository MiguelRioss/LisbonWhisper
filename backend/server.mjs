import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import api from './http/api.mjs';
import databaseManagementApi from './http/databaseManagementApi.mjs';

import onlineData from './repo/dataBase.mjs';
import localData from './repo/dataBaseLocal.mjs';
import createDatabaseAdminSessionData from './repo/databaseAdminSessionData.mjs';
import createMailchimpAudienceData from './repo/mailchimpAudienceData.mjs';
import services from './services/services.mjs';
import createDatabaseManagementServices from './services/databaseManagementServices.mjs';

import { connectToMongo } from './repo/mongoDb.mjs';
import CheckoutService from './services/checkout/CheckoutService.ts';
import WebhookService from './services/webhook/WebhookService.ts';
import CheckoutController from './http/checkout/CheckoutController.ts';
import WebhookController from './http/webhook/WebhookController.ts';
import BookingRepository from './repo/BookingRepository.ts';

const PORT = 1904;

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
  const bookings = new BookingRepository(dataInit);
  const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
  const checkout = new CheckoutController(new CheckoutService(bookings, stripe, process.env.WEBSITE_URL));
  const webhook = new WebhookController(new WebhookService(bookings, services(dataInit), stripe, process.env.STRIPE_WEBHOOK_SECRET));

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

  app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const result = await webhook.handle(req.body, req.headers['stripe-signature']);
    res.status(result.status).json(result.body);
  });
  app.use(express.json());
  app.post('/checkout', async (req, res) => {
    const result = await checkout.createSession(req.body);
    res.status(result.status).json(result.body);
  });

  const whisperServices = services(dataInit);
  const whispers_API = api(whisperServices);

  const databaseAdminSessionData = createDatabaseAdminSessionData();
  const mailchimpAudienceData = createMailchimpAudienceData();
  const databaseManagementServices = createDatabaseManagementServices({
    bookingsData: dataInit,
    mailchimpData: mailchimpAudienceData,
    adminSessionData: databaseAdminSessionData,
  });
  const databaseManagement_API = databaseManagementApi(databaseManagementServices);

  app.get('/', (req, res) => {
    res.send('Welcome to the Whisper API!');
  });

  app.post('/database/auth', databaseManagement_API.authenticateAdmin);
  app.get(
    '/database/home',
    databaseManagement_API.requireDatabaseAuth,
    databaseManagement_API.getDatabaseHome
  );
  app.get(
    '/database/bookings',
    databaseManagement_API.requireDatabaseAuth,
    databaseManagement_API.getDatabaseBookings
  );
  app.get(
    '/database/mailchimp/clients',
    databaseManagement_API.requireDatabaseAuth,
    databaseManagement_API.getMailchimpClients
  );

  app.get('/bookings', whispers_API.getBookings);

  app.post('/contact-form', whispers_API.sendContactForm);

  app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));

  console.log('End setting up server');
}

startServer();
