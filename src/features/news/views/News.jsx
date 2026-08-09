import { useState, useEffect } from 'react';
import SidebarLayout from '../../../shared/components/SidebarLayout';
import Breadcrumbs from '../../../shared/components/Breadcrumbs';
import TableOfContents from '../../../shared/components/TableOfContents';
import AdSlot from '../../../shared/components/AdSlot';
import { Calendar, Clock } from 'lucide-react';
import SeoHead from '../../../shared/components/SeoHead';

function parseInlineMarkdown(text) {
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

function renderArticleMarkdown(contentBody) {
  if (!contentBody) return null;

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
      const text = trimmed.replace(/^##\s+/, '');
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
      const text = trimmed.replace(/^###\s+/, '');
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
            color: '#191919', 
            fontWeight: 700 
          }}
        >
          {parseInlineMarkdown(text)}
        </h3>
      );
    }

    // 5. Implicit Subheading detection (short single line without period)
    const lines = trimmed.split('\n');
    if (
      lines.length === 1 &&
      trimmed.length > 3 &&
      trimmed.length < 75 &&
      !trimmed.endsWith('.') &&
      !trimmed.startsWith('-') &&
      !trimmed.startsWith('*') &&
      !trimmed.startsWith('http')
    ) {
      const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
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

    // 6. Pure Bulleted List block
    const isListBlock = lines.every(line => line.trim().startsWith('- ') || line.trim().startsWith('* '));
    if (isListBlock) {
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
            gap: '8px'
          }}
        >
          {lines.map((line, lIdx) => {
            const itemText = line.trim().replace(/^[-*]\s+/, '');
            return (
              <li key={lIdx} style={{ fontSize: '16px', lineHeight: 1.7, color: '#374151' }}>
                {parseInlineMarkdown(itemText)}
              </li>
            );
          })}
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

