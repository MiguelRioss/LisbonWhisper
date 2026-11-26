import assert from 'node:assert/strict';
import test from 'node:test';
import Stripe from 'stripe';
import { Booking } from '../domain/Booking.ts';
import { CheckoutValidationError } from '../domain/CheckoutError.ts';
import BookingRepository from '../repo/BookingRepository.ts';
import CheckoutService from '../services/checkout/CheckoutService.ts';
import WebhookService from '../services/webhook/WebhookService.ts';
import StripeAdapter from '../services/stripe/StripeAdapter.ts';

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
  const booking = { id: 7, name: 'Guest', email: 'guest@example.com', date: '2026-12-01', time: '10:00', tourName: 'Tour', persons: 2, unitPriceCents: 5250, message: '', tourDescriptions: '', paymentStatus: 'pending', stripeSessionId: 'cs_test_example' };
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
    livemode: false,
    data: { object: { id: 'cs_test_example', client_reference_id: '7', payment_status: 'paid', amount_total: 10500, currency: 'eur', payment_intent: 'pi_test_example' } },
  });
  const signature = stripe.webhooks.generateTestHeaderString({ payload, secret });

  await service.handle(Buffer.from(payload), signature);
  await service.handle(Buffer.from(payload), signature);
  await assert.rejects(() => new WebhookService(repository, { async sendBookingEmails() {} }, stripe, secret, 'live').handle(Buffer.from(payload), signature), /Stripe webhook mode mismatch/);

  assert.equal(booking.paymentStatus, 'paid');
  assert.equal(emailsSent, 1);
});

test('Stripe adapter keeps test and live credentials separate', () => {
  const testAdapter = StripeAdapter.fromEnvironment({
    STRIPE_MODE: 'test',
    STRIPE_TEST_SECRET_KEY: 'sk_test_example',
    STRIPE_TEST_WEBHOOK_SECRET: 'whsec_test_example',
    STRIPE_LIVE_SECRET_KEY: 'rk_live_example',
    STRIPE_LIVE_WEBHOOK_SECRET: 'whsec_live_example',
  });
  assert.equal(testAdapter.mode, 'test');
  assert.ok(testAdapter.client);
  assert.equal(testAdapter.webhookSecret, 'whsec_test_example');

  const liveAdapter = StripeAdapter.fromEnvironment({
    STRIPE_MODE: 'live',
    STRIPE_LIVE_SECRET_KEY: 'rk_live_example',
    STRIPE_LIVE_WEBHOOK_SECRET: 'whsec_live_example',
  });
  assert.equal(liveAdapter.mode, 'live');
  assert.ok(liveAdapter.client);
  assert.equal(liveAdapter.webhookSecret, 'whsec_live_example');
  assert.throws(() => StripeAdapter.fromEnvironment({ STRIPE_MODE: 'live', STRIPE_SECRET_KEY: 'sk_test_example', STRIPE_WEBHOOK_SECRET: 'whsec_test_example' }), /Live Stripe key and webhook secret are required/);
  const legacyTestAdapter = StripeAdapter.fromEnvironment({ STRIPE_SECRET_KEY: 'sk_test_legacy', STRIPE_WEBHOOK_SECRET: 'whsec_legacy' });
  assert.equal(legacyTestAdapter.mode, 'test');
  assert.equal(legacyTestAdapter.webhookSecret, 'whsec_legacy');
});

test('checkout sends tour details and company logo to Stripe', async () => {
  let parameters: Stripe.Checkout.SessionCreateParams | undefined;
  let storedPrice: number | undefined;
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
    async createBooking(booking) { storedPrice = booking.unitPriceCents; return { ...booking, id: 7 }; },
    async getBookingById() { return null; },
    async updateBookingPayment() {},
  });
  const service = new CheckoutService(repository, stripe, 'https://www.lisbonwhisper.com', {
    async getTourById(id) {
      return id === 'the-moorish-whispers'
        ? { slug: id, title: 'Updated Moorish Tour', priceCents: 5250, maxPersons: 3 }
        : null;
    },
    async getTourByTitle() { return null; },
  });
  const input = {
    name: 'Guest', email: 'guest@example.com', date: '2026-12-01', time: '10:00-12:00',
    tourId: 'the-moorish-whispers', tourName: 'The Moorish Whispers', persons: 2, tourDescriptions: ['Hidden streets'],
  };
  await assert.rejects(service.createSession({ ...input, persons: 4 }), /up to 3 people/);
  const response = await service.createSession(input);

  assert.equal(response.sessionId, 'cs_test_example');
  assert.equal(parameters?.line_items?.[0]?.quantity, 2);
  assert.equal(storedPrice, 5250);
  assert.equal(parameters?.line_items?.[0]?.price_data?.unit_amount, 5250);
  assert.equal(parameters?.line_items?.[0]?.price_data?.product_data?.name, 'Updated Moorish Tour');
  assert.equal(parameters?.line_items?.[0]?.price_data?.product_data?.description, '2026-12-01 · 10:00-12:00 — Hidden streets');
  assert.deepEqual(parameters?.line_items?.[0]?.price_data?.product_data?.images, ['https://www.lisbonwhisper.com/res/logo.png']);
  assert.deepEqual(parameters?.branding_settings?.logo, { type: 'url', url: 'https://www.lisbonwhisper.com/res/logo.png' });
});
