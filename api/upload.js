// api/upload.js - Vercel Serverless Function for uploading files to Vercel Blob Storage

import { put } from '@vercel/blob';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { filename, contentType, buffer } = req.body;

    if (!filename || !buffer) {
      return res.status(400).json({
        error: 'Filename and file buffer are required',
      });
    }

    // Upload to Vercel Blob Storage
    const blob = await put(filename, Buffer.from(buffer, 'base64'), {
      access: 'public',
      contentType: contentType || 'video/mp4',
    });

    return res.status(200).json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to upload file',
    });
  }
}


