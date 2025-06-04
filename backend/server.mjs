import express from 'express';
import cors from 'cors'; // Import CORS
import api from './API/api.mjs';

import onlineData from './DATA/dataBase.mjs';
import data from './DATA/dataBaseLocal.mjs';
import services from './SERVICES/services.mjs';

const PORT = 1904;

console.log("Start setting up server");
const app = express();

// Use the CORS middleware
app.use(cors({
    origin: 'http://localhost:5173', // Allow only requests from this origin
    methods: 'GET,POST,PUT,DELETE', // Allowed HTTP methods
    credentials: true // Allow credentials (e.g., cookies) if needed
}));

// Add middleware to parse JSON request body
app.use(express.json());

const dataInit = data();
const WhisperServices = services(dataInit);
const whispers_API = api(WhisperServices);

// Main route
app.get('/', (req, res) => {
    res.send('Welcome to the Whisper API!');
});

// Bookings routes
app.get('/bookings', whispers_API.getBookings);
app.post('/bookings', whispers_API.createBooking);

// Start the server
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));

console.log("End setting up server");
