// db.js
import 'dotenv/config';
import { MongoClient } from 'mongodb';

let client;

let database;

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

  database = client.db('bookingApp');
}

export function getMongoDatabase() {
  return database;
}

export function getBookingsCollection() {
  if (!database) {
    throw new Error('MongoDB not connected. Call connectToMongo() first.');
  }

  return database.collection('bookings');
}
