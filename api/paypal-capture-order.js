module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const orderID = body.orderID;

    if (!orderID) {
      return res.status(400).json({ error: 'orderID is required' });
    }

    const clientId = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_SECRET;
    const paypalBase = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';

    if (!clientId || !clientSecret) {
      return res.status(500).json({ error: 'Missing PayPal credentials on Vercel' });
    }

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const tokenRes = await fetch(`${paypalBase}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok || !tokenJson.access_token) {
      return res.status(500).json({ error: 'Could not get PayPal token', details: tokenJson });
    }

    const captureRes = await fetch(`${paypalBase}/v2/checkout/orders/${encodeURIComponent(orderID)}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenJson.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    const captureJson = await captureRes.json();
    if (!captureRes.ok || captureJson.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Capture failed', details: captureJson });
    }

    return res.status(200).json({ ok: true, status: captureJson.status, capture: captureJson });
  } catch (error) {
    return res.status(500).json({ error: String(error?.message || error) });
  }
};