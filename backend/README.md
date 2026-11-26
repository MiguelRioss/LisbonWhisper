# Backend

`STRIPE_MODE` selects `test` (default) or `live`. The server uses only the credentials for the selected mode.

| Mode | API key | Webhook signing secret |
| --- | --- | --- |
| `test` | `STRIPE_TEST_SECRET_KEY` | `STRIPE_TEST_WEBHOOK_SECRET` |
| `live` | `STRIPE_LIVE_SECRET_KEY` | `STRIPE_LIVE_WEBHOOK_SECRET` |

The older `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` names remain supported in test mode. They are never used in live mode. Keep all values in the ignored local `.env` or the hosting provider's secret settings; do not commit them. Set `WEBSITE_URL` to the public frontend URL for Checkout redirects.

Live mode requires a working `MONGO_URI`. The server will not start if MongoDB is unavailable, because payment state must survive restarts. The Stripe webhook endpoint is `POST /webhook`; configure a separate live-mode Stripe destination for it and use that destination's signing secret. Checkout starts at `POST /checkout`.

Run `npm run typecheck` and `npm run test:checkout` to check the integration. A test Checkout session does not verify a completed payment or a live webhook delivery.

MongoDB stores the tour catalogue in `bookingApp.tours` and customer records in `bookingApp.clients`. Startup inserts missing tours from `repo/tours.seed.json` and preserves existing entries. Paid bookings and valid contact form submissions update clients by normalized email. The authenticated dashboard lists clients at `GET /database/clients`.

`GET /tours` returns `{ tours }`. `GET /tours/:id` returns `{ tour }`, using the MongoDB document ID, which is the URL slug for each seeded tour. Unknown IDs return HTTP 404. Set `VITE_API_BASE_URL=http://localhost:1904` in the frontend's local environment to use a local backend.

Email uses SMTP. Before deploying, configure `SMTP_HOST`, `SMTP_PORT`, `EMAIL_FROM` and the provider's `SMTP_USER` and `SMTP_PASS` if it requires authentication. Use `SMTP_SECURE=true` for implicit TLS. Run `npm run smtp:test` with the intended configuration to check the connection. Set `EMAIL_DELIVERY_DISABLED=true` for local tests that should skip delivery.
