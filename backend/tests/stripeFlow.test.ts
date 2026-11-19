import assert from 'node:assert/strict';
import test from 'node:test';
import Stripe from 'stripe';
import { Booking } from '../domain/Booking.ts';
import { CheckoutValidationError } from '../domain/CheckoutError.ts';
import BookingRepository from '../repo/BookingRepository.ts';
import CheckoutService from '../services/checkout/CheckoutService.ts';
import WebhookService from '../services/webhook/WebhookService.ts';

test('booking rejects missing required fields and formats tour details', () => {
  assert.throws(() => Booking.from(undefined), CheckoutValidationError);
  assert.throws(() => Booking.from({ name: '', email: 'guest@example.com', date: '2026-12-01', time: '10:00', tourName: 'Tour', persons: 1 }), /name is required/);

  const booking = Booking.from({
    name: 'Guest',
    email: 'guest@example.com',
    date: '2026-12-01',
    time: '10:00-12:00',
    tourName: 'The Moorish Whispers',
    persons: 2,
    tourDescriptions: ['Hidden streets', 'Six viewpoints'],
  });
  assert.equal(booking.details.tourDescriptions, 'Hidden streets\nSix viewpoints');
  assert.equal(booking.checkoutDescription, '2026-12-01 · 10:00-12:00 — Hidden streets');
});

test('signed paid webhook updates booking and sends email only once', async () => {
  const stripe = new Stripe('sk_test_example');
  const secret = 'whsec_example';
  const booking = { id: 7, name: 'Guest', email: 'guest@example.com', date: '2026-12-01', time: '10:00', tourName: 'Tour', persons: 2, message: '', tourDescriptions: '', paymentStatus: 'pending', stripeSessionId: 'cs_test_example' };
  let emailsSent = 0;
  const repository = new BookingRepository({
    async createBooking() { return booking; },
    async getBookingById() { return booking; },
    async updateBookingPayment(_id, fields) { Object.assign(booking, fields); },
  });
  const service = new WebhookService(repository, { async sendBookingEmails() { emailsSent += 1; } }, stripe, secret);
  const payload = JSON.stringify({
    id: 'evt_test_example',
    type: 'checkout.session.completed',
    data: { object: { id: 'cs_test_example', client_reference_id: '7', payment_status: 'paid', amount_total: 9800, currency: 'eur', payment_intent: 'pi_test_example' } },
  });
  const signature = stripe.webhooks.generateTestHeaderString({ payload, secret });

  await service.handle(Buffer.from(payload), signature);
  await service.handle(Buffer.from(payload), signature);

  assert.equal(booking.paymentStatus, 'paid');
  assert.equal(emailsSent, 1);
});

test('checkout sends tour details, image and logo to Stripe', async () => {
  let parameters: Stripe.Checkout.SessionCreateParams | undefined;
  const stripe = {
    checkout: {
      sessions: {
        async create(request: Stripe.Checkout.SessionCreateParams) {
          parameters = request;
          return { id: 'cs_test_example', url: 'https://checkout.stripe.com/test' };
        },
      },
    },
  } as unknown as Stripe;
  const repository = new BookingRepository({
    async createBooking(booking) { return { ...booking, id: 7 }; },
    async getBookingById() { return null; },
    async updateBookingPayment() {},
  });
  const service = new CheckoutService(repository, stripe, 'https://www.lisbonwhisper.com');

  const response = await service.createSession({
    name: 'Guest', email: 'guest@example.com', date: '2026-12-01', time: '10:00-12:00',
    tourName: 'The Moorish Whispers', persons: 2, tourDescriptions: ['Hidden streets'],
  });

  assert.equal(response.sessionId, 'cs_test_example');
  assert.equal(parameters?.line_items?.[0]?.quantity, 2);
  assert.equal(parameters?.line_items?.[0]?.price_data?.unit_amount, 4900);
  assert.equal(parameters?.line_items?.[0]?.price_data?.product_data?.description, '2026-12-01 · 10:00-12:00 — Hidden streets');
  assert.deepEqual(parameters?.line_items?.[0]?.price_data?.product_data?.images, ['https://www.lisbonwhisper.com/res/f03ef0dcb35a8e63d746cfa4741a4f96.jpg']);
  assert.deepEqual(parameters?.branding_settings?.logo, { type: 'url', url: 'https://www.lisbonwhisper.com/res/logo.png' });
});
