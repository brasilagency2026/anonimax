# Supabase + PayPal setup

## 1) Apply database schema
1. Open Supabase SQL Editor.
2. Run `supabase/schema.sql`.

## 2) Deploy edge functions
1. Install Supabase CLI.
2. Login and link project.
3. Deploy:

```bash
supabase functions deploy paypal-create-order
supabase functions deploy paypal-capture-order
```

## 3) Configure function secrets
Set these in Supabase project secrets:
- `PAYPAL_CLIENT_ID`
- `PAYPAL_SECRET`
- `PAYPAL_BASE_URL`:
  - Sandbox: `https://api-m.sandbox.paypal.com`
  - Production: `https://api-m.paypal.com`

## 4) Configure frontend constants
In `anonimax-pt.html`, update `APP_CONFIG`:
- `supabaseUrl`
- `supabaseAnonKey`
- `paypalClientId`

After this, the site runs in cloud mode:
- Reads/writes `profiles` and `ads` from Supabase
- Uses real PayPal order create/capture via Edge Functions

If config is missing, site falls back to local demo data.
