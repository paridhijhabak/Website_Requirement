import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'ADMIN_PASSWORD is not configured on the server' });
  }

  const provided = req.headers['x-admin-password'];
  if (provided !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const ids = await kv.lrange('responses:index', 0, -1);
    if (!ids || ids.length === 0) {
      return res.status(200).json({ responses: [] });
    }

    const records = await Promise.all(ids.map((id) => kv.get(id)));
    const sorted = records
      .filter(Boolean)
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    return res.status(200).json({ responses: sorted });
  } catch (err) {
    console.error('responses error:', err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}
