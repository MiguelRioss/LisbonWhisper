import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import api from './http/api.mjs';
import databaseManagementApi from './http/databaseManagementApi.mjs';

import onlineData from './repo/dataBase.mjs';
import localData from './repo/dataBaseLocal.mjs';
import createDatabaseAdminSessionData from './repo/databaseAdminSessionData.mjs';
import createCatalogData from './repo/catalogData.mjs';
import services from './services/services.mjs';
import createDatabaseManagementServices from './services/databaseManagementServices.mjs';

import { connectToMongo } from './repo/mongoDb.mjs';
import CheckoutService from './services/checkout/CheckoutService.ts';
import WebhookService from './services/webhook/WebhookService.ts';
import CheckoutController from './http/checkout/CheckoutController.ts';
import WebhookController from './http/webhook/WebhookController.ts';
import BookingRepository from './repo/BookingRepository.ts';
import StripeAdapter from './services/stripe/StripeAdapter.ts';

const PORT = Number(process.env.PORT || 1904);

async function startServer() {
  console.log('Start setting up server');
  const stripeAdapter = StripeAdapter.fromEnvironment(process.env);

  let dataInit;

  // Connect to MongoDB (fallback to local in-memory DB when unavailable)
  try {
    await connectToMongo();
    console.log('Connected to MongoDB');
    dataInit = onlineData();
  } catch (err) {
    if (stripeAdapter.isLive) throw err;
    console.warn('MongoDB unavailable, using local in-memory DB for this run.', {
      message: err?.message || String(err),
    });
    dataInit = localData();
  }

  const app = express();
  const catalog = await createCatalogData();
  const whisperServices = services(dataInit, catalog);
  const bookings = new BookingRepository(dataInit);
  const checkout = new CheckoutController(new CheckoutService(bookings, stripeAdapter.client, process.env.WEBSITE_URL, catalog));
  const webhook = new WebhookController(new WebhookService(
    bookings, whisperServices, stripeAdapter.client, stripeAdapter.webhookSecret, stripeAdapter.mode, catalog
  ));

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
  app.post('/checkout/quote', async (req, res) => {
    const result = await checkout.quote(req.body);
    res.set('Cache-Control', 'no-store').status(result.status).json(result.body);
  });
  app.post('/checkout', async (req, res) => {
    const result = await checkout.createSession(req.body);
    res.status(result.status).json(result.body);
  });

  const whispers_API = api(whisperServices);

  const databaseAdminSessionData = createDatabaseAdminSessionData();
  const databaseManagementServices = createDatabaseManagementServices({
    bookingsData: dataInit,
    catalog,
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
    '/database/clients',
    databaseManagement_API.requireDatabaseAuth,
    databaseManagement_API.getDatabaseClients
  );

  app.get('/bookings', whispers_API.getBookings);
  app.put('/database/tours/:id/media', databaseManagement_API.requireDatabaseAuth, databaseManagement_API.updateTourMedia);
  app.put('/database/tours/:id', databaseManagement_API.requireDatabaseAuth, databaseManagement_API.updateTourDetails);
  app.route('/database/promo-codes')
    .get(databaseManagement_API.requireDatabaseAuth, databaseManagement_API.getPromoCodes)
    .post(databaseManagement_API.requireDatabaseAuth, databaseManagement_API.createPromoCode);
  app.route('/database/promoters')
    .get(databaseManagement_API.requireDatabaseAuth, databaseManagement_API.getPromoters)
    .post(databaseManagement_API.requireDatabaseAuth, databaseManagement_API.createPromoter);
  app.put(
    '/database/promoters/:id/promo-code',
    databaseManagement_API.requireDatabaseAuth,
    databaseManagement_API.updatePromoterPromoCode
  );
  app.get('/tours', async (_req, res) => {
    try {
      res.json({ tours: await catalog.getTours() });
    } catch (error) {
      console.error('Unable to load tours', error);
      res.status(500).json({ message: 'Unable to load tours' });
    }
  });
  app.get('/tours/:id', async (req, res) => {
    try {
      const tour = await catalog.getTourById(req.params.id);
      if (!tour) return res.status(404).json({ message: 'Tour not found' });
      return res.json({ tour });
    } catch (error) {
      console.error('Unable to load tour', error);
      return res.status(500).json({ message: 'Unable to load tour' });
    }
  });

  app.post('/contact-form', whispers_API.sendContactForm);

  app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));

  console.log('End setting up server');
}

startServer();
