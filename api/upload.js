// api/upload.js - Vercel Serverless Function to upload files to Google Drive via Google Apps Script (GAS)

export async function uploadBufferToDrive(buffer, fileName, mimeType, dateStr) {
  const gasUrl = process.env.GAS_DEPLOYMENT_URL || process.env.GAS_WEB_APP_URL;
  if (!gasUrl) {
    console.warn('GAS_DEPLOYMENT_URL is not set in environment variables');
    return { success: false, error: 'GAS_DEPLOYMENT_URL not configured' };
  }

  try {
    const fileBase64 = Buffer.isBuffer(buffer) ? buffer.toString('base64') : buffer;
    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'uploadFile',
        fileBase64,
        fileName: fileName || `file_${Date.now()}`,
        mimeType: mimeType || 'application/octet-stream',
        dateStr: dateStr || new Date().toISOString().split('T')[0]
      }),
      redirect: 'follow'
    });

    const result = await response.json();
    return result;
  } catch (err) {
    console.error('Error forwarding file to GAS:', err);
    return { success: false, error: err.message || String(err) };
  }
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { fileBase64, fileName, mimeType, dateStr } = req.body || {};

    if (!fileBase64) {
      return res.status(400).json({ success: false, error: 'Missing fileBase64 in request body' });
    }

    const result = await uploadBufferToDrive(fileBase64, fileName, mimeType, dateStr);
    if (!result.success) {
      return res.status(502).json(result);
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error('Upload handler error:', err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
}
