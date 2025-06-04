// db.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let bookingsCollection;

export async function connectToMongo() {
  if (!client.topology?.isConnected()) {
    await client.connect();
  }

  const db = client.db('bookingApp'); // your DB name
  bookingsCollection = db.collection('bookings');
}

export function getBookingsCollection() {
  if (!bookingsCollection) {
    throw new Error('MongoDB not connected. Call connectToMongo() first.');
  }

  return bookingsCollection;
}
