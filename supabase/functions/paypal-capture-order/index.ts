import "jsr:@supabase/functions-js/edge-runtime.d.ts";

declare const Deno: {
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
  env: { get: (key: string) => string | undefined };
};

// Supabase Edge Function: paypal-capture-order
// Required secrets:
// - PAYPAL_CLIENT_ID
// - PAYPAL_SECRET
// Optional:
// - PAYPAL_BASE_URL (defaults to sandbox)

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { orderID } = await req.json();
    if (!orderID) {
      return new Response(JSON.stringify({ error: 'orderID is required' }), { status: 400 });
    }

    const paypalBase = Deno.env.get('PAYPAL_BASE_URL') || 'https://api-m.sandbox.paypal.com';
    const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
    const secret = Deno.env.get('PAYPAL_SECRET');

    if (!clientId || !secret) {
      return new Response(JSON.stringify({ error: 'Missing PayPal credentials' }), { status: 500 });
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
      return new Response(JSON.stringify({ error: 'Could not get PayPal token', details: tokenJson }), { status: 500 });
    }

    const captureRes = await fetch(`${paypalBase}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenJson.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    const captureJson = await captureRes.json();
    if (!captureRes.ok || captureJson.status !== 'COMPLETED') {
      return new Response(JSON.stringify({ error: 'Capture failed', details: captureJson }), { status: 400 });
    }

    return new Response(JSON.stringify({ ok: true, status: captureJson.status, capture: captureJson }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
