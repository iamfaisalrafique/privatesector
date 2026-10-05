import type { APIRoute } from 'astro';
import { getNews } from '../../lib/legacy-db';

export const GET: APIRoute = async () => {
  const news = getNews(50);
  return new Response(JSON.stringify(news), {
    headers: { 'Content-Type': 'application/json' },
  });
};
