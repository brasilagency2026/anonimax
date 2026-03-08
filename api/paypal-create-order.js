module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const amountNum = Number(body.amount || process.env.PUBLICATION_FEE || '4.90');
    const currency = body.currency || 'BRL';
    const description = body.description || 'Taxa de publicacao Anonimax';

    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const clientId = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_SECRET;
    const paypalBase = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';
    const siteUrl = process.env.PUBLIC_SITE_URL || req.headers.origin || 'https://anonimax.com';

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

    const orderRes = await fetch(`${paypalBase}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenJson.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        application_context: {
          user_action: 'PAY_NOW',
          return_url: `${siteUrl}/?paypal_return=1`,
          cancel_url: `${siteUrl}/?paypal_cancel=1`
        },
        purchase_units: [
          {
            description,
            amount: {
              currency_code: currency,
              value: amountNum.toFixed(2)
            }
          }
        ]
      })
    });

    const orderJson = await orderRes.json();
    if (!orderRes.ok || !orderJson.id) {
      return res.status(500).json({ error: 'Could not create PayPal order', details: orderJson });
    }

    return res.status(200).json({ orderID: orderJson.id });
  } catch (error) {
    return res.status(500).json({ error: String(error?.message || error) });
  }
};