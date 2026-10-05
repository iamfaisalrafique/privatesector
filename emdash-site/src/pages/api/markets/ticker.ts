import type { APIRoute } from 'astro';

const defaultTicker = [
  { flag: 'swiss', label: 'SMI', value: '12,123.42', change: '+0.45%', positive: true },
  { flag: 'usa', label: 'S&P 500', value: '5,344.16', change: '-0.31%', positive: false },
  { label: 'NASDAQ', value: '16,745.30', change: '-0.22%', positive: false },
  { label: 'USD/CHF', value: '0.8742', change: '+0.21%', positive: true },
  { label: 'EUR/CHF', value: '0.9431', change: '+0.18%', positive: true },
  { label: 'GOLD', value: '$2,345.10', change: '+0.35%', positive: true },
  { label: 'BRENT', value: '$82.56', change: '-0.12%', positive: false },
  { label: 'U.S. 10Y', value: '4.25%', change: '+0.03%', positive: true }
];

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify(defaultTicker), {
    headers: { 'Content-Type': 'application/json' },
  });
};
