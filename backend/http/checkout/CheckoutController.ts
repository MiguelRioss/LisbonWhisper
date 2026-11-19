import type CheckoutService from '../../services/checkout/CheckoutService.ts';
import type { CheckoutRequestBody } from './CheckoutTypes.ts';
import { CheckoutSuccess, CheckoutFailure } from './CheckoutResponse.ts';
import { CheckoutError } from '../../domain/CheckoutError.ts';

export default class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  async createSession(request: CheckoutRequestBody): Promise<CheckoutSuccess | CheckoutFailure> {
    try {
      return new CheckoutSuccess(await this.checkoutService.createSession(request?.booking));
    } catch (error) {
      if (error instanceof CheckoutError) return new CheckoutFailure(error.status, { message: error.message });
      return new CheckoutFailure(500, { message: 'Checkout failed' });
    }
  }
}
