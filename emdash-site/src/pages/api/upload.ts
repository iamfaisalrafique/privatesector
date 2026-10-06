import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { image, filename, exactName } = body || {};

    if (!image) {
      return new Response(JSON.stringify({ error: 'No image data provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const matches = image.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    let ext = 'jpg';
    let buffer: Buffer;

    if (matches && matches.length === 3) {
      ext = matches[1] === 'jpeg' ? 'jpg' : (matches[1] === 'svg+xml' ? 'svg' : matches[1]);
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(image, 'base64');
    }

    const cleanBase = filename ? filename.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase() : 'upload';
    const uniqueName = exactName ? `${cleanBase}.${ext}` : `${cleanBase}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

    const targetDirs = [
      path.resolve(process.cwd(), '../public/uploads'),
      path.resolve(process.cwd(), 'public/uploads'),
      path.resolve(process.cwd(), '../server/uploads'),
      path.resolve(process.cwd(), 'dist/client/uploads'),
    ];

    for (const dir of targetDirs) {
      try {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(path.join(dir, uniqueName), buffer);
      } catch {}
    }

    const publicUrl = `/uploads/${uniqueName}`;
    return new Response(JSON.stringify({ success: true, url: publicUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Failed to upload image' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
