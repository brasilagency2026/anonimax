module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

    const title = String(body.title || '').trim();
    const category = String(body.category || '').trim();
    const description = String(body.description || '').trim();
    const contactSession = String(body.contact_session || '').trim();
    const polygonAddress = body.polygon_address ? String(body.polygon_address).trim() : null;
    const anonimaxId = body.anonimax_id ? String(body.anonimax_id).trim() : null;
    const emoji = body.emoji ? String(body.emoji) : '📌';
    const priceRaw = Number(body.price);
    const price = Number.isFinite(priceRaw) && priceRaw >= 0 ? priceRaw : 0;

    if (!title || !category || !description || !contactSession) {
      return res.status(400).json({ error: 'Missing required ad fields' });
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY on Vercel' });
    }

    const payload = {
      title,
      category,
      description,
      price,
      contact_session: contactSession,
      polygon_address: polygonAddress || null,
      anonimax_id: anonimaxId && /^ANX-/.test(anonimaxId) ? anonimaxId : null,
      emoji
    };

    const insertRes = await fetch(`${supabaseUrl}/rest/v1/ads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Prefer: 'return=representation'
      },
      body: JSON.stringify(payload)
    });

    const raw = await insertRes.text();
    let json = null;
    try { json = raw ? JSON.parse(raw) : null; } catch (_err) { json = { raw }; }

    if (!insertRes.ok) {
      return res.status(insertRes.status).json({
        error: 'Supabase insert ads failed',
        details: json
      });
    }

    const row = Array.isArray(json) ? json[0] : json;
    return res.status(200).json({ ok: true, ad: row || payload });
  } catch (error) {
    return res.status(500).json({ error: String(error?.message || error) });
  }
};