import type { CheckoutErrorResponse, CheckoutSuccessResponse, WebhookSuccessResponse } from './checkoutTypes.ts';

export class CheckoutSuccess {
  readonly status = 200;
  constructor(readonly body: CheckoutSuccessResponse) {}
}

export class CheckoutFailure {
  constructor(readonly status: number, readonly body: CheckoutErrorResponse) {}
}

export class WebhookSuccess {
  readonly status = 200;
  readonly body: WebhookSuccessResponse = { received: true };
}
