import React, { useState, useEffect } from 'react';
import KnowledgePanel from '../components/KnowledgePanel';
import AdSlot from '../components/AdSlot';
import { ArrowLeft, Mail, Building, Users } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import SeoHead from '../components/SeoHead';

export default function Profile({ companyId, onBack, navigate }) {
  const { t, isRtl } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [similarCompanies, setSimilarCompanies] = useState([]);

  useEffect(() => {
    async function fetchCompanyDetails() {
      setLoading(true);
      try {
        const res = await fetch(`/api/companies/${companyId}`);
        if (res.ok) {
          const detail = await res.json();
          setData(detail);

          // Fetch similar companies in the same industry
          const allRes = await fetch('/api/companies');
          if (allRes.ok) {
            const allList = await allRes.json();
            const filtered = allList
              .filter(c => c.id !== detail.id && c.industry === detail.industry)
              .slice(0, 3);
            setSimilarCompanies(filtered);
          }
        }
      } catch (e) {
        console.error('Error fetching company details:', e);
      } finally {
        setLoading(false);
      }
    }
    if (companyId) {
      fetchCompanyDetails();
    }
  }, [companyId]);

  const formatSwissNumber = (num) => {
    return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") : '0';
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '64px 0', textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '2px solid var(--light-border)', borderTopColor: 'var(--primary-gold)', borderRadius: '50%', animation: 'spin 1s infinite linear', margin: '0 auto 16px' }} />
        <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '18px', color: 'var(--text-charcoal)' }}>{t('Dossier wird geladen...', 'Dossier wird geladen...')}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container" style={{ padding: '64px 0', textAlign: 'center' }}>
        <p>{t('Fehler beim Laden des Unternehmensprofils. Bitte kehren Sie zum Verzeichnis zurück.', 'Fehler beim Laden des Unternehmensprofils. Bitte kehren Sie zum Verzeichnis zurück.')}</p>
        <button className="btn btn-gold-fill" onClick={onBack} style={{ marginTop: '16px' }}>{t('Zurück zum Verzeichnis', 'Zurück zum Verzeichnis')}</button>
      </div>
    );
  }

  // Mock executives for the "Personen" tab
  const mockExecutives = [
    { name: 'Dr. Beat Hintermann', role: t('Verwaltungsratspräsident / Chairman', 'Verwaltungsratspräsident / Chairman'), tenure: `${t('Seit', 'Seit')} 2021` },
    { name: data.name.includes('Nestlé') ? 'Laurent Freixe' : data.name.includes('Roche') ? 'Thomas Schinecker' : 'Jean-Frédéric Dufour', role: t('Delegierter des Verwaltungsrats / CEO', 'Delegierter des Verwaltungsrats / CEO'), tenure: `${t('Seit', 'Seit')} 2023` },
    { name: 'Anna Manz', role: t('Mitglied der Geschäftsleitung / CFO', 'Mitglied der Geschäftsleitung / CFO'), tenure: `${t('Seit', 'Seit')} 2022` }
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-ivory)', minHeight: 'calc(100vh - 120px)', paddingTop: '32px', paddingBottom: '64px' }}>
      <SeoHead
        title={data ? `${data.name} — Canton ${data.canton}` : 'Company Profile'}
        description={data?.description || data?.about_text}
        image={data?.logo_bg}
        type="business"
        schemaMarkup={data?.schema_markup}
        entityData={data || {}}
      />
      
      {/* Breadcrumbs */}
      <div className="container" style={{ marginBottom: '24px' }}>
        <button 
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary-gold)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: 'Inter, sans-serif'
          }}
        >
          <ArrowLeft size={16} />
          <span>{t('Zurück zum Verzeichnis', 'Zurück zum Verzeichnis')}</span>
        </button>
      </div>

      <div className="container">
        {/* 3-Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 280px', gap: '32px', alignItems: 'flex-start' }} className="profile-layout-grid">
          
          {/* Column 1: Left Knowledge Panel (320px sticky) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '88px' }} className="profile-left-col">
            <KnowledgePanel company={data} />
            <AdSlot position="C" />
          </div>

          {/* Column 2: Center Tabbed Content */}
          <div style={{ backgroundColor: '#FFFFFF', border: '0.5px solid var(--light-border)', padding: '32px', borderRadius: '6px' }} className="profile-center-col">
            
            {/* Tabs */}
            <div className="tab-list">
              <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>{t('Übersicht', 'Übersicht')}</button>
              <button className={`tab-btn ${activeTab === 'news' ? 'active' : ''}`} onClick={() => setActiveTab('news')}>{t('News', 'News')}</button>
              <button className={`tab-btn ${activeTab === 'statistics' ? 'active' : ''}`} onClick={() => setActiveTab('statistics')}>{t('Statistiken', 'Statistiken')}</button>
              <button className={`tab-btn ${activeTab === 'people' ? 'active' : ''}`} onClick={() => setActiveTab('people')}>{t('Personen', 'Personen')}</button>
            </div>

            {/* Tab: Overview */}
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontFamily: '"Playfair Display", serif', borderBottom: '0.5px solid var(--light-border)', paddingBottom: '8px', marginBottom: '16px', color: 'var(--text-ink)', fontWeight: 700 }}>
                    {t('Über', 'Über')} {t(data.name, data.name)}
                  </h2>
                  <p style={{ fontSize: '15px', color: 'var(--text-ink)', lineHeight: 1.8, fontFamily: 'Inter, sans-serif' }}>
                    {t(data.about_text, data.about_text)}
                  </p>
                </div>

                <div>
                  <h2 style={{ fontSize: '24px', fontFamily: '"Playfair Display", serif', borderBottom: '0.5px solid var(--light-border)', paddingBottom: '8px', marginBottom: '16px', color: 'var(--text-ink)', fontWeight: 700 }}>
                    {t('Unternehmensfakten', 'Unternehmensfakten')}
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.5px solid var(--light-border)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-charcoal)' }}>{t('Offizieller Firmenname', 'Offizieller Firmenname')}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-ink)' }}>{t(data.name, data.name)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.5px solid var(--light-border)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-charcoal)' }}>{t('Hauptsitz', 'Hauptsitz')}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-ink)' }}>{t('Kanton', 'Kanton')} {t(data.canton, data.canton)}, {t('Schweiz', 'Schweiz')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.5px solid var(--light-border)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-charcoal)' }}>{t('Gründungsjahr', 'Gründungsjahr')}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-ink)', fontFamily: 'var(--font-mono)' }}>{data.founded}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.5px solid var(--light-border)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-charcoal)' }}>{t('Mitarbeiter', 'Mitarbeiter')}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-ink)', fontFamily: 'var(--font-mono)' }}>{formatSwissNumber(data.employees)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-charcoal)' }}>{t('Umsatzklasse', 'Umsatzklasse')}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-ink)', fontFamily: 'var(--font-mono)' }}>{t(data.revenue_band, data.revenue_band)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: News */}
            {activeTab === 'news' && (
              <div>
                <h2 style={{ fontSize: '24px', fontFamily: '"Playfair Display", serif', borderBottom: '0.5px solid var(--light-border)', paddingBottom: '8px', marginBottom: '20px', color: 'var(--text-ink)', fontWeight: 700 }}>
                  {t('Berichte & Medienmitteilungen', 'Berichte & Medienmitteilungen')}
                </h2>
                
                {data.relatedNews?.length === 0 ? (
                  <p style={{ color: 'var(--text-charcoal)', fontStyle: 'italic' }}>{t('Keine aktuellen Berichte für dieses Unternehmen vorhanden.', 'Keine aktuellen Berichte für dieses Unternehmen vorhanden.')}</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                    {data.relatedNews?.map(news => (
                      <div 
                        key={news.id}
                        style={{
                          backgroundColor: 'var(--bg-ivory)',
                          border: '0.5px solid var(--light-border)',
                          padding: '16px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          height: '100%',
                          transition: 'border-color 0.2s'
                        }}
                        onClick={() => navigate(`/news/${news.id}`)}
                        className="related-news-card"
                      >
                        <span className="badge badge-industry" style={{ alignSelf: 'flex-start', marginBottom: '12px', fontSize: '9px' }}>{t(news.category, news.category)}</span>
                        <h4 style={{ fontFamily: '"Playfair Display", serif', fontSize: '15px', color: 'var(--text-ink)', marginBottom: '12px', flex: 1, lineHeight: 1.4, fontWeight: 700 }}>
                          {t(news.title, news.title)}
                        </h4>
                        <span style={{ fontSize: '11px', color: 'var(--text-charcoal)', fontFamily: 'var(--font-mono)' }}>{news.date_published}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Statistics Charts */}
            {activeTab === 'statistics' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                
                {/* Revenue SVG Line Chart */}
                <div style={{ backgroundColor: '#FFFDF7', border: '0.5px solid var(--light-border)', padding: '24px', borderRadius: '4px' }}>
                  <h3 style={{ fontSize: '15px', fontFamily: 'Inter, sans-serif', fontWeight: 600, color: 'var(--text-ink)', marginBottom: '20px' }}>
                    {t('Umsatzentwicklung (CHF)', 'Umsatzentwicklung (CHF)')}
                  </h3>
                  
                  <div style={{ width: '100%', overflowX: 'auto' }}>
                    <svg viewBox="0 0 500 200" style={{ width: '100%', minWidth: '400px', height: 'auto', backgroundColor: '#FFFDF7' }}>
                      {/* Grid Lines */}
                      <line x1="50" y1="30" x2="470" y2="30" stroke="var(--light-border)" strokeWidth="0.5" />
                      <line x1="50" y1="75" x2="470" y2="75" stroke="var(--light-border)" strokeWidth="0.5" />
                      <line x1="50" y1="120" x2="470" y2="120" stroke="var(--light-border)" strokeWidth="0.5" />
                      
                      {/* Axes */}
                      <line x1="50" y1="20" x2="50" y2="160" stroke="var(--text-charcoal)" strokeWidth="0.5" />
                      <line x1="50" y1="160" x2="480" y2="160" stroke="var(--text-charcoal)" strokeWidth="0.5" />
                      
                      {(() => {
                        const vals = data.charts.revenueHistory.map(h => h.revenue);
                        const min = Math.min(...vals) * 0.95;
                        const max = Math.max(...vals) * 1.05;
                        const range = max - min;
                        
                        const points = data.charts.revenueHistory.map((h, i) => {
                          const x = 50 + i * 100;
                          const y = 160 - ((h.revenue - min) / range) * 130;
                          return { x, y, val: h.revenue, year: h.year };
                        });
                        
                        const linePath = points.map(p => `${p.x},${p.y}`).join(' ');
                        
                        return (
                          <>
                            {/* Area Fill */}
                            <polygon fill="var(--gold-light)" opacity="0.3" points={`50,160 ${linePath} 450,160`} />

                            {/* Line path */}
                            <polyline fill="none" stroke="var(--primary-gold)" strokeWidth="2" points={linePath} />
                            
                            {/* Points */}
                            {points.map((p, i) => (
                              <g key={i}>
                                <circle cx={p.x} cy={p.y} r="4" fill="var(--primary-gold)" />
                                <text x={p.x} y={p.y - 12} fill="var(--text-ink)" fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle" fontWeight="bold">
                                  CHF {p.val >= 1e9 ? `${(p.val / 1e9).toFixed(1)}B` : `${(p.val / 1e6).toFixed(0)}M`}
                                </text>
                                <text x={p.x} y="178" fill="var(--text-charcoal)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">
                                  {p.year}
                                </text>
                              </g>
                            ))}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                </div>

                {/* Employee Count Trend Bar Chart */}
                <div style={{ backgroundColor: '#FFFDF7', border: '0.5px solid var(--light-border)', padding: '24px', borderRadius: '4px' }}>
                  <h3 style={{ fontSize: '15px', fontFamily: 'Inter, sans-serif', fontWeight: 600, color: 'var(--text-ink)', marginBottom: '20px' }}>
                    {t('Entwicklung der Mitarbeiterzahlen (Headcount)', 'Entwicklung der Mitarbeiterzahlen (Headcount)')}
                  </h3>
                  
                  <div style={{ width: '100%', overflowX: 'auto' }}>
                    <svg viewBox="0 0 500 200" style={{ width: '100%', minWidth: '400px', height: 'auto', backgroundColor: '#FFFDF7' }}>
                      <line x1="50" y1="160" x2="480" y2="160" stroke="var(--text-charcoal)" strokeWidth="0.5" />
                      
                      {(() => {
                        const counts = data.charts.employeeHistory.map(h => h.count);
                        const max = Math.max(...counts) * 1.1;
                        
                        return data.charts.employeeHistory.map((h, i) => {
                          const x = 70 + i * 90;
                          const barWidth = 40;
                          const barHeight = (h.count / max) * 130;
                          const y = 160 - barHeight;
                          
                          return (
                            <g key={i}>
                              <rect x={x} y={y} width={barWidth} height={barHeight} fill="var(--gold-light)" stroke="var(--primary-gold)" strokeWidth="1" />
                              <text x={x + barWidth/2} y={y - 8} fill="var(--text-ink)" fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle" fontWeight="bold">
                                {formatSwissNumber(h.count)}
                              </text>
                              <text x={x + barWidth/2} y="178" fill="var(--text-charcoal)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">
                                {h.year}
                              </text>
                            </g>
                          );
                        });
                      })()}
                    </svg>
                  </div>
                </div>

              </div>
            )}

            {/* Tab: Personen (Key Executives) */}
            {activeTab === 'people' && (
              <div>
                <h2 style={{ fontSize: '24px', fontFamily: '"Playfair Display", serif', borderBottom: '0.5px solid var(--light-border)', paddingBottom: '8px', marginBottom: '20px', color: 'var(--text-ink)', fontWeight: 700 }}>
                  {t('Schlüsselpersonen & Management', 'Schlüsselpersonen & Management')}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {mockExecutives.map((exec, idx) => (
                    <div 
                      key={idx}
                      style={{
                        padding: '16px',
                        border: '0.5px solid var(--light-border)',
                        backgroundColor: 'var(--bg-ivory)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-ink)', display: 'block' }}>{exec.name}</span>
                        <span style={{ fontSize: '13px', color: 'var(--text-charcoal)' }}>{exec.role}</span>
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-charcoal)', fontFamily: 'var(--font-mono)' }}>{exec.tenure}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Column 3: Right Sidebar (280px) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="profile-right-col">
            
            {/* ESG Rating Scorecard */}
            {data.esg_rating > 0 && (
              <div 
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '0.5px solid var(--light-border)',
                  borderTop: '4px solid #2E7D32',
                  padding: '24px',
                  borderRadius: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span className="caps-label" style={{ fontSize: '11px', color: '#2E7D32', fontWeight: 600 }}>
                    {t('ESG Nachhaltigkeit', 'ESG Nachhaltigkeit')}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#2E7D32', backgroundColor: 'rgba(46, 125, 50, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                    Score: {data.esg_rating}/100
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                  {Array.from({ length: 5 }).map((_, i) => {
                    const leafScore = data.esg_rating / 20;
                    const isFilled = i < Math.round(leafScore);
                    return (
                      <span key={i} style={{ fontSize: '18px', filter: isFilled ? 'none' : 'grayscale(100%) opacity(30%)' }}>
                        🍃
                      </span>
                    );
                  })}
                </div>

                <p style={{ fontSize: '12.5px', color: 'var(--text-charcoal)', lineHeight: 1.5, margin: 0 }}>
                  {t(data.sustainability_summary, data.sustainability_summary)}
                </p>
              </div>
            )}
            
            {/* Zone D Half-page Ad */}
            <AdSlot position="D" />

            {/* Similar Companies Module */}
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                border: '0.5px solid var(--light-border)',
                padding: '20px',
                borderRadius: '6px'
              }}
            >
              <span className="caps-label" style={{ fontSize: '11px', display: 'block', marginBottom: '16px' }}>
                {t('Ähnliche Unternehmen', 'Ähnliche Unternehmen')}
              </span>
              
              {similarCompanies.length === 0 ? (
                <p style={{ fontSize: '12px', color: 'var(--text-charcoal)' }}>{t('Keine ähnlichen Einträge gefunden.', 'Keine ähnlichen Einträge gefunden.')}</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {similarCompanies.map(c => (
                    <div 
                      key={c.id}
                      onClick={() => navigate(`/unternehmen/${c.id}`)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        padding: '8px',
                        border: '0.5px solid transparent',
                        transition: 'border-color 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--light-border)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                    >
                      <div style={{ width: '36px', height: '36px', backgroundColor: c.logo_bg || 'var(--surface-warm)', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 'bold', fontSize: '12px', flexShrink: 0 }}>
                        {c.name.charAt(0)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-ink)', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{t(c.name, c.name)}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-charcoal)' }}>{t('Kanton', 'Kanton')} {t(c.canton, c.canton)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Newsletter card (dark) */}
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
                {t('Schweizer Wirtschafts-Newsletter', 'Schweizer Wirtschafts-Newsletter')}
              </h4>
              <p style={{ fontSize: '12px', color: '#888888', lineHeight: 1.5, marginBottom: '16px' }}>
                {t('Erhalten Sie wöchentlich verifizierte B2B-Daten und Premium-Analysen direkt in Ihr Postfach.', 'Erhalten Sie wöchentlich verifizierte B2B-Daten und Premium-Analysen direkt in Ihr Postfach.')}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input 
                  type="email" 
                  placeholder={t('Ihre E-Mail-Adresse', 'Ihre E-Mail-Adresse')} 
                  style={{ 
                    padding: '8px 12px', 
                    borderRadius: '0px', 
                    border: '0.5px solid #2A2A2A', 
                    backgroundColor: '#0A0A0A', 
                    color: '#FFFFFF',
                    fontSize: '13px'
                  }} 
                />
                <button className="btn btn-gold-fill" style={{ fontSize: '12px', padding: '8px', minHeight: '36px', width: '100%' }}>
                  {t('Abonnieren', 'Abonnieren')}
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Global page rules */}
      <style>{`
        @media (max-width: 1024px) {
          .profile-layout-grid {
            grid-template-columns: 1fr !important;
          }
          .profile-left-col, .profile-right-col {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
