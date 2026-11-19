export class CheckoutError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'CheckoutError';
  }
}

export class CheckoutValidationError extends CheckoutError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class CheckoutConfigurationError extends CheckoutError {
  constructor(message = 'Stripe checkout is not configured') {
    super(message, 503);
  }
}
