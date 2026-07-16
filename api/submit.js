import { getRedis } from './_redis.js';
import { randomUUID } from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};

    if (!body.fullName || !String(body.fullName).trim()) {
      return res.status(400).json({ error: 'fullName is required' });
    }

    const id = randomUUID();

    const submission = {
      id,
      submittedAt: new Date().toISOString(),
      fullName: String(body.fullName || '').trim(),
      companyName: String(body.companyName || '').trim(),
      businessDescription: String(body.businessDescription || '').trim(),
      existingWebsite: String(body.existingWebsite || '').trim(),
      targetAudience: String(body.targetAudience || '').trim(),
      competitors: String(body.competitors || '').trim(),
      mainPurpose: String(body.mainPurpose || '').trim(),
      mainPurposeOther: String(body.mainPurposeOther || '').trim(),
      pagesNeeded: Array.isArray(body.pagesNeeded) ? body.pagesNeeded : [],
      pagesNeededOther: String(body.pagesNeededOther || '').trim(),
      stylePreference: Array.isArray(body.stylePreference) ? body.stylePreference : [],
      stylePreferenceOther: String(body.stylePreferenceOther || '').trim(),
      likedWebsites: String(body.likedWebsites || '').trim(),
      hasLogoColors: String(body.hasLogoColors || '').trim(),
      stylesToAvoid: String(body.stylesToAvoid || '').trim(),
      contentReady: String(body.contentReady || '').trim(),
      featuresNeeded: Array.isArray(body.featuresNeeded) ? body.featuresNeeded : [],
      featuresNeededOther: String(body.featuresNeededOther || '').trim(),
      additionalNotes: String(body.additionalNotes || '').trim(),
      attachments: Array.isArray(body.attachments)
        ? body.attachments
            .filter(a => a && a.url)
            .map(a => ({ name: String(a.name || 'file'), url: String(a.url) }))
        : [],
    };

    const redis = getRedis();
    await redis.set(`submission:${id}`, JSON.stringify(submission));
    await redis.lpush('submissions:index', id);

    return res.status(200).json({ ok: true, id });
  } catch (err) {
    console.error('submit error', err);
    return res.status(500).json({ error: `Failed to save submission: ${err.message || err}` });
  }
}
