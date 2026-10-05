import type { APIRoute } from 'astro';
import { getActiveMorningBriefings } from '../../../lib/legacy-db';

export const GET: APIRoute = async ({ url }) => {
  const limit = parseInt(url.searchParams.get('limit') || '2', 10);
  const briefings = getActiveMorningBriefings(limit);
  // parse linked_articles if JSON string
  const formatted = briefings.map((b: any) => {
    if (typeof b.linked_articles === 'string') {
      try {
        b.linked_articles = JSON.parse(b.linked_articles);
      } catch {}
    }
    return b;
  });
  return new Response(JSON.stringify(formatted), {
    headers: { 'Content-Type': 'application/json' },
  });
};
