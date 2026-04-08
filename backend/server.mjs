import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import api from './API/api.mjs';
import databaseManagementApi from './API/databaseManagementApi.mjs';

import onlineData from './DATA/dataBase.mjs';
import localData from './DATA/dataBaseLocal.mjs';
import createDatabaseAdminSessionData from './DATA/databaseAdminSessionData.mjs';
import createMailchimpAudienceData from './DATA/mailchimpAudienceData.mjs';
import services from './SERVICES/services.mjs';
import createDatabaseManagementServices from './SERVICES/databaseManagementServices.mjs';

import { connectToMongo } from './DATA/mongoDb.mjs';

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

  app.post('/bookings', whispers_API.createBooking);
  app.post('/contact-form', whispers_API.sendContactForm);

  app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));

  console.log('End setting up server');
}

startServer();
