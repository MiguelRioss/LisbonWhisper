import { CheckoutValidationError } from './CheckoutError.ts';

export const TOUR_PRICE_CENTS = 4900;

export interface BookingInput {
  tourId?: string;
  promoCode?: string;
  name: string;
  email: string;
  date: string;
  time: string;
  tourName: string;
  persons: number;
  message?: string;
  tourDescriptions?: string | string[];
}

export interface BookingRecord {
  tourId?: string;
  unitPriceCents?: number;
  pricePerPerson?: number;
  totalPrice?: number;
  totalPriceCents?: number;
  createdAt?: string;
  promoCode?: string;
  discountPercent?: number;
  discountCents?: number;
  currency?: string;
  id?: string | number;
  _id?: unknown;
  name: string;
  email: string;
  date: string;
  time: string;
  tourName: string;
  persons: number;
  message: string;
  tourDescriptions: string;
  paymentStatus?: string;
  stripeSessionId?: string;
}

export class Booking {
  private constructor(readonly details: BookingRecord) {}

  static from(input: BookingInput | undefined): Booking {
    if (!input || typeof input !== 'object') {
      throw new CheckoutValidationError('booking is required');
    }
    const name = Booking.requiredText(input.name, 'name');
    const email = Booking.requiredText(input.email, 'email');
    const date = Booking.requiredText(input.date, 'date');
    const time = Booking.requiredText(input.time, 'time');
    const tourName = Booking.requiredText(input.tourName, 'tourName');
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new CheckoutValidationError('email is invalid');
    if (typeof input.persons !== 'number' || !Number.isInteger(input.persons) || input.persons < 1 || input.persons > 20) {
      throw new CheckoutValidationError('persons must be an integer between 1 and 20');
    }
    const descriptions = input.tourDescriptions;
    if (Array.isArray(descriptions) && !descriptions.every((description) => typeof description === 'string')) {
      throw new CheckoutValidationError('tourDescriptions must contain text');
    }
    return new Booking({
      name,
      email,
      date,
      time,
      tourName,
      persons: input.persons,
      message: Booking.optionalText(input.message, 'message'),
      tourDescriptions: Array.isArray(descriptions)
        ? descriptions.map((description) => description.trim()).join('\n')
        : Booking.optionalText(descriptions, 'tourDescriptions'),
      paymentStatus: 'pending',
    });
  }

  get checkoutDescription(): string {
    const summary = this.details.tourDescriptions.split('\n').find(Boolean);
    return [`${this.details.date} · ${this.details.time}`, summary].filter(Boolean).join(' — ').slice(0, 500);
  }

  private static requiredText(value: unknown, field: string): string {
    if (typeof value !== 'string' || !value.trim()) throw new CheckoutValidationError(`${field} is required`);
    return value.trim();
  }

  private static optionalText(value: unknown, field: string): string {
    if (value === undefined || value === null) return '';
    if (typeof value !== 'string') throw new CheckoutValidationError(`${field} must be text`);
    return value.trim();
  }
}
