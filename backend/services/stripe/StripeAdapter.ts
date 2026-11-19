import Stripe from 'stripe';
import { CheckoutConfigurationError } from '../../domain/CheckoutError.ts';

export type StripeMode = 'test' | 'live';

export default class StripeAdapter {
  private constructor(
    readonly mode: StripeMode,
    readonly client: Stripe | null,
    readonly webhookSecret: string | undefined,
  ) {}

  static fromEnvironment(environment: NodeJS.ProcessEnv): StripeAdapter {
    const mode = environment.STRIPE_MODE || 'test';
    if (mode !== 'test' && mode !== 'live') {
      throw new CheckoutConfigurationError('STRIPE_MODE must be test or live');
    }

    const key = mode === 'live'
      ? environment.STRIPE_LIVE_SECRET_KEY
      : environment.STRIPE_TEST_SECRET_KEY || environment.STRIPE_SECRET_KEY;
    const webhookSecret = mode === 'live'
      ? environment.STRIPE_LIVE_WEBHOOK_SECRET
      : environment.STRIPE_TEST_WEBHOOK_SECRET || environment.STRIPE_WEBHOOK_SECRET;

    if (mode === 'live' && (!key || !webhookSecret)) {
      throw new CheckoutConfigurationError('Live Stripe key and webhook secret are required');
    }
    const keyPrefixes = mode === 'live' ? ['rk_live_', 'sk_live_'] : ['rk_test_', 'sk_test_'];
    if (key && !keyPrefixes.some((prefix) => key.startsWith(prefix))) {
      throw new CheckoutConfigurationError(`Stripe key does not match ${mode} mode`);
    }
    if (webhookSecret && !webhookSecret.startsWith('whsec_')) {
      throw new CheckoutConfigurationError('Invalid Stripe webhook secret');
    }

    return new StripeAdapter(mode, key ? new Stripe(key) : null, webhookSecret);
  }

  get isLive(): boolean {
    return this.mode === 'live';
  }
}
