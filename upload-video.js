// Script to upload Show_reel_2025.m4v to Vercel Blob Storage
import { put } from '@vercel/blob';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

// Load environment variables if .env file exists
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const videoPath = join(__dirname, 'videos', 'Show_reel_2025.m4v');
const filename = 'Show_reel_2025.m4v';

// Check for token in environment
const token = process.env.BLOB_READ_WRITE_TOKEN;

if (!token) {
  console.error('❌ BLOB_READ_WRITE_TOKEN not found!');
  console.error('\nTo upload the video, you need to:');
  console.error('1. Go to https://vercel.com/dashboard/stores');
  console.error('2. Create a new Blob store (or use an existing one)');
  console.error('3. Copy the BLOB_READ_WRITE_TOKEN');
  console.error('4. Set it as an environment variable:');
  console.error('   export BLOB_READ_WRITE_TOKEN="your-token-here"');
  console.error('   OR create a .env file with: BLOB_READ_WRITE_TOKEN=your-token-here');
  console.error('\nAlternatively, you can pass the token directly:');
  console.error('   BLOB_READ_WRITE_TOKEN=your-token node upload-video.js');
  process.exit(1);
}

try {
  console.log('Reading video file...');
  const fileBuffer = readFileSync(videoPath);
  console.log(`File size: ${(fileBuffer.length / 1024 / 1024).toFixed(2)} MB`);
  
  console.log('Uploading to Vercel Blob Storage...');
  const blob = await put(filename, fileBuffer, {
    access: 'public',
    contentType: 'video/mp4',
    token: token,
  });

  console.log('\n✅ Upload successful!');
  console.log('URL:', blob.url);
  console.log('Pathname:', blob.pathname);
  console.log('\nYou can use this URL in your portfolio:');
  console.log(blob.url);
} catch (error) {
  console.error('❌ Upload failed:', error.message);
  if (error.message.includes('token') || error.message.includes('auth')) {
    console.error('\n⚠️  Authentication failed. Please check your BLOB_READ_WRITE_TOKEN.');
  }
  process.exit(1);
}

