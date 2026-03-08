# Deploy Vercel (Supabase + PayPal via Vercel API)

## 1) Prerequis
- Supabase project already created
- SQL applied from `supabase/schema.sql`
- No Supabase Edge Function is required for PayPal when using Vercel API routes.

## 2) Import project in Vercel
1. Push this folder to GitHub/GitLab/Bitbucket.
2. In Vercel: `Add New -> Project`.
3. Import repository.
4. Framework preset: `Other`.

## 3) Set Vercel environment variables
In Vercel project settings -> Environment Variables, add:
- `NEXT_PUBLIC_SUPABASE_URL` = `https://<project-ref>.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `<anon-key>`
- `PAYPAL_CLIENT_ID` = `<paypal-sandbox-client-id>`
- `PAYPAL_CLIENT_SECRET` = `<paypal-sandbox-secret>`
- `PAYPAL_BASE_URL` = `https://api-m.sandbox.paypal.com`
- `PUBLICATION_FEE` = `4.90`
- `PAYPAL_CREATE_ORDER_FUNCTION` = `/api/paypal-create-order`
- `PAYPAL_CAPTURE_ORDER_FUNCTION` = `/api/paypal-capture-order`

Then redeploy.

## 4) Verify after deploy
1. Open your Vercel URL.
2. Create a new Anonimax ID.
3. Publish an ad and pay with PayPal sandbox account.
4. Confirm that new data appears in Supabase tables `profiles` and `ads`.

## 5) Local check (optional)
If using Vercel CLI:
```bash
vercel dev
```
Then open:
- `http://localhost:3000/`
- `http://localhost:3000/api/config` (must return your config JSON)

## Notes
- `SUPABASE_ANON_KEY` is public by design for frontend usage.
- Keep your PayPal secret only in Vercel server env (`PAYPAL_CLIENT_SECRET`), never in browser code.
- Root path `/` is rewritten to `anonimax-pt.html` via `vercel.json`.
