import { getBookingsCollection } from './mongoDb.mjs';
import { ObjectId } from 'mongodb';

export default function () {
  return {
    getBookings,
    getFilteredBookings,
    createBooking,
  };

  async function getBookings() {
    const collection = getBookingsCollection();
    const bookingsArray = await collection.find({}).toArray();
    return { bookings: bookingsArray };
  }

  async function getFilteredBookings(comparador = {}) {
    const collection = getBookingsCollection();
    const allBookings = await collection.find({}).toArray();

    const filteredBookings = allBookings.filter((booking) => {
      return Object.keys(comparador).every(
        (key) => booking[key] != null && String(booking[key]) === String(comparador[key])
      );
    });

    return { bookings: filteredBookings }; // <--- wrapped for consistency
  }

  async function createBooking(booking) {
    const collection = getBookingsCollection();
    const result = await collection.insertOne(booking);
    booking._id = result.insertedId;
    console.log('New booking added:', booking);
    return booking; // this can stay as a single object
  }
}
