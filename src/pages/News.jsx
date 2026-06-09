import React, { useState, useEffect } from 'react';
import AdSlot from '../components/AdSlot';
import { Calendar, User, Clock, ArrowRight, Share2, MessageSquare } from 'lucide-react';

export default function News({ selectedArticleId, selectArticle, navigate }) {
  const [articles, setArticles] = useState([]);
  const [activeArticle, setActiveArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [relatedCompanies, setRelatedCompanies] = useState([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        if (selectedArticleId) {
          const res = await fetch(`/api/news/${selectedArticleId}`);
          if (res.ok) {
            const data = await res.json();
            setActiveArticle(data.article);
            setRelatedArticles(data.related);

            // Fetch related companies based on tags or category
            const compRes = await fetch('/api/companies');
            if (compRes.ok) {
              const compList = await compRes.json();
              const matched = compList.filter(
                c => data.article.tags?.some(t => c.name.includes(t)) || c.industry === data.article.category
              ).slice(0, 3);
              setRelatedCompanies(matched);
            }
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

  if (loading) {
    return (
      <div className="container" style={{ padding: '64px 0', textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '2px solid var(--light-border)', borderTopColor: 'var(--primary-red)', borderRadius: '50%', animation: 'spin 1s infinite linear', margin: '0 auto 16px' }} />
        <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '18px', color: 'var(--text-charcoal)' }}>Medienarchiv wird geladen...</p>
      </div>
    );
  }

  // --- Mock "Meist gelesen" (Most Read) sidebar data for news article ---
  const mockMostRead = [
    { title: 'Grossbanken verschärfen die Richtlinien für Immobilienkredite', views: '1.2k views' },
    { title: 'SGS meldet Umsatzsteigerung von 4.5% im ersten Quartal', views: '980 views' },
    { title: 'Wie Fintechs den Schweizer Vermögensverwaltungsmarkt aufmischen', views: '850 views' },
    { title: 'Bedeutende Investitionen in grüne Energie im Kanton Aargau', views: '760 views' },
    { title: 'Die wichtigsten Startup-Exits der Westschweiz im Rückblick', views: '620 views' }
  ];

  // --- 1. SINGLE ARTICLE VIEW ---
  if (selectedArticleId && activeArticle) {
    const paragraphs = activeArticle.content_body?.split('\n\n') || [];
    
    return (
      <div style={{ backgroundColor: 'var(--bg-ivory)', minHeight: 'calc(100vh - 120px)', padding: '32px 0 64px' }}>
        <div className="container">
          
          {/* Breadcrumb + Category */}
          <div style={{ fontSize: '12px', color: 'var(--text-charcoal)', marginBottom: '20px', display: 'flex', gap: '8px' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => selectArticle(null)}>News</span>
            <span>/</span>
            <span style={{ cursor: 'pointer' }} onClick={() => selectArticle(null)}>{activeArticle.category}</span>
            <span>/</span>
            <span style={{ fontWeight: 600, color: 'var(--text-ink)' }}>Artikel</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '48px', alignItems: 'flex-start' }} className="news-layout-grid">
            
            {/* Left Side: Centered 720px Editorial Column */}
            <div style={{ maxWidth: '720px', margin: '0 auto', width: '100%' }}>
              <span className="badge badge-industry" style={{ marginBottom: '16px' }}>{activeArticle.category}</span>
              
              <h1 
                style={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontSize: '44px',
                  lineHeight: 1.2,
                  color: 'var(--text-ink)',
                  marginBottom: '16px',
                  fontWeight: 700
                }}
              >
                {activeArticle.title}
              </h1>
              
              <p 
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '18px',
                  lineHeight: 1.5,
                  color: 'var(--text-charcoal)',
                  marginBottom: '24px'
                }}
              >
                {activeArticle.subtitle}
              </p>

              {/* Byline */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  borderTop: '0.5px solid var(--light-border)',
                  borderBottom: '0.5px solid var(--light-border)',
                  padding: '16px 0',
                  fontSize: '13px',
                  color: 'var(--text-charcoal)',
                  marginBottom: '24px'
                }}
              >
                <img 
                  src={activeArticle.author_avatar} 
                  alt={activeArticle.author_name} 
                  style={{ width: '40px', height: '40px', borderRadius: '50%', border: '0.5px solid var(--primary-gold)' }} 
                />
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-ink)', display: 'block' }}>{activeArticle.author_name}</span>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                    <span>{activeArticle.date_published}</span>
                    <span>·</span>
                    <span>{activeArticle.read_time_mins} Min. Lesezeit</span>
                  </div>
                </div>
              </div>

              {activeArticle.image_url && (
                <div style={{ width: '100%', height: '380px', overflow: 'hidden', borderRadius: '6px', marginBottom: '32px' }}>
                  <img 
                    src={activeArticle.image_url} 
                    alt={activeArticle.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>
              )}

              {/* Zone A Leaderboard */}
              <AdSlot position="A" />

              {/* Body Text */}
              <div className="editorial-text">
                {paragraphs[0] && <p style={{ marginBottom: '24px' }}>{paragraphs[0]}</p>}
                {paragraphs[1] && <p style={{ marginBottom: '24px' }}>{paragraphs[1]}</p>}
                
                {/* Zone B Float Ad after paragraph 2 */}
                <div style={{ overflow: 'hidden', margin: '24px 0' }}>
                  {paragraphs[2] && <p style={{ marginBottom: '24px' }}>{paragraphs[2]}</p>}
                </div>

                {paragraphs[3] && <p style={{ marginBottom: '24px' }}>{paragraphs[3]}</p>}

                {/* Pull Quote */}
                {activeArticle.pull_quote && (
                  <blockquote className="editorial-pullquote">
                    „{activeArticle.pull_quote}“
                  </blockquote>
                )}

                {paragraphs[4] && <p style={{ marginBottom: '24px' }}>{paragraphs[4]}</p>}

                {/* Zone E Native Ad */}
                <AdSlot position="E" />

                {paragraphs.slice(5).map((para, pIdx) => (
                  <p key={pIdx} style={{ marginBottom: '24px' }}>{para}</p>
                ))}
              </div>

              {/* Footer Tags */}
              <div 
                style={{ 
                  borderTop: '0.5px solid var(--light-border)', 
                  paddingTop: '24px', 
                  marginBottom: '48px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-charcoal)', letterSpacing: '0.05em' }}>THEMEN:</span>
                {activeArticle.tags?.map(tag => (
                  <span 
                    key={tag} 
                    className="badge badge-canton"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/unternehmen?search=${tag}`)}
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Related Articles 3-Column */}
              <div style={{ borderTop: '1px solid var(--primary-gold)', paddingTop: '32px' }}>
                <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '22px', color: 'var(--text-ink)', marginBottom: '24px', fontWeight: 700 }}>
                  Ähnliche Artikel
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }} className="news-related-grid">
                  {relatedArticles.map(art => (
                    <div 
                      key={art.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '0.5px solid var(--light-border)',
                        padding: '16px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        transition: 'border-color 0.2s'
                      }}
                      onClick={() => selectArticle(art.id)}
                      className="related-news-card"
                    >
                      {art.image_url && (
                        <div style={{ width: '100%', height: '110px', overflow: 'hidden', borderRadius: '4px', marginBottom: '12px' }}>
                          <img 
                            src={art.image_url} 
                            alt={art.title} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                            className="card-img"
                          />
                        </div>
                      )}
                      <span className="badge badge-industry" style={{ alignSelf: 'flex-start', marginBottom: '12px', fontSize: '9px' }}>{art.category}</span>
                      <h4 style={{ fontFamily: '"Playfair Display", serif', fontSize: '14px', color: 'var(--text-ink)', marginBottom: '16px', lineHeight: 1.4, flex: 1, fontWeight: 700 }}>
                        {art.title}
                      </h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-charcoal)', fontFamily: 'var(--font-mono)' }}>
                        <span>{art.date_published}</span>
                        <span>{art.read_time_mins} Min</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Side: Sticky Right Rail (300px) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="news-right-col">
              
              {/* "Meist gelesen" Sidebar List */}
              <div style={{ backgroundColor: '#FFFFFF', border: '0.5px solid var(--light-border)', padding: '24px', borderRadius: '6px' }}>
                <span className="caps-label" style={{ fontSize: '11px', display: 'block', marginBottom: '16px' }}>
                  Meistgelesen
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {mockMostRead.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '20px', fontFamily: '"Playfair Display", serif', color: 'var(--primary-red)', fontWeight: 700, lineHeight: 1 }}>{idx + 1}</span>
                      <div>
                        <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-ink)', lineHeight: 1.4, cursor: 'pointer' }} onClick={() => alert('Wird geladen...')}>
                          {item.title}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-charcoal)', fontFamily: 'var(--font-mono)' }}>{item.views}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Zone D Ad Slot 300x600 */}
              <AdSlot position="D" />

              {/* Related Companies Mini Cards */}
              {relatedCompanies.length > 0 && (
                <div style={{ backgroundColor: '#FFFFFF', border: '0.5px solid var(--light-border)', padding: '20px', borderRadius: '6px' }}>
                  <span className="caps-label" style={{ fontSize: '11px', display: 'block', marginBottom: '16px' }}>
                    Erwähnte Unternehmen
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {relatedCompanies.map(c => (
                      <div 
                        key={c.id}
                        onClick={() => navigate(`/unternehmen/${c.id}`)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          cursor: 'pointer',
                          padding: '8px',
                          border: '0.5px solid transparent'
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--light-border)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                      >
                        <div style={{ width: '32px', height: '32px', backgroundColor: c.logo_bg || 'var(--surface-warm)', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 'bold', fontSize: '12px', flexShrink: 0 }}>
                          {c.name.charAt(0)}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-ink)', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{c.name}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-charcoal)' }}>Kanton {c.canton}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dark Newsletter CTA */}
              <div 
                style={{
                  backgroundColor: '#1A1A1A',
                  color: '#FFFFFF',
                  padding: '24px',
                  borderRadius: '6px',
                  textAlign: 'center'
                }}
              >
                <h4 style={{ fontFamily: '"Playfair Display", serif', fontSize: '18px', color: '#FFFDF7', marginBottom: '8px', fontWeight: 700 }}>
                  Wirtschafts-Briefing
                </h4>
                <p style={{ fontSize: '12px', color: '#888888', lineHeight: 1.5, marginBottom: '16px' }}>
                  Abonnieren Sie unseren Newsletter für die aktuellsten Unternehmensberichte.
                </p>
                <input 
                  type="email" 
                  placeholder="Ihre E-Mail-Adresse" 
                  style={{ 
                    width: '100%', 
                    padding: '8px 12px', 
                    border: '0.5px solid #2A2A2A', 
                    backgroundColor: '#0A0A0A', 
                    color: '#FFFFFF',
                    fontSize: '13px',
                    marginBottom: '8px',
                    boxSizing: 'border-box'
                  }} 
                />
                <button className="btn btn-gold-fill" style={{ fontSize: '12px', padding: '8px', minHeight: '36px', width: '100%' }}>
                  Abonnieren
                </button>
              </div>

            </div>

          </div>

        </div>
      </div>
    );
  }

  // --- 2. NEWS FEED INDEX VIEW ---
  return (
    <div style={{ backgroundColor: 'var(--bg-ivory)', minHeight: 'calc(100vh - 120px)', padding: '48px 0 64px' }}>
      <div className="container">
        
        {/* Header Title */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="caps-label" style={{ display: 'block', marginBottom: '8px' }}>INTELLIGENCE & ANALYSIS</span>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '42px', fontWeight: 700, color: 'var(--text-ink)', margin: 0 }}>
            Schweizer Wirtschaftsnachrichten
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: 'var(--text-charcoal)', marginTop: '8px' }}>
            Unabhängiger, verifizierter B2B-Journalismus zu Strukturen, Transaktionen und Strategien.
          </p>
        </div>

        {/* Zone A Leaderboard */}
        <AdSlot position="A" />

        {/* Articles List Grid */}
        {articles.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-charcoal)' }}>Keine Artikel im Archiv vorhanden.</p>
        ) : (
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
              gap: '32px',
              marginTop: '32px'
            }}
          >
            {articles.map((art) => (
              <div 
                key={art.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '0.5px solid var(--light-border)',
                  borderRadius: '6px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'border-color 0.2s'
                }}
                onClick={() => selectArticle(art.id)}
                className="feed-article-card"
              >
                {art.image_url && (
                  <div style={{ width: '100%', height: '180px', overflow: 'hidden', borderRadius: '4px', marginBottom: '16px' }}>
                    <img 
                      src={art.image_url} 
                      alt={art.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                      className="card-img"
                    />
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="badge badge-industry">{art.category}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-charcoal)', fontFamily: 'var(--font-mono)' }}>{art.date_published}</span>
                </div>
                
                <h3 
                  style={{ 
                    fontFamily: '"Playfair Display", serif', 
                    fontSize: '19px', 
                    color: 'var(--text-ink)', 
                    marginBottom: '12px',
                    fontWeight: 700,
                    lineHeight: 1.3
                  }}
                >
                  {art.title}
                </h3>
                
                <p 
                  style={{ 
                    fontFamily: 'Inter, sans-serif', 
                    fontSize: '13px', 
                    color: 'var(--text-charcoal)', 
                    lineHeight: 1.5,
                    marginBottom: '20px',
                    flex: 1
                  }}
                >
                  {art.subtitle}
                </p>

                <div 
                  style={{ 
                    marginTop: 'auto',
                    borderTop: '0.5px solid var(--light-border)',
                    paddingTop: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '12px',
                    color: 'var(--primary-gold)',
                    fontWeight: 600
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-ink)' }}>
                    <User size={12} style={{ color: 'var(--primary-gold)' }} />
                    {art.author_name}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Artikel lesen <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
      
      <style>{`
        .feed-article-card:hover {
          border-color: var(--primary-gold) !important;
        }
        .feed-article-card:hover .card-img {
          transform: scale(1.05);
        }
        .related-news-card:hover {
          border-color: var(--primary-gold) !important;
        }
        .related-news-card:hover .card-img {
          transform: scale(1.05);
        }
        @media (max-width: 768px) {
          .news-layout-grid {
            grid-template-columns: 1fr !important;
          }
          .news-right-col {
            width: 100% !important;
          }
          .news-related-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
