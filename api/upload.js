import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '6mb',
    },
  },
};

const MAX_SIZE = 4 * 1024 * 1024; // 4MB, matches the client-side limit

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { filename, contentType, fileBase64 } = req.body || {};

    if (!filename || !fileBase64) {
      return res.status(400).json({ error: 'filename and fileBase64 are required' });
    }

    const buffer = Buffer.from(fileBase64, 'base64');

    if (buffer.length > MAX_SIZE) {
      return res.status(413).json({ error: 'File exceeds the 4MB limit' });
    }

    const safeName = String(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `uploads/${Date.now()}-${safeName}`;

    const blob = await put(key, buffer, {
      access: 'public',
      contentType: contentType || 'application/octet-stream',
    });

    return res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error('upload error', err);
    return res.status(500).json({ error: `Failed to upload file: ${err.message || err}` });
  }
}
