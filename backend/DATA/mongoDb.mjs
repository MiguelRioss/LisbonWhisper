// db.js
import 'dotenv/config';
import { MongoClient } from 'mongodb';

let client;

let bookingsCollection;

export async function connectToMongo() {
  const uri = String(process.env.MONGO_URI || '').trim();
  if (!uri) {
    throw new Error('MONGO_URI is empty');
  }
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    throw new Error(
      'Invalid MONGO_URI scheme. It must start with "mongodb://" or "mongodb+srv://"'
    );
  }

  if (!client) {
    client = new MongoClient(uri);
  }

  await client.connect();

  const db = client.db('bookingApp'); // your DB name
  bookingsCollection = db.collection('bookings');
}

export function getBookingsCollection() {
  if (!bookingsCollection) {
    throw new Error('MongoDB not connected. Call connectToMongo() first.');
  }

  return bookingsCollection;
}
