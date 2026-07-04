import React, { useEffect, useState } from 'react';

export default function TableOfContents({ contentHtml = '' }) {
  const [headings, setHeadings] = useState([]);

  useEffect(() => {
    // Parse H2 and H3 tags from contentHtml or search in document body
    const parser = new DOMParser();
    const doc = parser.parseFromString(contentHtml, 'text/html');
    const headingElements = doc.querySelectorAll('h2, h3');
    
    const parsedHeadings = Array.from(headingElements).map((el, index) => {
      const text = el.innerText || el.textContent || '';
      // Create a slug if id doesn't exist
      const slug = el.id || text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `heading-${index}`;
      return {
        text,
        slug,
        level: el.tagName.toLowerCase()
      };
    });

    setHeadings(parsedHeadings);
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
