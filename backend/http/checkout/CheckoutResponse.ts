import type { CheckoutErrorResponse, CheckoutSuccessResponse } from './CheckoutTypes.ts';

export class CheckoutSuccess<T = CheckoutSuccessResponse> {
  readonly status = 200;
  constructor(readonly body: T) {}
}

export class CheckoutFailure {
  constructor(readonly status: number, readonly body: CheckoutErrorResponse) {}
}
