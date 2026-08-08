import { useMemo } from 'react';

export default function TableOfContents({ contentHtml = '' }) {
  const headings = useMemo(() => {
    let parsedHeadings = [];

    // 1. Try parsing HTML H2/H3 tags
    const parser = new DOMParser();
    const doc = parser.parseFromString(contentHtml || '', 'text/html');
    const headingElements = doc.querySelectorAll('h2, h3');
    
    if (headingElements.length > 0) {
      parsedHeadings = Array.from(headingElements).map((el, index) => {
        const text = el.innerText || el.textContent || '';
        const slug = el.id || text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `heading-${index}`;
        return { text, slug, level: el.tagName.toLowerCase() };
      });
    } else {
      // 2. Fallback: Parse raw Markdown text lines (##, ###, or short title lines)
      const lines = (contentHtml || '').split('\n');
      lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('## ')) {
          const text = trimmed.replace('## ', '').trim();
          const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          parsedHeadings.push({ text, slug, level: 'h2' });
        } else if (trimmed.startsWith('### ')) {
          const text = trimmed.replace('### ', '').trim();
          const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          parsedHeadings.push({ text, slug, level: 'h3' });
        } else if (
          trimmed.length > 3 &&
          trimmed.length < 70 &&
          !trimmed.endsWith('.') &&
          !trimmed.startsWith('-') &&
          !trimmed.startsWith('*') &&
          !trimmed.startsWith('Source:') &&
          !trimmed.startsWith('http') &&
          !trimmed.includes('---')
        ) {
          // Check if line looks like a title heading line (e.g., "A Strong Quarter for Switzerland's Largest Bank")
          const prevLine = index > 0 ? lines[index - 1].trim() : '';
          const nextLine = index < lines.length - 1 ? lines[index + 1].trim() : '';
          if (prevLine === '' && nextLine === '') {
            const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            parsedHeadings.push({ text: trimmed, slug, level: 'h3' });
          }
        }
      });
    }

    return parsedHeadings;
  }, [contentHtml]);

  const handleScrollTo = (slug) => {
    const el = document.getElementById(slug);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (headings.length === 0) return null;

  return (
    <div style={{
      borderLeft: '2px solid rgba(213, 43, 30, 0.15)',
      paddingLeft: '16px',
      margin: '24px 0',
      fontFamily: 'Inter, sans-serif'
    }}>
      <strong style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary-red)', marginBottom: '12px' }}>
        Table of Contents
      </strong>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {headings.map((h, idx) => (
          <li 
            key={idx} 
            style={{ 
              paddingLeft: h.level === 'h3' ? '12px' : '0px',
              fontSize: '13px'
            }}
          >
            <a 
              href={`#${h.slug}`}
              onClick={(e) => {
                e.preventDefault();
                handleScrollTo(h.slug);
              }}
              style={{ 
                color: '#4B5563', 
                textDecoration: 'none',
                transition: 'color 150ms ease',
                fontWeight: h.level === 'h2' ? 500 : 400
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--primary-red)'}
              onMouseLeave={(e) => e.target.style.color = '#4B5563'}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
