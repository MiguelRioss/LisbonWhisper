import type Stripe from 'stripe';
import { Booking, TOUR_PRICE_CENTS } from '../../domain/Booking.ts';
import { CheckoutConfigurationError, CheckoutValidationError } from '../../domain/CheckoutError.ts';
import type BookingRepository from '../../repo/BookingRepository.ts';
import type { CheckoutBookingRequest, CheckoutQuoteRequest, CheckoutQuoteResponse, CheckoutSuccessResponse } from '../../http/checkout/CheckoutTypes.ts';

type CheckoutTour = { slug: string; title: string; priceCents: number; maxPersons: number };
type CheckoutPromoCode = { discountPercent: number };
interface TourCatalog {
  getTourById(id: string): Promise<CheckoutTour | null>;
  getTourByTitle(title: string): Promise<CheckoutTour | null>;
  getPromoCode(code: string): Promise<CheckoutPromoCode | null | undefined>;
}

const MINIMUM_EUR_CHARGE_CENTS = 50;

export default class CheckoutService {
  constructor(
    private readonly bookings: BookingRepository,
    private readonly stripe: Stripe | null,
    private readonly siteUrl: string | undefined,
    private readonly catalog?: TourCatalog,
  ) {}

  async quote(input: CheckoutQuoteRequest | undefined): Promise<CheckoutQuoteResponse> {
    if (!this.catalog) throw new CheckoutConfigurationError();
    if (typeof input?.tourId !== 'string' || !input.tourId.trim()) {
      throw new CheckoutValidationError('Tour is required.');
    }
    const { promoCode, discountPercent, subtotalCents, discountCents, totalPriceCents } =
      await this.priceBooking(input.tourId.trim(), '', input.persons, input.promoCode);
    return { promoCode, discountPercent, subtotalCents, discountCents, totalPriceCents };
  }

  private async priceBooking(tourId: string, fallbackTourName: string, persons: number, rawPromoCode: unknown) {
    if (!Number.isInteger(persons) || persons < 1 || persons > 20) {
      throw new CheckoutValidationError('persons must be an integer between 1 and 20');
    }
    const tour = this.catalog && (tourId
      ? await this.catalog.getTourById(tourId)
      : await this.catalog.getTourByTitle(fallbackTourName));
    if (this.catalog && !tour) throw new CheckoutValidationError('Tour not found');
    if (tour && persons > tour.maxPersons) {
      throw new CheckoutValidationError(`This tour allows up to ${tour.maxPersons} people`);
    }
    const unitPriceCents = tour?.priceCents ?? TOUR_PRICE_CENTS;
    if (rawPromoCode != null && typeof rawPromoCode !== 'string') {
      throw new CheckoutValidationError('This promo code is invalid.');
    }
    const promoCode = rawPromoCode?.trim().toUpperCase() ?? '';
    let discountPercent = 0;
    if (promoCode) {
      const promo = /^[A-Z0-9][A-Z0-9_-]{0,31}$/.test(promoCode)
        ? await this.catalog?.getPromoCode(promoCode)
        : null;
      if (!promo || !Number.isInteger(promo.discountPercent) || promo.discountPercent < 1 || promo.discountPercent > 100) {
        throw new CheckoutValidationError('This promo code is invalid.');
      }
      discountPercent = promo.discountPercent;
    }
    const subtotalCents = unitPriceCents * persons;
    const discountCents = Math.round(subtotalCents * discountPercent / 100);
    const totalPriceCents = subtotalCents - discountCents;
    if (totalPriceCents > 0 && totalPriceCents < MINIMUM_EUR_CHARGE_CENTS) {
      throw new CheckoutValidationError('The discounted total is below the minimum payment of €0.50. Add more guests or remove the code.');
    }
    return { tour, unitPriceCents, promoCode, discountPercent, subtotalCents, discountCents, totalPriceCents };
  }

  async createSession(input: CheckoutBookingRequest | undefined): Promise<CheckoutSuccessResponse> {
    const booking = Booking.from(input);
    if (!this.stripe || !this.siteUrl) throw new CheckoutConfigurationError();
    const { persons, tourName: fallbackTourName } = booking.details;
    const tourId = typeof input?.tourId === 'string' ? input.tourId.trim() : '';
    const { tour, unitPriceCents, promoCode, discountPercent, discountCents, totalPriceCents } =
      await this.priceBooking(tourId, fallbackTourName, persons, input?.promoCode);
    const tourName = tour?.title ?? fallbackTourName;
    const baseUrl = this.siteUrl.replace(/\/$/, '');
    const created = await this.bookings.create({
      ...booking.details,
      tourName,
      ...(tour && { tourId: tour.slug }),
      unitPriceCents,
      pricePerPerson: unitPriceCents / 100,
      totalPrice: totalPriceCents / 100,
      totalPriceCents,
      createdAt: new Date().toISOString(),
      ...(promoCode && { promoCode, discountPercent, discountCents }),
      currency: 'EUR',
    });
    const bookingId = String(created._id || created.id);

    try {
      const logoUrl = `${baseUrl}/res/logo.png`;
      const quantity = totalPriceCents % persons === 0 ? persons : 1;
      const description = promoCode
        ? `${persons} guest(s) · ${promoCode} (${discountPercent}% off) — ${booking.checkoutDescription}`.slice(0, 500)
        : booking.checkoutDescription;
      const stripeRequest: Stripe.Checkout.SessionCreateParams = {
        mode: 'payment',
        submit_type: 'book',
        customer_email: booking.details.email,
        client_reference_id: bookingId,
        line_items: [{
          price_data: {
            currency: 'eur',
            unit_amount: totalPriceCents / quantity,
            product_data: {
              name: tourName,
              description,
              images: [logoUrl],
            },
          },
          quantity,
        }],
        branding_settings: {
          display_name: 'Lisbon Whisper',
          logo: { type: 'url', url: logoUrl },
          background_color: '#f2f6ff',
          button_color: '#0a4d8d',
        },
        custom_text: {
          submit: { message: totalPriceCents === 0 ? 'Your booking confirmation will arrive by email.' : 'Your booking confirmation will arrive by email after payment.' },
        },
        success_url: `${baseUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/booking/cancel`,
      };
      const session = await this.stripe.checkout.sessions.create(stripeRequest);
      if (!session.url) throw new Error('Stripe did not return a checkout URL');
      await this.bookings.updatePayment(bookingId, { stripeSessionId: session.id });
      return { url: session.url, sessionId: session.id };
    } catch (error) {
      await this.bookings.updatePayment(bookingId, { paymentStatus: 'checkout_failed' });
      throw error;
    }
  }
}
