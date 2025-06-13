export default async function handler(req, res) {
  const { id } = req.query;
  const env = req.query.env || 'forest';
  const base = process.env.FLASK_BASE || 'http://localhost:5000';
  if (!process.env.FLASK_BASE) {
    console.warn('FLASK_BASE not set; using default http://localhost:5000');
  }
  const url = `${base}/api/town/${id}/map?env=${env}`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) {
      const text = await resp.text();
      console.error('Town fetch failed:', resp.status, text);
      const statusCode = resp.status === 404 ? 404 : 502;
      return res
        .status(statusCode)
        .json({ error: 'Failed to fetch town', status: resp.status });
    }
    const data = await resp.json();
    return res.status(resp.status).json(data);
  } catch (e) {
    console.error('Town API error', e);
    return res.status(500).json({ error: 'Failed to fetch town' });
  }
}
