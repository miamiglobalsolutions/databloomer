# Stripe setup for DataBloomer

This app uses **Stripe Checkout (subscription mode)** plus webhooks to grant/revoke subscriber access.

## 1) Create Stripe product + price

1. Go to [Stripe Dashboard → Products](https://dashboard.stripe.com/products).
2. Create a product, e.g. **DataBloomer Monthly**.
3. Add a recurring price (monthly).
4. Copy the **Price ID** (`price_...`) → set as `STRIPE_PRICE_ID`.

## 2) Get API keys

1. Go to [Stripe Dashboard → API keys](https://dashboard.stripe.com/apikeys).
2. Copy **Secret key** (`sk_live_...` or `sk_test_...`) → `STRIPE_SECRET_KEY`.

Use **test mode** first while validating the flow.

## 3) Configure Vercel env vars

In Vercel project settings (Production + Preview as needed):

| Variable | Example | Purpose |
|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_...` | Server-side Stripe API |
| `STRIPE_PRICE_ID` | `price_...` | Monthly subscription price |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Verify webhook signatures |
| `SUBSCRIPTION_GATING` | `true` | Enable server-side masking |
| `NEXT_PUBLIC_SUBSCRIPTION_GATING` | `true` | Enable UI preview mode |
| `ADMIN_ACCESS_CODE` | long random string | Your admin full-access login |
| `SUBSCRIBER_ACCESS_CODE` | optional | Manual subscriber override |
| `NEXT_PUBLIC_APP_URL` | `https://databloomer.com` | Checkout success/cancel URLs |
| `DATABASE_URL` | Neon URL | Stores `stripe_subscribers` |

Redeploy after saving env vars.

## 4) Run DB migration (Neon)

From local CMD/PowerShell with production `DATABASE_URL` set:

```bat
cd C:\Users\tompa\Documents\solution\roofradar\web
set DATABASE_URL=postgresql://...neon...
npm run db:migrate
```

This creates `stripe_subscribers`.

## 5) Create Stripe webhook endpoint

1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**
2. Endpoint URL:
   - `https://databloomer.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy signing secret (`whsec_...`) → `STRIPE_WEBHOOK_SECRET` in Vercel.
5. Redeploy.

### Local webhook testing (optional)

```bat
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Use the `whsec_...` from `stripe listen` in local `.env`.

## 6) Test the full flow

1. Open `/subscribe`
2. Click **Subscribe now** → Stripe Checkout
3. Pay with test card `4242 4242 4242 4242`
4. Redirect to `/subscribe/success?session_id=...`
5. App verifies session and sets subscriber cookies
6. Dashboard should show **unmasked** addresses/folios + CSV export

### Returning on another browser/device

On `/subscribe`, use **Already subscribed?** and enter checkout email.

## 7) Admin access (you)

1. Set `ADMIN_ACCESS_CODE` in Vercel.
2. Visit `/admin`
3. Enter admin code → full access on that browser (no Stripe needed).

## Troubleshooting

- **Addresses still blurred**
  - Confirm `SUBSCRIPTION_GATING=true`
  - Confirm subscriber cookie/session (re-login with email on `/subscribe`)
  - Check `stripe_subscribers` row exists and `status` is `active` or `trialing`

- **Webhook failures**
  - Verify endpoint URL and `STRIPE_WEBHOOK_SECRET`
  - Check Vercel function logs for `/api/stripe/webhook`

- **Checkout button error**
  - Missing `STRIPE_SECRET_KEY` or `STRIPE_PRICE_ID`

- **Enum / leads errors**
  - Run `npm run db:migrate` and `npm run leads:refresh` against Neon
