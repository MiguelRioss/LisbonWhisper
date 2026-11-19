import type WebhookService from '../../services/webhook/WebhookService.ts';
import { WebhookSuccess, WebhookFailure } from './WebhookResponse.ts';

export default class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  async handle(payload: Buffer, signature: string | string[] | undefined): Promise<WebhookSuccess | WebhookFailure> {
    try {
      await this.webhookService.handle(payload, signature);
      return new WebhookSuccess();
    } catch (error) {
      const status = (error as { type?: string }).type === 'StripeSignatureVerificationError' ? 400 : 500;
      return new WebhookFailure(status, { message: 'Webhook processing failed' });
    }
  }
}
