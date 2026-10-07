import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

export const prerender = false;

const MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.avif': 'image/avif',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm'
};

export const GET: APIRoute = async ({ params }) => {
  const fileParam = params.file;
  if (!fileParam) {
    return new Response('File not found', { status: 404 });
  }

  // Prevent directory traversal
  const safeFilename = path.basename(fileParam);

  const searchDirs = [
    path.resolve(process.cwd(), 'dist/client/uploads'),
    path.resolve(process.cwd(), '../public/uploads'),
    path.resolve(process.cwd(), 'public/uploads'),
    path.resolve(process.cwd(), 'uploads'),
    path.resolve(process.cwd(), '../server/uploads'),
    path.resolve(process.cwd(), 'server/uploads'),
  ];

  for (const dir of searchDirs) {
    const fullPath = path.join(dir, safeFilename);
    try {
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        const ext = path.extname(fullPath).toLowerCase();
        const contentType = MIME_MAP[ext] || 'application/octet-stream';
        const buffer = fs.readFileSync(fullPath);

        return new Response(buffer, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Content-Length': String(buffer.length)
          }
        });
      }
    } catch {}
  }

  return new Response('File not found', { status: 404 });
};
