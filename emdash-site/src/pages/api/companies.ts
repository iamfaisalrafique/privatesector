import type { APIRoute } from 'astro';
import { getCompanies } from '../../lib/legacy-db';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const premium = url.searchParams.get('premium') === 'true';
    const verified = url.searchParams.get('verified') === 'true';
    const search = url.searchParams.get('search') || undefined;
    const canton = url.searchParams.get('canton') || undefined;
    const industry = url.searchParams.get('industry') || undefined;
    const size = url.searchParams.get('size') || undefined;
    const limit = parseInt(url.searchParams.get('limit') || '100', 10);

    const companies = await getCompanies(premium, limit, {
      search,
      canton,
      industry,
      size,
      verified,
    });

    return new Response(JSON.stringify(companies), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
