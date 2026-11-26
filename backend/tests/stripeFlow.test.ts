import assert from 'node:assert/strict';
import test from 'node:test';
import Stripe from 'stripe';
import { Booking, type BookingRecord } from '../domain/Booking.ts';
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
  const booking: BookingRecord = { id: 7, name: 'Guest', email: 'guest@example.com', date: '2026-12-01', time: '10:00', tourName: 'Tour', persons: 2, unitPriceCents: 5250, totalPriceCents: 7350, discountPercent: 30, message: '', tourDescriptions: '', paymentStatus: 'pending', stripeSessionId: 'cs_test_example' };
  let emailsSent = 0;
  const repository = new BookingRepository({
    async createBooking() { return booking; },
    async getBookingById() { return booking; },
    async updateBookingPayment(_id, fields) { Object.assign(booking, fields); },
  });
  const service = new WebhookService(repository, { async sendBookingEmails() { emailsSent += 1; } }, stripe, secret);
  const completeCheckout = async (payment_status: string, amount_total: number) => {
    const payload = JSON.stringify({
    id: 'evt_test_example',
    type: 'checkout.session.completed',
    livemode: false,
      data: { object: { id: 'cs_test_example', client_reference_id: '7', payment_status, amount_total, currency: 'eur', payment_intent: 'pi_test_example' } },
    });
    const signature = stripe.webhooks.generateTestHeaderString({ payload, secret });
    await service.handle(Buffer.from(payload), signature);
    return { payload, signature };
  };

  await completeCheckout('paid', 10500);
  await completeCheckout('no_payment_required', 0);
  assert.equal(booking.paymentStatus, 'pending');
  const { payload, signature } = await completeCheckout('paid', 7350);
  await completeCheckout('paid', 7350);
  await assert.rejects(() => new WebhookService(repository, { async sendBookingEmails() {} }, stripe, secret, 'live').handle(Buffer.from(payload), signature), /Stripe webhook mode mismatch/);

  assert.equal(booking.paymentStatus, 'paid');
  assert.equal(emailsSent, 1);

  Object.assign(booking, { paymentStatus: 'pending', totalPriceCents: 0, discountPercent: 100 });
  await completeCheckout('no_payment_required', 0);
  assert.equal(booking.paymentStatus, 'paid');
  assert.equal(emailsSent, 2);
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
  let storedBooking: BookingRecord | undefined;
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
    async createBooking(booking) { storedBooking = booking; return { ...booking, id: 7 }; },
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
    async getPromoCode(code) {
      if (code === 'PARTNER30') return { discountPercent: 30 };
      if (code === 'PARTNER25') return { discountPercent: 25 };
      if (code === 'FREE100') return { discountPercent: 100 };
      return null;
    },
  });
  const input = {
    name: 'Guest', email: 'guest@example.com', date: '2026-12-01', time: '10:00-12:00',
    tourId: 'the-moorish-whispers', tourName: 'The Moorish Whispers', persons: 2, tourDescriptions: ['Hidden streets'],
  };
  await assert.rejects(service.createSession({ ...input, persons: 4 }), /up to 3 people/);
  await assert.rejects(service.createSession({ ...input, promoCode: 'INVALID' }), /promo code is invalid/i);
  await assert.rejects(service.quote({ tourId: input.tourId, persons: 2, promoCode: 'INVALID' }), /promo code is invalid/i);
  const quote = await service.quote({ tourId: input.tourId, persons: 2, promoCode: ' partner30 ' });
  assert.deepEqual(quote, {
    promoCode: 'PARTNER30', discountPercent: 30, subtotalCents: 10500, discountCents: 3150, totalPriceCents: 7350,
  });
  assert.equal(Boolean(storedBooking), false);
  assert.equal(Boolean(parameters), false);
  const response = await service.createSession(input);

  assert.equal(response.sessionId, 'cs_test_example');
  assert.equal(parameters?.line_items?.[0]?.quantity, 2);
  assert.equal(storedBooking?.unitPriceCents, 5250);
  assert.equal(parameters?.line_items?.[0]?.price_data?.unit_amount, 5250);
  assert.equal(parameters?.line_items?.[0]?.price_data?.product_data?.name, 'Updated Moorish Tour');
  assert.equal(parameters?.line_items?.[0]?.price_data?.product_data?.description, '2026-12-01 · 10:00-12:00 — Hidden streets');
  assert.deepEqual(parameters?.line_items?.[0]?.price_data?.product_data?.images, ['https://www.lisbonwhisper.com/res/logo.png']);
  assert.deepEqual(parameters?.branding_settings?.logo, { type: 'url', url: 'https://www.lisbonwhisper.com/res/logo.png' });

  await service.createSession({ ...input, promoCode: ' partner30 ' });
  assert.equal(storedBooking?.promoCode, 'PARTNER30');
  assert.equal(storedBooking?.discountCents, 3150);
  assert.equal(storedBooking?.totalPriceCents, quote.totalPriceCents);
  assert.equal(parameters?.line_items?.[0]?.price_data?.unit_amount, 3675);
  assert.equal(parameters?.line_items?.[0]?.quantity, 2);

  await service.createSession({ ...input, promoCode: 'PARTNER25' });
  assert.equal(storedBooking?.totalPriceCents, 7875);
  assert.equal(parameters?.line_items?.[0]?.price_data?.unit_amount, 7875);
  assert.equal(parameters?.line_items?.[0]?.quantity, 1);

  await service.createSession({ ...input, promoCode: 'FREE100' });
  assert.equal(storedBooking?.totalPriceCents, 0);
  assert.equal(parameters?.line_items?.[0]?.price_data?.unit_amount, 0);
});
