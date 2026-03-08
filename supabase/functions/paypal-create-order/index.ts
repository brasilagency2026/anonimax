import "jsr:@supabase/functions-js/edge-runtime.d.ts";

declare const Deno: {
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
  env: { get: (key: string) => string | undefined };
};

function corsHeaders(origin: string | null) {
  const allowed = [
    'https://anonimax.com',
    'https://www.anonimax.com',
    'http://localhost:3000',
    'http://localhost:5173'
  ];
  const allowOrigin = origin && allowed.includes(origin) ? origin : 'https://anonimax.com';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
  };
}

// Supabase Edge Function: paypal-create-order
// Required secrets:
// - PAYPAL_CLIENT_ID
// - PAYPAL_SECRET
// Optional:
// - PAYPAL_BASE_URL (defaults to sandbox)

Deno.serve(async (req: Request) => {
  const headers = corsHeaders(req.headers.get('origin'));

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers, status: 200 });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { headers, status: 405 });
  }

  try {
    const { amount, currency = 'BRL', description = 'Anonimax publication fee' } = await req.json();
    const paypalBase = Deno.env.get('PAYPAL_BASE_URL') || 'https://api-m.sandbox.paypal.com';
    const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
    const secret = Deno.env.get('PAYPAL_SECRET');

    if (!clientId || !secret) {
      return new Response(JSON.stringify({ error: 'Missing PayPal credentials' }), { headers, status: 500 });
    }

    const basic = btoa(`${clientId}:${secret}`);
    const tokenRes = await fetch(`${paypalBase}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok || !tokenJson.access_token) {
      return new Response(JSON.stringify({ error: 'Could not get PayPal token', details: tokenJson }), { headers, status: 500 });
    }

    const orderRes = await fetch(`${paypalBase}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenJson.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            description,
            amount: {
              currency_code: currency,
              value: Number(amount).toFixed(2)
            }
          }
        ]
      })
    });

    const orderJson = await orderRes.json();
    if (!orderRes.ok || !orderJson.id) {
      return new Response(JSON.stringify({ error: 'Could not create PayPal order', details: orderJson }), { headers, status: 500 });
    }

    return new Response(JSON.stringify({ orderID: orderJson.id }), {
      headers,
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      headers,
      status: 500
    });
  }
});
