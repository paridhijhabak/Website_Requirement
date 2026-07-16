import { getRedis } from './_redis.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  const providedPassword = req.headers['x-admin-password'];

  if (!adminPassword) {
    return res.status(500).json({ error: 'ADMIN_PASSWORD is not configured on the server' });
  }

  if (!providedPassword || providedPassword !== adminPassword) {
    return res.status(401).json({ error: 'Incorrect password' });
  }

  try {
    const redis = getRedis();
    const ids = await redis.lrange('submissions:index', 0, -1);

    if (!ids || ids.length === 0) {
      return res.status(200).json({ responses: [] });
    }

    const keys = ids.map(id => `submission:${id}`);
    const raw = await redis.mget(...keys);
    const responses = raw
      .filter(Boolean)
      .map(r => {
        try { return JSON.parse(r); } catch { return null; }
      })
      .filter(Boolean);

    return res.status(200).json({ responses });
  } catch (err) {
    console.error('responses error', err);
    return res.status(500).json({ error: `Failed to load responses: ${err.message || err}` });
  }
}
