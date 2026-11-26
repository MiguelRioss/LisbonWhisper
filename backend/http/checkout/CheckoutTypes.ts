import type { BookingInput } from '../../domain/Booking.ts';

export type CheckoutBookingRequest = BookingInput;

export interface CheckoutRequestBody {
  booking: CheckoutBookingRequest;
}

export interface CheckoutSuccessResponse {
  url: string;
  sessionId: string;
}

export interface CheckoutQuoteRequest {
  tourId: string;
  persons: number;
  promoCode?: string;
}

export interface CheckoutQuoteResponse {
  promoCode: string;
  discountPercent: number;
  subtotalCents: number;
  discountCents: number;
  totalPriceCents: number;
}

export interface CheckoutErrorResponse {
  message: string;
}
