import type { BookingInput } from '../../domain/Booking.ts';

export type CheckoutBookingRequest = BookingInput;

export interface CheckoutRequestBody {
  booking: CheckoutBookingRequest;
}

export interface CheckoutSuccessResponse {
  url: string;
  sessionId: string;
}

export interface CheckoutErrorResponse {
  message: string;
}
