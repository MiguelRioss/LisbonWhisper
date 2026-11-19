import type { CheckoutErrorResponse, CheckoutSuccessResponse } from './CheckoutTypes.ts';

export class CheckoutSuccess {
  readonly status = 200;
  constructor(readonly body: CheckoutSuccessResponse) {}
}

export class CheckoutFailure {
  constructor(readonly status: number, readonly body: CheckoutErrorResponse) {}
}
