import type { BookingRecord } from '../domain/Booking.ts';

interface BookingStore {
  createBooking(booking: BookingRecord): Promise<BookingRecord>;
  getBookingById(id: string): Promise<BookingRecord | null>;
  updateBookingPayment(id: string, fields: Record<string, unknown>): Promise<unknown>;
}

export default class BookingRepository {
  constructor(private readonly store: BookingStore) {}

  create(booking: BookingRecord): Promise<BookingRecord> {
    return this.store.createBooking(booking);
  }

  findById(id: string): Promise<BookingRecord | null> {
    return this.store.getBookingById(id);
  }

  updatePayment(id: string, fields: Record<string, unknown>): Promise<unknown> {
    return this.store.updateBookingPayment(id, fields);
  }
}
