# Backend

`STRIPE_MODE` selects `test` (default) or `live`. The server uses only the credentials for the selected mode.

| Mode | API key | Webhook signing secret |
| --- | --- | --- |
| `test` | `STRIPE_TEST_SECRET_KEY` | `STRIPE_TEST_WEBHOOK_SECRET` |
| `live` | `STRIPE_LIVE_SECRET_KEY` | `STRIPE_LIVE_WEBHOOK_SECRET` |

The older `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` names remain supported in test mode. They are never used in live mode. Keep all values in the ignored local `.env` or the hosting provider's secret settings; do not commit them. Set `WEBSITE_URL` to the public frontend URL for Checkout redirects.

Live mode requires a working `MONGO_URI`. The server will not start if MongoDB is unavailable, because payment state must survive restarts. The Stripe webhook endpoint is `POST /webhook`; configure a separate live-mode Stripe destination for it and use that destination's signing secret. Checkout starts at `POST /checkout`.

Run `npm run typecheck` and `npm run test:checkout` to check the integration. A test Checkout session does not verify a completed payment or a live webhook delivery.
