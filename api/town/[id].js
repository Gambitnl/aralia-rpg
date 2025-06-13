export default async function handler(req, res) {
  const { id } = req.query;
  const env = req.query.env || 'forest';
  const base = process.env.FLASK_BASE || 'http://localhost:5001';
  const url = `${base}/api/town/${id}/map?env=${env}`;
  try {
    const resp = await fetch(url);
    const data = await resp.json();
    return res.status(resp.status).json(data);
  } catch (e) {
    console.error('Town API error', e);
    return res.status(500).json({ error: 'Failed to fetch town' });
  }
}
