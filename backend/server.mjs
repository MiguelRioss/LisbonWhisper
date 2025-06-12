import express from 'express';
import cors from 'cors';
import api from './API/api.mjs';

import onlineData from './DATA/dataBase.mjs';
import data from './DATA/dataBaseLocal.mjs';
import services from './SERVICES/services.mjs';

import { connectToMongo } from './DATA/mongoDb.mjs';

const PORT = 1904;

async function startServer() {
  console.log('Start setting up server');

  // Connect to MongoDB
  try {
    await connectToMongo();
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }

  const app = express();


  const allowedOrigins = [
  'http://localhost:5173', 
  'https://lisbonwhisper.com/src/res'
];

  app.use(
    cors({
      origin: allowedOrigins,
      methods: 'GET,POST,PUT,DELETE',
      credentials: true,
    })
  );

  app.use(express.json());

  const dataInit = onlineData();
  const WhisperServices = services(dataInit);
  const whispers_API = api(WhisperServices);

  app.get('/', (req, res) => {
    res.send('Welcome to the Whisper API!');
  });

  app.get('/bookings', whispers_API.getBookings);
  app.post('/bookings', whispers_API.createBooking);

  app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));

  console.log('End setting up server');
}

startServer();
