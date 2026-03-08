module.exports = async (_req, res) => {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY on Vercel' });
    }

    const query = 'select=*&order=created_at.desc&limit=200';
    const listRes = await fetch(`${supabaseUrl}/rest/v1/ads?${query}`, {
      method: 'GET',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`
      }
    });

    const raw = await listRes.text();
    let json = null;
    try { json = raw ? JSON.parse(raw) : []; } catch (_err) { json = []; }

    if (!listRes.ok) {
      return res.status(listRes.status).json({ error: 'Supabase list ads failed', details: json });
    }

    const ads = Array.isArray(json) ? json : [];
    const filteredAds = ads.filter((ad) => {
      const title = String(ad?.title || '').trim().toLowerCase();
      const description = String(ad?.description || '').trim().toLowerCase();
      return !(title === 'desenvolvimento web freelance' && description.includes('5 anos react/node.js'));
    });

    return res.status(200).json({ ads: filteredAds });
  } catch (error) {
    return res.status(500).json({ error: String(error?.message || error) });
  }
};