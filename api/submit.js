import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;

    if (!data || !data.fullName || !data.fullName.trim()) {
      return res.status(400).json({ error: 'Full name is required' });
    }

    const id = `resp:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
    const record = {
      id,
      submittedAt: new Date().toISOString(),
      ...data,
    };

    await kv.set(id, record);
    await kv.lpush('responses:index', id);

    return res.status(200).json({ ok: true, id });
  } catch (err) {
    console.error('submit error:', err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}
