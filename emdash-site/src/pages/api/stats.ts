import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const gdpTrend = [
    { year: 2018, value: 710 }, { year: 2019, value: 725 }, { year: 2020, value: 702 },
    { year: 2021, value: 735 }, { year: 2022, value: 750 }, { year: 2023, value: 765 },
    { year: 2024, value: 780 }, { year: 2025, value: 792 }, { year: 2026, value: 805 }
  ];
  const employmentTrend = [
    { year: 2018, value: 4.95 }, { year: 2019, value: 5.02 }, { year: 2020, value: 4.98 },
    { year: 2021, value: 5.08 }, { year: 2022, value: 5.15 }, { year: 2023, value: 5.22 },
    { year: 2024, value: 5.28 }, { year: 2025, value: 5.34 }, { year: 2026, value: 5.40 }
  ];
  const sectors = [
    { name: 'Manufacturing & Technology', share: 18 },
    { name: 'Retail & Wholesale', share: 12 },
    { name: 'Financial Services', share: 10 },
    { name: 'Pharmaceuticals & Biotech', share: 9 },
    { name: 'Tourism & Hospitality', share: 6 },
    { name: 'Luxury Goods & Watchmaking', share: 4 },
    { name: 'Other Diversified Sectors', share: 41 }
  ];
  const cantonWeights = {
    ZH: 95, BE: 80, SG: 60, BS: 88, GE: 90, VD: 85, TI: 50, AG: 70, LU: 55, SZ: 65,
    TG: 45, GR: 30, FR: 40, SO: 38, BL: 58, SH: 35, AR: 25, AI: 15, WY: 10, NW: 48,
    OW: 28, UR: 18, GL: 22, ZG: 92, JU: 20, NE: 42, VS: 35
  };

  return new Response(JSON.stringify({ gdpTrend, employmentTrend, sectors, cantonWeights }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