export default function News({ selectedArticleId, selectArticle, navigate }) {
  const [articles, setArticles] = useState([]);
  const [activeArticle, setActiveArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  // Fetch News data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        if (selectedArticleId) {
          const res = await fetch(`/api/news/${selectedArticleId}`);
          if (res.ok) {
            const data = await res.json();
            setActiveArticle(data.article);
          }
        } else {
          const res = await fetch('/api/news');
          if (res.ok) {
            const data = await res.json();
            setArticles(data);
            setActiveArticle(null);
          }
        }
      } catch (e) {
        console.error('Error fetching news:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedArticleId]);

  // Handle Dynamic Meta & Schema Injection on Active Article Change
  useEffect(() => {
    if (activeArticle) {
      document.title = activeArticle.meta_title || `${activeArticle.title} — privatesector.ch`;
      
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', activeArticle.meta_description || activeArticle.subtitle || '');
      }

      // Inject Schema Markup if present
      const existingSchema = document.getElementById('seo-jsonld-schema');
      if (existingSchema) existingSchema.remove();

      if (activeArticle.schema_markup) {
        const script = document.createElement('script');
        script.id = 'seo-jsonld-schema';
        script.type = 'application/ld+json';
        script.innerHTML = activeArticle.schema_markup;
        document.head.appendChild(script);
      }
    } else {
      document.title = 'News & Market Analysis — privatesector.ch';
    }
  }, [activeArticle]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '64px 0', textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '2px solid var(--light-border)', borderTopColor: 'var(--primary-red)', borderRadius: '50%', animation: 'spin 1s infinite linear', margin: '0 auto 16px' }} />
        <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '18px', color: 'var(--text-charcoal)' }}>Medienarchiv wird geladen...</p>
      </div>
    );
  }

  // Categories & Tags Extractor
  const uniqueCategories = [...new Set(articles.map(art => art.category))].map(cat => ({
    name: cat,
    count: articles.filter(art => art.category === cat).length
  }));

  const uniqueTags = [...new Set(articles.flatMap(art => {
    try {
      return JSON.parse(art.tags || '[]');
    } catch {
      return [];
    }
  }))];

  // Filtering Logic
  const filteredArticles = articles.filter(art => {
    const matchesSearch = searchQuery === '' || 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      art.content_body.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === '' || art.category === selectedCategory;
    
    let articleTags;
    try {
      articleTags = JSON.parse(art.tags || '[]');
    } catch {
      articleTags = [];
    }
    const matchesTag = selectedTag === '' || articleTags.includes(selectedTag);

    return matchesSearch && matchesCategory && matchesTag;
  });

  // --- 1. SINGLE ARTICLE VIEW ---
  if (selectedArticleId && activeArticle) {
    // Parse tag array
    let tagsList;
    try {
      tagsList = JSON.parse(activeArticle.tags || '[]');
    } catch {
      tagsList = [];
    }

    return (
      <div style={{ backgroundColor: 'var(--bg-ivory)', minHeight: 'calc(100vh - 120px)', padding: '32px 0 64px' }}>
        <div className="container">
          <SeoHead
            title={activeArticle.meta_title || activeArticle.title}
            description={activeArticle.meta_description || activeArticle.subtitle}
            image={activeArticle.image_url}
            type="news"
            schemaMarkup={activeArticle.schema_markup}
            entityData={activeArticle}
          />
          
          {/* Breadcrumbs */}
          <Breadcrumbs 
            paths={[
              { name: 'News', url: '/news' },
              { name: activeArticle.category },
              { name: activeArticle.title }
            ]} 
            navigate={(path) => {
              if (path === '/news') selectArticle(null);
              else navigate(path);
            }} 
          />

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 320px',
            gap: '40px',
            alignItems: 'start'
          }} className="sidebar-grid-layout">
            
            {/* Left Column: Article Body */}
            <article style={{ maxWidth: '720px', width: '100%' }}>
              <span className="badge badge-industry" style={{ marginBottom: '16px', backgroundColor: 'var(--primary-red)', color: '#FFF', padding: '4px 8px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {activeArticle.category}
              </span>
              
              <h1 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '38px', lineHeight: 1.2, color: 'var(--text-ink)', marginBottom: '16px', fontWeight: 700 }}>
                {activeArticle.title}
              </h1>
              
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '18px', lineHeight: 1.5, color: 'var(--text-charcoal)', marginBottom: '24px' }}>
                {activeArticle.subtitle}
              </p>

              {/* Byline */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', padding: '16px 0', borderTop: '0.5px solid var(--light-border)', borderBottom: '0.5px solid var(--light-border)', marginBottom: '32px', fontSize: '13px', color: '#6B7280' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src={activeArticle.author_avatar} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                  <strong>{activeArticle.author_name}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} />
                  <span>{activeArticle.date_published}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} />
                  <span>{activeArticle.read_time_mins} min read</span>
                </div>
              </div>

              {/* Featured Image */}
              {activeArticle.image_url && (
                <div style={{ width: '100%', maxHeight: '420px', overflow: 'hidden', borderRadius: '6px', marginBottom: '32px' }}>
                  <img src={activeArticle.image_url} alt={activeArticle.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              {/* Editorial Body Content */}
              <div className="editorial-content-body" style={{ fontSize: '16px', lineHeight: 1.8, color: 'var(--text-ink)' }}>
                {renderArticleMarkdown(activeArticle.content_body)}
              </div>

              {/* Tag Badges Cloud */}
              {tagsList.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '40px', borderTop: '0.5px solid var(--light-border)', paddingTop: '24px' }}>
                  {tagsList.map((tag, idx) => (
                    <span key={idx} style={{ backgroundColor: '#F3F4F6', color: '#4B5563', padding: '4px 10px', borderRadius: '16px', fontSize: '12px', fontWeight: 500 }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </article>

            {/* Right Column: Sticky Table of Contents & Sidebar widgets */}
            <aside className="news-sidebar-col" style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'sticky', top: '120px' }}>
              <TableOfContents contentHtml={activeArticle.content_body} />
              <AdSlot position="D" />
            </aside>

          </div>
        </div>
      </div>
    );
  }

  // --- 2. MULTI-ARTICLE LIST VIEW ---
  return (
    <div style={{ backgroundColor: '#F9FAFB', minHeight: 'calc(100vh - 120px)', padding: '48px 0 80px' }}>
      <div className="container">
        <SeoHead
          title="News & Market Analysis"
          description="Swiss B2B market intelligence, editorial reports, trade updates, and corporate analysis."
          type="website"
        />
        
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '36px', color: 'var(--text-ink)', margin: '0 0 8px 0', fontWeight: 700 }}>
            Market News & Analysis
          </h1>
          <p style={{ margin: 0, color: '#6B7280', fontSize: '15px' }}>
            Verified financial reports, corporate actions, and industrial insights.
          </p>
        </div>

        <SidebarLayout
          entityType="Articles"
          categories={uniqueCategories}
          tags={uniqueTags}
          selectedCategory={selectedCategory}
          selectedTag={selectedTag}
          recentItems={articles}
          onSearch={(val) => setSearchQuery(val)}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          onSelectTag={(tag) => setSelectedTag(tag)}
          onItemClick={(item) => selectArticle(item.slug || item.id)}
        >
          {/* Main Grid content list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {filteredArticles.length === 0 ? (
              <div style={{ padding: '48px', backgroundColor: '#FFF', textAlign: 'center', borderRadius: '6px', border: '1px solid #E5E7EB' }}>
                <span style={{ fontSize: '14px', color: '#6B7280' }}>No articles match your selection.</span>
              </div>
            ) : (
              filteredArticles.map(art => (
                <div 
                  key={art.id}
                  onClick={() => selectArticle(art.slug || art.id)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px',
                    padding: '24px',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: '24px',
                    transition: 'transform 150ms ease, box-shadow 150ms ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {art.image_url && (
                    <img 
                      src={art.image_url} 
                      alt="" 
                      style={{ width: '200px', height: '140px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} 
                    />
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
                    <div>
                      <span style={{ color: 'var(--primary-red)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                        {art.category}
                      </span>
                      <h3 style={{ margin: '0 0 8px 0', fontFamily: '"Playfair Display", serif', fontSize: '20px', color: '#111827', fontWeight: 700 }}>
                        {art.title}
                      </h3>
                      <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#4B5563', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {art.subtitle}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: '#9CA3AF' }}>
                      <span>{art.date_published}</span>
                      <span>•</span>
                      <span>{art.read_time_mins} min read</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </SidebarLayout>

      </div>
    </div>
  );
}
