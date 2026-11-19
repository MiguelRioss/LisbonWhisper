import type CheckoutService from '../SERVICES/checkoutService.ts';
import type { CheckoutRequestBody } from './checkoutTypes.ts';
import { CheckoutSuccess, CheckoutFailure, WebhookSuccess } from './checkoutResponses.ts';
import { CheckoutError } from '../errors/CheckoutError.ts';

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

  async webhook(payload: Buffer, signature: string | string[] | undefined): Promise<WebhookSuccess | CheckoutFailure> {
    try {
      await this.checkoutService.handleWebhook(payload, signature);
      return new WebhookSuccess();
    } catch (error) {
      const status = (error as { type?: string }).type === 'StripeSignatureVerificationError' ? 400 : 500;
      return new CheckoutFailure(status, { message: 'Webhook processing failed' });
    }
  }
}
