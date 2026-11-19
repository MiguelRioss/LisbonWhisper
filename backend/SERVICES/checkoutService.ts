import Stripe from 'stripe';
import type { CheckoutBookingRequest, CheckoutSuccessResponse } from '../API/checkoutTypes.ts';
import { CheckoutConfigurationError, CheckoutValidationError } from '../errors/CheckoutError.ts';

type Booking = { id?: string | number; _id?: unknown; name: string; email: string; date: string; time: string; tourName: string; persons: number; message: string; tourDescriptions: string; paymentStatus?: string; stripeSessionId?: string };
type BookingsData = { createBooking(booking: Booking): Promise<Booking>; getBookingById(id: string): Promise<Booking | null>; updateBookingPayment(id: string, fields: Record<string, unknown>): Promise<unknown> };
type BookingServices = { sendBookingEmails(booking: Booking): Promise<void> };

const PRICE_CENTS = 4900;

export default class CheckoutService {
  private readonly stripe: Stripe | null;
  private readonly webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  private readonly siteUrl = process.env.WEBSITE_URL;

  constructor(private readonly bookingsData: BookingsData, private readonly bookingServices: BookingServices) {
    this.stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
  }

  private requireStripe(): { client: Stripe; baseUrl: string; secret: string } {
    if (!this.stripe || !this.webhookSecret || !this.siteUrl) {
      throw new CheckoutConfigurationError();
    }
    return { client: this.stripe, baseUrl: this.siteUrl, secret: this.webhookSecret };
  }

  private requiredText(value: unknown, field: string): string {
    if (typeof value !== 'string' || !value.trim()) {
      throw new CheckoutValidationError(`${field} is required`);
    }
    return value.trim();
  }

  private optionalText(value: unknown, field: string): string {
    if (value === undefined || value === null) return '';
    if (typeof value !== 'string') throw new CheckoutValidationError(`${field} must be text`);
    return value.trim();
  }

  async createSession(booking: CheckoutBookingRequest | undefined): Promise<CheckoutSuccessResponse> {
      if (!booking || typeof booking !== 'object') {
        throw new CheckoutValidationError('booking is required');
      }
      const name = this.requiredText(booking.name, 'name');
      const email = this.requiredText(booking.email, 'email');
      const date = this.requiredText(booking.date, 'date');
      const time = this.requiredText(booking.time, 'time');
      const tourName = this.requiredText(booking.tourName, 'tourName');
      const persons = booking.persons;
      if (!/^\S+@\S+\.\S+$/.test(email)) throw new CheckoutValidationError('email is invalid');
      if (typeof persons !== 'number' || !Number.isInteger(persons) || persons < 1 || persons > 20) {
        throw new CheckoutValidationError('persons must be an integer between 1 and 20');
      }
      const { client, baseUrl } = this.requireStripe();
      const reservation = {
        name, email, date, time, tourName, persons,
        message: this.optionalText(booking.message, 'message'),
        tourDescriptions: this.optionalText(booking.tourDescriptions, 'tourDescriptions'),
        paymentStatus: 'pending',
      };
      const created = await this.bookingsData.createBooking(reservation);
      const bookingId = String(created._id || created.id);
      try {
        const stripeRequest: Stripe.Checkout.SessionCreateParams = {
          mode: 'payment',
          customer_email: email,
          client_reference_id: bookingId,
          line_items: [{ price_data: { currency: 'eur', unit_amount: PRICE_CENTS, product_data: { name: tourName } }, quantity: persons }],
          success_url: `${baseUrl.replace(/\/$/, '')}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${baseUrl.replace(/\/$/, '')}/booking/cancel`,
        };
        const session = await client.checkout.sessions.create(stripeRequest);
        if (!session.url) throw new Error('Stripe did not return a checkout URL');
        await this.bookingsData.updateBookingPayment(bookingId, { stripeSessionId: session.id });
        return { url: session.url, sessionId: session.id };
      } catch (error) {
        await this.bookingsData.updateBookingPayment(bookingId, { paymentStatus: 'checkout_failed' });
        throw error;
      }
  }

  async handleWebhook(payload: Buffer, signature: string | string[] | undefined) {
      const { client, secret } = this.requireStripe();
      const event = client.webhooks.constructEvent(payload, signature || '', secret);
      if (event.type !== 'checkout.session.completed' && event.type !== 'checkout.session.async_payment_succeeded') return;
      const session = event.data.object;
      if (session.payment_status !== 'paid') return;
      const bookingId = session.client_reference_id;
      if (!bookingId) return;
      const booking = await this.bookingsData.getBookingById(bookingId);
      if (!booking || booking.paymentStatus === 'paid' || booking.stripeSessionId !== session.id || session.amount_total !== booking.persons * PRICE_CENTS || session.currency !== 'eur') return;
      await this.bookingsData.updateBookingPayment(bookingId, { paymentStatus: 'paid', stripePaymentIntentId: session.payment_intent });
      await this.bookingServices.sendBookingEmails(booking);
  }
}
