import type Stripe from 'stripe';
import type BookingRepository from '../../repo/BookingRepository.ts';
import type { BookingRecord } from '../../domain/Booking.ts';
import { TOUR_PRICE_CENTS } from '../../domain/Booking.ts';
import { CheckoutConfigurationError } from '../../domain/CheckoutError.ts';

interface BookingEmails {
  sendBookingEmails(booking: BookingRecord): Promise<void>;
}

export default class WebhookService {
  constructor(
    private readonly bookings: BookingRepository,
    private readonly bookingEmails: BookingEmails,
    private readonly stripe: Stripe | null,
    private readonly webhookSecret: string | undefined,
  ) {}

  async handle(payload: Buffer, signature: string | string[] | undefined): Promise<void> {
    if (!this.stripe || !this.webhookSecret) throw new CheckoutConfigurationError();
    const event = this.stripe.webhooks.constructEvent(payload, signature || '', this.webhookSecret);
    if (event.type !== 'checkout.session.completed' && event.type !== 'checkout.session.async_payment_succeeded') return;
    const session = event.data.object;
    if (session.payment_status !== 'paid' || !session.client_reference_id) return;
    const booking = await this.bookings.findById(session.client_reference_id);
    if (!booking || booking.paymentStatus === 'paid' || booking.stripeSessionId !== session.id || session.amount_total !== booking.persons * TOUR_PRICE_CENTS || session.currency !== 'eur') return;
    await this.bookings.updatePayment(session.client_reference_id, { paymentStatus: 'paid', stripePaymentIntentId: session.payment_intent });
    await this.bookingEmails.sendBookingEmails(booking);
  }
}
