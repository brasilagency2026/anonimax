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
      const id = String(ad?.id || '').trim();
      const title = String(ad?.title || '').trim().toLowerCase();
      const description = String(ad?.description || '').trim().toLowerCase();
      if (id === 'f295b13b-c64f-444c-a48c-9c3a3b6e48e9') return false;
      if (title === 'desenvolvimento web freelance' && description.includes('5 anos react/node.js')) return false;
      if (title.includes('desenvolvedor') && description.includes('mini saas')) return false;
      return true;
    });

    return res.status(200).json({ ads: filteredAds });
  } catch (error) {
    return res.status(500).json({ error: String(error?.message || error) });
  }
};