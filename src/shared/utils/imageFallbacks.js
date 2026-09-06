export const CATEGORY_FALLBACK_MAP = {
  'Biotechnology': 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80',
  'Biotechnology & M&A': 'https://images.unsplash.com/photo-1579165466741-7f35e4755660?auto=format&fit=crop&q=80',
  'Energy & Infrastructure': 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80',
  'Clean Energy': 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&q=80',
  'Advanced Manufacturing': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80',
  'Aerospace & Technology': 'https://images.unsplash.com/photo-1517976487504-59a1a0b82f0c?auto=format&fit=crop&q=80',
  'Pharmaceuticals': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80',
  'Medical Technology': 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80',
  'Fintech & Banking': 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80',
  'Insurtech & Finance': 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80',
  'Wealth Management': 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80',
  'Financial Services': 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80',
  'Consumer Goods': 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80',
  'Guides': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80',
  'Market Trends': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80',
  'University Perspective': 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80'
};

export const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80';

export function getCategoryFallbackImage(category, width = 600) {
  const base = CATEGORY_FALLBACK_MAP[category] || DEFAULT_FALLBACK_IMAGE;
  return `${base}&w=${width}`;
}

export function handleImageFallback(e, category, width = 600) {
  e.currentTarget.onerror = null;
  e.currentTarget.src = getCategoryFallbackImage(category, width);
}
