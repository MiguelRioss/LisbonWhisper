import type Stripe from 'stripe';
import { Booking, TOUR_PRICE_CENTS } from '../../domain/Booking.ts';
import { CheckoutConfigurationError, CheckoutValidationError } from '../../domain/CheckoutError.ts';
import type BookingRepository from '../../repo/BookingRepository.ts';
import type { CheckoutBookingRequest, CheckoutSuccessResponse } from '../../http/checkout/CheckoutTypes.ts';

type CheckoutTour = { slug: string; title: string; priceCents: number; maxPersons: number };
interface TourCatalog {
  getTourById(id: string): Promise<CheckoutTour | null>;
  getTourByTitle(title: string): Promise<CheckoutTour | null>;
}

export default class CheckoutService {
  constructor(
    private readonly bookings: BookingRepository,
    private readonly stripe: Stripe | null,
    private readonly siteUrl: string | undefined,
    private readonly catalog?: TourCatalog,
  ) {}

  async createSession(input: CheckoutBookingRequest | undefined): Promise<CheckoutSuccessResponse> {
    const booking = Booking.from(input);
    if (!this.stripe || !this.siteUrl) throw new CheckoutConfigurationError();
    const tourId = typeof input?.tourId === 'string' ? input.tourId.trim() : '';
    const tour = this.catalog && (tourId
      ? await this.catalog.getTourById(tourId)
      : await this.catalog.getTourByTitle(booking.details.tourName));
    if (this.catalog && !tour) throw new CheckoutValidationError('Tour not found');
    if (tour && booking.details.persons > tour.maxPersons) {
      throw new CheckoutValidationError(`This tour allows up to ${tour.maxPersons} people`);
    }
    const unitPriceCents = tour?.priceCents ?? TOUR_PRICE_CENTS;
    const tourName = tour?.title ?? booking.details.tourName;
    const baseUrl = this.siteUrl.replace(/\/$/, '');
    const created = await this.bookings.create({
      ...booking.details,
      tourName,
      ...(tour && { tourId: tour.slug }),
      unitPriceCents,
      pricePerPerson: unitPriceCents / 100,
      totalPrice: unitPriceCents * booking.details.persons / 100,
      currency: 'EUR',
    });
    const bookingId = String(created._id || created.id);

    try {
      const logoUrl = `${baseUrl}/res/logo.png`;
      const stripeRequest: Stripe.Checkout.SessionCreateParams = {
        mode: 'payment',
        submit_type: 'book',
        customer_email: booking.details.email,
        client_reference_id: bookingId,
        line_items: [{
          price_data: {
            currency: 'eur',
            unit_amount: unitPriceCents,
            product_data: {
              name: tourName,
              description: booking.checkoutDescription,
              images: [logoUrl],
            },
          },
          quantity: booking.details.persons,
        }],
        branding_settings: {
          display_name: 'Lisbon Whisper',
          logo: { type: 'url', url: logoUrl },
          background_color: '#f2f6ff',
          button_color: '#0a4d8d',
        },
        custom_text: {
          submit: { message: 'Your booking confirmation will arrive by email after payment.' },
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
