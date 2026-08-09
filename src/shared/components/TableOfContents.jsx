import { useState, useEffect, useMemo } from 'react';

function formatHeadingText(text) {
  if (!text) return '';
  // Strip numeric prefix like "01 | ", "02 — ", etc.
  const clean = text.replace(/^([0-9]+\s*[|—–-]\s*)/, '').trim();
  const words = clean.split(/\s+/);
  if (words.length <= 3) return clean;
  return words.slice(0, 3).join(' ');
}

export default function TableOfContents({ contentHtml = '' }) {
  const [activeSlug, setActiveSlug] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

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

  // Scroll detection to highlight active heading and auto-expand after reaching 7th heading
  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      const headingEls = headings.map(h => document.getElementById(h.slug)).filter(Boolean);
      let currentActiveIndex = 0;
      
      for (let i = 0; i < headingEls.length; i++) {
        const rect = headingEls[i].getBoundingClientRect();
        if (rect.top <= 160) {
          currentActiveIndex = i;
        }
      }
      
      if (headingEls[currentActiveIndex]) {
        setActiveSlug(headingEls[currentActiveIndex].id);
      }

      // Auto-expand TOC when scroll reaches the 7th heading (index 6, 0-indexed)
      if (currentActiveIndex >= 6) {
        setIsExpanded(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  const handleScrollTo = (slug) => {
    const el = document.getElementById(slug);
    if (el) {
      const yOffset = -100;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (headings.length === 0) return null;

  const visibleHeadings = isExpanded || headings.length <= 7 
    ? headings 
    : headings.slice(0, 7);

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderLeft: '4px solid var(--primary-red)',
      borderRadius: '6px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      fontFamily: 'Inter, sans-serif'
    }}>
      <strong style={{ 
        display: 'block', 
        fontSize: '12px', 
        textTransform: 'uppercase', 
        letterSpacing: '0.08em', 
        color: '#111827', 
        marginBottom: '14px',
        fontWeight: 700 
      }}>
        In This Article
      </strong>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {visibleHeadings.map((h, idx) => {
          const isActive = activeSlug === h.slug;
          const displayTitle = formatHeadingText(h.text);

          return (
            <li 
              key={idx} 
              style={{ 
                paddingLeft: h.level === 'h3' ? '12px' : '0px',
                fontSize: '13px',
                lineHeight: 1.4
              }}
            >
              <a 
                href={`#${h.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleScrollTo(h.slug);
                }}
                style={{ 
                  color: isActive ? 'var(--primary-red)' : '#4B5563', 
                  textDecoration: 'none',
                  transition: 'color 150ms ease',
                  fontWeight: isActive ? 700 : (h.level === 'h2' ? 600 : 400),
                  display: 'inline-block'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.target.style.color = 'var(--primary-red)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.target.style.color = '#4B5563';
                }}
              >
                {displayTitle}
              </a>
            </li>
          );
        })}
      </ul>

      {headings.length > 7 && !isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          style={{
            marginTop: '14px',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--primary-red)',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 600,
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          + {headings.length - 7} more headings
        </button>
      )}
    </div>
  );
}

