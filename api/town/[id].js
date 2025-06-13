export default async function handler(req, res) {
  const { id } = req.query;
  const env = req.query.env || 'forest';
  const base = process.env.FLASK_BASE;
  if (!base) {
    console.error('FLASK_BASE not set');
    return res.status(500).json({ error: 'FLASK_BASE not configured' });
  }
  const url = `${base}/api/town/${id}/map?env=${env}`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) {
      const text = await resp.text();
      console.error('Town fetch failed:', resp.status, text);
      return res.status(resp.status).json({ error: `Backend ${resp.status}` });
    }
    const data = await resp.json();
    return res.status(resp.status).json(data);
  } catch (e) {
    console.error('Town API error', e);
    return res.status(500).json({ error: 'Failed to fetch town' });
  }
}
