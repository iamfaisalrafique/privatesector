import type { APIRoute } from 'astro';
import { getCompanies } from '../../lib/legacy-db';

export const GET: APIRoute = async ({ url }) => {
  const premiumOnly = url.searchParams.get('premium') === 'true';
  const companies = getCompanies(premiumOnly, 50);
  return new Response(JSON.stringify(companies), {
    headers: { 'Content-Type': 'application/json' },
  });
};
