export interface CheckoutBookingRequest {
  name: string;
  email: string;
  date: string;
  time: string;
  tourName: string;
  persons: number;
  message?: string;
  tourDescriptions?: string;
}

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

export interface WebhookSuccessResponse {
  received: true;
}
