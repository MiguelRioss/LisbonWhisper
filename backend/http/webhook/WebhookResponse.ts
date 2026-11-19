import type { CheckoutErrorResponse } from '../checkout/CheckoutTypes.ts';

export class WebhookSuccess {
  readonly status = 200;
  readonly body = { received: true };
}

export class WebhookFailure {
  constructor(readonly status: number, readonly body: CheckoutErrorResponse) {}
}
