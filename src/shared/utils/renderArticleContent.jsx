import React from 'react';

export function parseInlineMarkdown(text) {
  if (!text) return '';
  const parts = [];
  const regex = /(\*\*.*?\*\*|\*.*?\*|\[.*?\]\(.*?\)|https?:\/\/[^\s]+)/g;
  let lastIndex = 0;
  let match;
  let keyIdx = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(<strong key={keyIdx++} style={{ fontWeight: 700, color: '#111827' }}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(<em key={keyIdx++}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith('[') && token.includes('](') && token.endsWith(')')) {
      const linkText = token.substring(1, token.indexOf(']('));
      const url = token.substring(token.indexOf('](') + 2, token.length - 1);
      parts.push(
        <a key={keyIdx++} href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-red)', textDecoration: 'underline', fontWeight: 500 }}>
          {linkText}
        </a>
      );
    } else if (token.startsWith('http://') || token.startsWith('https://')) {
      parts.push(
        <a key={keyIdx++} href={token} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-red)', textDecoration: 'underline', fontWeight: 500 }}>
          {token}
        </a>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}

export function renderHtmlContent(htmlString) {
  if (!htmlString) return null;
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');

  function domNodeToReact(node, key) {
    if (node.nodeType === Node.TEXT_NODE) {
      return parseInlineMarkdown(node.textContent);
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return null;

    const tagName = node.tagName.toLowerCase();
    const children = Array.from(node.childNodes).map((child, idx) => domNodeToReact(child, `${key}-${idx}`));

    // Heading H1, H2
    if (tagName === 'h1' || tagName === 'h2') {
      const text = node.textContent.trim().replace(/\*\*/g, '').replace(/\*/g, '');
      const slug = node.id || text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      return (
        <h2
          key={key}
          id={slug}
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: '26px',
            marginTop: '36px',
            marginBottom: '16px',
            color: '#111827',
            fontWeight: 700,
            borderBottom: '1px solid #E5E7EB',
            paddingBottom: '8px'
          }}
        >
          {children}
        </h2>
      );
    }

    // Heading H3, H4, H5, H6
    if (tagName === 'h3' || tagName === 'h4' || tagName === 'h5' || tagName === 'h6') {
      const text = node.textContent.trim().replace(/\*\*/g, '').replace(/\*/g, '');
      const slug = node.id || text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      return (
        <h3
          key={key}
          id={slug}
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: '22px',
            marginTop: '28px',
            marginBottom: '12px',
            color: '#111827',
            fontWeight: 700
          }}
        >
          {children}
        </h3>
      );
    }

    // Paragraph
    if (tagName === 'p') {
      const text = node.textContent.trim();
      if (text.startsWith('Source:') || text.startsWith('Quelle:')) {
        const sourceText = text.replace(/^(Source:|Quelle:)\s*/i, '');
        return (
          <div
            key={key}
            style={{
              backgroundColor: '#F9FAFB',
              borderLeft: '4px solid var(--primary-red)',
              padding: '16px 20px',
              marginTop: '32px',
              marginBottom: '24px',
              borderRadius: '0 6px 6px 0',
              fontSize: '13.5px',
              color: '#4B5563',
              lineHeight: 1.6,
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}
          >
            <strong style={{ color: '#111827', display: 'inline-block', marginRight: '6px' }}>Source:</strong>
            {parseInlineMarkdown(sourceText)}
          </div>
        );
      }
      return (
        <p key={key} style={{ marginBottom: '20px', fontSize: '16px', lineHeight: 1.8, color: '#1F2937' }}>
          {children}
        </p>
      );
    }

    // Lists
    if (tagName === 'ul') {
      return (
        <ul
          key={key}
          style={{
            margin: '16px 0 24px',
            paddingLeft: '24px',
            listStyleType: 'disc',
            color: '#374151',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          {children}
        </ul>
      );
    }
    if (tagName === 'ol') {
      return (
        <ol
          key={key}
          style={{
            margin: '16px 0 24px',
            paddingLeft: '24px',
            listStyleType: 'decimal',
            color: '#374151',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          {children}
        </ol>
      );
    }
    if (tagName === 'li') {
      return (
        <li key={key} style={{ fontSize: '16px', lineHeight: 1.7, color: '#374151' }}>
          {children}
        </li>
      );
    }

    // Text formatting
    if (tagName === 'strong' || tagName === 'b') {
      return (
        <strong key={key} style={{ fontWeight: 700, color: '#111827' }}>
          {children}
        </strong>
      );
    }
    if (tagName === 'em' || tagName === 'i') {
      return <em key={key}>{children}</em>;
    }
    if (tagName === 'a') {
      return (
        <a
          key={key}
          href={node.getAttribute('href') || '#'}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--primary-red)', textDecoration: 'underline', fontWeight: 500 }}
        >
          {children}
        </a>
      );
    }
    if (tagName === 'hr') {
      return <hr key={key} style={{ border: 'none', borderTop: '1px solid var(--light-border)', margin: '32px 0' }} />;
    }
    if (tagName === 'br') {
      return <br key={key} />;
    }
    if (tagName === 'blockquote') {
      return (
        <blockquote
          key={key}
          style={{
            borderLeft: '4px solid var(--primary-red)',
            padding: '12px 20px',
            margin: '24px 0',
            backgroundColor: '#F9FAFB',
            fontStyle: 'italic',
            color: '#374151',
            fontSize: '16.5px',
            lineHeight: 1.7,
            borderRadius: '0 6px 6px 0'
          }}
        >
          {children}
        </blockquote>
      );
    }

    return <div key={key}>{children}</div>;
  }

  return Array.from(doc.body.childNodes).map((child, idx) => domNodeToReact(child, `html-node-${idx}`));
}

export function renderArticleMarkdown(contentBody) {
  if (!contentBody) return null;

  // If content contains standard HTML block tags, render with rich HTML element parser
  if (/<(p|h[1-6]|ul|ol|div|blockquote|table|section)[^>]*>/i.test(contentBody)) {
    return renderHtmlContent(contentBody);
  }

  const blocks = contentBody.split(/\n\n+/);

  return blocks.map((block, index) => {
    const trimmed = block.trim();

    // 1. Horizontal Rule
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      return <hr key={index} style={{ border: 'none', borderTop: '1px solid var(--light-border)', margin: '32px 0' }} />;
    }

    // 2. Source citation box
    if (trimmed.startsWith('Source:') || trimmed.startsWith('Quelle:')) {
      const sourceText = trimmed.replace(/^(Source:|Quelle:)\s*/i, '');
      return (
        <div 
          key={index}
          style={{
            backgroundColor: '#F9FAFB',
            borderLeft: '4px solid var(--primary-red)',
            padding: '16px 20px',
            marginTop: '32px',
            marginBottom: '24px',
            borderRadius: '0 6px 6px 0',
            fontSize: '13.5px',
            color: '#4B5563',
            lineHeight: 1.6,
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
          }}
        >
          <strong style={{ color: '#111827', display: 'inline-block', marginRight: '6px' }}>Source:</strong>
          {parseInlineMarkdown(sourceText)}
        </div>
      );
    }

    // 3. Explicit H2 heading (## )
    if (trimmed.startsWith('## ')) {
      const text = trimmed.replace(/^##\s+/, '').replace(/\*\*/g, '').replace(/\*/g, '').trim();
      const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      return (
        <h2 
          key={index} 
          id={slug} 
          style={{ 
            fontFamily: '"Playfair Display", Georgia, serif', 
            fontSize: '26px', 
            marginTop: '36px', 
            marginBottom: '16px', 
            color: '#111827', 
            fontWeight: 700,
            borderBottom: '1px solid #E5E7EB',
            paddingBottom: '8px'
          }}
        >
          {parseInlineMarkdown(text)}
        </h2>
      );
    }

    // 4. Explicit H3 heading (### )
    if (trimmed.startsWith('### ')) {
      const text = trimmed.replace(/^###\s+/, '').replace(/\*\*/g, '').replace(/\*/g, '').trim();
      const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      return (
        <h3 
          key={index} 
          id={slug} 
          style={{ 
            fontFamily: '"Playfair Display", Georgia, serif', 
            fontSize: '22px', 
            marginTop: '28px', 
            marginBottom: '12px', 
            color: '#111827', 
            fontWeight: 700 
          }}
        >
          {parseInlineMarkdown(text)}
        </h3>
      );
    }

    // 5. Implicit Subheading detection (short single line without punctuation)
    const lines = trimmed.split('\n');
    const cleanForCheck = trimmed.replace(/[*_#`~]/g, '').trim();
    const isPunctuationEnding = cleanForCheck.endsWith('.') || cleanForCheck.endsWith(':') || cleanForCheck.endsWith('?') || cleanForCheck.endsWith('!') || cleanForCheck.endsWith(';');

    if (
      lines.length === 1 &&
      trimmed.length > 3 &&
      trimmed.length < 75 &&
      !isPunctuationEnding &&
      !trimmed.startsWith('-') &&
      !trimmed.startsWith('*') &&
      !trimmed.startsWith('http')
    ) {
      const text = cleanForCheck;
      const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      return (
        <h3 
          key={index} 
          id={slug} 
          style={{ 
            fontFamily: '"Playfair Display", Georgia, serif', 
            fontSize: '22px', 
            marginTop: '28px', 
            marginBottom: '12px', 
            color: '#111827', 
            fontWeight: 700 
          }}
        >
          {parseInlineMarkdown(trimmed)}
        </h3>
      );
    }

    // 6. Bullet List block (handles lines starting with - or *, plus multiline continuation)
    if (lines.some(l => l.trim().startsWith('- ') || l.trim().startsWith('* ')) && lines[0].trim().match(/^[-*]\s+/)) {
      const items = [];
      let currentItem = '';
      lines.forEach(line => {
        const tr = line.trim();
        if (tr.startsWith('- ') || tr.startsWith('* ')) {
          if (currentItem) items.push(currentItem);
          currentItem = tr.replace(/^[-*]\s+/, '');
        } else if (currentItem) {
          currentItem += ' ' + tr;
        }
      });
      if (currentItem) items.push(currentItem);

      return (
        <ul 
          key={index} 
          style={{ 
            margin: '16px 0 24px', 
            paddingLeft: '24px', 
            listStyleType: 'disc', 
            color: '#374151',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          {items.map((item, lIdx) => (
            <li key={lIdx} style={{ fontSize: '16px', lineHeight: 1.7, color: '#374151' }}>
              {parseInlineMarkdown(item)}
            </li>
          ))}
        </ul>
      );
    }

    // 7. Mixed Text + Bullet List Paragraph
    const firstLineIsText = !lines[0].trim().startsWith('- ') && !lines[0].trim().startsWith('* ');
    const hasBulletsBelow = lines.slice(1).some(line => line.trim().startsWith('- ') || line.trim().startsWith('* '));

    if (firstLineIsText && hasBulletsBelow) {
      const textLines = [];
      const bulletLines = [];
      lines.forEach(line => {
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          bulletLines.push(line.trim().replace(/^[-*]\s+/, ''));
        } else {
          textLines.push(line);
        }
      });

      return (
        <div key={index} style={{ marginBottom: '24px' }}>
          {textLines.length > 0 && (
            <p style={{ marginBottom: '12px', fontSize: '16px', lineHeight: 1.8, color: '#1F2937' }}>
              {parseInlineMarkdown(textLines.join(' '))}
            </p>
          )}
          {bulletLines.length > 0 && (
            <ul 
              style={{ 
                margin: '12px 0 16px', 
                paddingLeft: '24px', 
                listStyleType: 'disc', 
                color: '#374151',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              {bulletLines.map((bItem, bIdx) => (
                <li key={bIdx} style={{ fontSize: '16px', lineHeight: 1.7, color: '#374151' }}>
                  {parseInlineMarkdown(bItem)}
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }

    // Standard Paragraph
    return (
      <p key={index} style={{ marginBottom: '20px', fontSize: '16px', lineHeight: 1.8, color: '#1F2937' }}>
        {parseInlineMarkdown(trimmed)}
      </p>
    );
  });
}
