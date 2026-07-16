import { put } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { filename, fileBase64, contentType } = req.body;

    if (!filename || !fileBase64) {
      return res.status(400).json({ error: 'Missing file data' });
    }

    const buffer = Buffer.from(fileBase64, 'base64');

    // Hard safety cap, mirrors the 4MB limit enforced client-side
    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(413).json({ error: 'File too large' });
    }

    const blob = await put(`uploads/${Date.now()}-${filename}`, buffer, {
      access: 'public',
      contentType: contentType || 'application/octet-stream',
    });

    return res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error('upload error:', err);
    return res.status(500).json({ error: 'Upload failed', detail: err.message });
  }
}
