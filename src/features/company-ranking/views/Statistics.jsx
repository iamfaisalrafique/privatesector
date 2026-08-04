import React, { useState, useEffect } from 'react';
import AdSlot from '../../../shared/components/AdSlot';
import { useLanguage } from '../../../context/LanguageContext';
import { Download, Filter, Map, Calendar, BarChart3, TrendingUp } from 'lucide-react';

const CANTON_NAMES = {
  ZH: 'Zürich', BE: 'Bern', LU: 'Luzern', UR: 'Uri', SZ: 'Schwyz', OW: 'Obwalden',
  NW: 'Nidwalden', GL: 'Glarus', ZG: 'Zug', FR: 'Freiburg', SO: 'Solothurn',
  BS: 'Basel-Stadt', BL: 'Basel-Landschaft', SH: 'Schaffhausen', AR: 'Appenzell Ausserrhoden',
  AI: 'Appenzell Innerrhoden', SG: 'St. Gallen', GR: 'Graubünden', AG: 'Aargau',
  TG: 'Thurgau', TI: 'Ticino', VD: 'Vaud', VS: 'Valais', NE: 'Neuchâtel',
  GE: 'Genève', JU: 'Jura'
};

const CANTON_GRID = [
  { code: 'BS', x: 2, y: 0 }, { code: 'BL', x: 3, y: 0 }, { code: 'AG', x: 4, y: 0 }, { code: 'SH', x: 6, y: 0 }, { code: 'TG', x: 7, y: 0 },
  { code: 'JU', x: 1, y: 1 }, { code: 'SO', x: 2, y: 1 }, { code: 'ZH', x: 5, y: 1 }, { code: 'AR', x: 8, y: 1 }, { code: 'AI', x: 9, y: 1 },
  { code: 'NE', x: 0, y: 2 }, { code: 'VD', x: 1, y: 2 }, { code: 'FR', x: 2, y: 2 }, { code: 'BE', x: 3, y: 2 }, { code: 'LU', x: 4, y: 2 }, { code: 'ZG', x: 5, y: 2 }, { code: 'SZ', x: 6, y: 2 }, { code: 'GL', x: 7, y: 2 }, { code: 'SG', x: 8, y: 2 },
  { code: 'GE', x: 0, y: 3 }, { code: 'OW', x: 4, y: 3 }, { code: 'NW', x: 5, y: 3 }, { code: 'UR', x: 6, y: 3 }, { code: 'GR', x: 9, y: 3 },
  { code: 'VS', x: 2, y: 4 }, { code: 'TI', x: 6, y: 4 }
];

export default function Statistics({ navigate }) {
  const { t, isRtl } = useLanguage();
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredCanton, setHoveredCanton] = useState(null);

  // Filters State
  const [yearFilter, setYearFilter] = useState(2026);
  const [sectorFilter, setSectorFilter] = useState('All');
  const [cantonFilter, setCantonFilter] = useState('All');

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          setStatsData(data);
        }
      } catch (e) {
        console.error('Failed to load statistics api:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const handleDownloadCSV = (title, headers, data) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(",")].concat(data.map(row => Object.values(row).join(","))).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${title.toLowerCase().replace(/ /g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '64px 0', textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '2px solid var(--light-border)', borderTopColor: 'var(--primary-red)', borderRadius: '50%', animation: 'spin 1s infinite linear', margin: '0 auto 16px' }} />
        <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '18px', color: 'var(--text-charcoal)' }}>Makroökonomische Indikatoren werden berechnet...</p>
      </div>
    );
  }

  // Color mapping based on Gold/Ivory saturation levels
  const getCantonColor = (code) => {
    if (!statsData || !statsData.cantonWeights) return 'rgba(0, 0, 0, 0.02)';
    const weight = statsData.cantonWeights[code] || 20;
    if (weight > 85) return 'var(--primary-red)';
    if (weight > 65) return '#D3B151';
    if (weight > 40) return '#E8C874';
    if (weight > 20) return '#F3E2AE';
    return '#FBF5DC';
  };

  // Mock dual data for Export vs Import
  const exportImportData = [
    { year: 2020, exports: 220, imports: 180 },
    { year: 2021, exports: 250, imports: 195 },
    { year: 2022, exports: 278, imports: 215 },
    { year: 2023, exports: 285, imports: 225 },
    { year: 2024, exports: 298, imports: 232 },
    { year: 2025, exports: 305, imports: 240 },
    { year: 2026, exports: 312, imports: 248 }
  ];

  // Mock Company Formation Rate
  const formationRateData = [
    { year: 2021, value: 48500 },
    { year: 2022, value: 50100 },
    { year: 2023, value: 51200 },
    { year: 2024, value: 49800 },
    { year: 2025, value: 52400 },
    { year: 2026, value: 53800 }
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-ivory)', minHeight: 'calc(100vh - 120px)', paddingBottom: '64px' }}>
      
      {/* 1. Dark Hero KPI Ticker Strip (4 Giant KPIs) */}
      <div style={{ backgroundColor: '#0A0A0A', borderBottom: '1.5px solid rgba(191, 155, 48, 0.3)', padding: '48px 0', color: '#FFFFFF' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px', textAlign: 'center' }}>
          
          <div style={{ borderRight: isRtl ? 'none' : '0.5px solid #2A2A2A', borderLeft: isRtl ? '0.5px solid #2A2A2A' : 'none', padding: '0 16px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#888888', display: 'block', marginBottom: '8px' }}>
              {t('BIP Wachstums-Prognose', 'BIP Wachstums-Prognose')}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '56px', color: 'var(--primary-red)', fontWeight: 700 }}>+1.8%</span>
            <span style={{ fontSize: '11px', color: 'var(--accent-green)', display: 'block', marginTop: '6px' }}>{t('▲ Stabiler Ausblick', '▲ Stabiler Ausblick')}</span>
          </div>

          <div style={{ borderRight: isRtl ? 'none' : '0.5px solid #2A2A2A', borderLeft: isRtl ? '0.5px solid #2A2A2A' : 'none', padding: '0 16px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#888888', display: 'block', marginBottom: '8px' }}>
              {t('Erwerbstätige Gesamt', 'Erwerbstätige Gesamt')}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '56px', color: 'var(--primary-red)', fontWeight: 700 }}>5'400'000</span>
            <span style={{ fontSize: '11px', color: '#888888', display: 'block', marginTop: '6px' }}>{t('Inländische & Grenzgänger', 'Inländische & Grenzgänger')}</span>
          </div>

          <div style={{ borderRight: isRtl ? 'none' : '0.5px solid #2A2A2A', borderLeft: isRtl ? '0.5px solid #2A2A2A' : 'none', padding: '0 16px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#888888', display: 'block', marginBottom: '8px' }}>
              {t('Eingetragene Holdings', 'Eingetragene Holdings')}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '56px', color: 'var(--primary-red)', fontWeight: 700 }}>500'000+</span>
            <span style={{ fontSize: '11px', color: 'var(--primary-red)', display: 'block', marginTop: '6px' }}>{t('Zefix-registrierte Entitäten', 'Zefix-registrierte Entitäten')}</span>
          </div>

          <div style={{ padding: '0 16px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#888888', display: 'block', marginBottom: '8px' }}>
              {t('Nationale Teuerung (CPI)', 'Nationale Teuerung (CPI)')}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '56px', color: 'var(--primary-red)', fontWeight: 700 }}>1.2%</span>
            <span style={{ fontSize: '11px', color: 'var(--accent-green)', display: 'block', marginTop: '6px' }}>{t('Tiefstwert im Euroraum', 'Tiefstwert im Euroraum')}</span>
          </div>

        </div>
      </div>

      {/* Zone A Leaderboard Ad */}
      <div className="container" style={{ marginTop: '24px' }}>
        <AdSlot position="A" />
      </div>

      {/* Filter Bar (bfs.admin.ch style) */}
      <div className="container" style={{ marginTop: '32px' }}>
        <div 
          style={{ 
            backgroundColor: '#FFFFFF',
            border: '0.5px solid var(--light-border)',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={18} style={{ color: 'var(--primary-red)' }} />
            <span style={{ fontWeight: 600, fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>{t('Kennzahlen filtern:', 'Kennzahlen filtern:')}</span>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-charcoal)', display: 'block', marginBottom: '4px' }}>{t('Jahr:', 'Jahr:')} {yearFilter}</label>
              <input 
                type="range" 
                min="2018" 
                max="2026" 
                value={yearFilter} 
                onChange={(e) => setYearFilter(Number(e.target.value))}
                style={{ accentColor: 'var(--primary-red)' }}
              />
            </div>
            
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-charcoal)', display: 'block', marginBottom: '4px' }}>{t('Wirtschaftssektor', 'Wirtschaftssektor')}</label>
              <select 
                value={sectorFilter} 
                onChange={(e) => setSectorFilter(e.target.value)}
                style={{ padding: '6px 12px', borderColor: 'var(--light-border)', backgroundColor: '#FFFDF7', fontSize: '13px' }}
              >
                <option value="All">{t('Alle Sektoren', 'Alle Sektoren')}</option>
                <option value="financial">Financial Services</option>
                <option value="pharma">Pharmaceuticals</option>
                <option value="luxury">Luxury Goods</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-charcoal)', display: 'block', marginBottom: '4px' }}>{t('Kanton', 'Kanton')}</label>
              <select 
                value={cantonFilter} 
                onChange={(e) => setCantonFilter(e.target.value)}
                style={{ padding: '6px 12px', borderColor: 'var(--light-border)', backgroundColor: '#FFFDF7', fontSize: '13px' }}
              >
                <option value="All">{t('Ganzer Bund (CH)', 'Ganzer Bund (CH)')}</option>
                {CANTON_GRID.map(c => (
                  <option key={c.code} value={c.code}>{c.code} - {CANTON_NAMES[c.code]}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Ivory Charts Grid */}
      <div className="container" style={{ marginTop: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '32px' }}>
          
          {/* Chart 1: GDP Trend Area Chart */}
          <div style={{ backgroundColor: '#FFFFFF', border: '0.5px solid var(--light-border)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontFamily: '"Playfair Display", serif', fontWeight: 700, color: 'var(--text-ink)' }}>
                {t('BIP-Entwicklung (Milliarden CHF)', 'BIP-Entwicklung (Milliarden CHF)')}
              </h3>
              <button 
                onClick={() => handleDownloadCSV('BIP Entwicklung', ['Year', 'GDP_Billion_CHF'], statsData.gdpTrend)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-charcoal)' }}
                title="Download CSV"
              >
                <Download size={16} />
              </button>
            </div>
            
            <div style={{ width: '100%', overflowX: 'auto' }}>
              <svg viewBox="0 0 500 220" style={{ width: '100%', minWidth: '400px', height: 'auto', backgroundColor: '#FFFDF7' }}>
                <line x1="50" y1="50" x2="470" y2="50" stroke="var(--light-border)" strokeWidth="0.5" />
                <line x1="50" y1="95" x2="470" y2="95" stroke="var(--light-border)" strokeWidth="0.5" />
                <line x1="50" y1="140" x2="470" y2="140" stroke="var(--light-border)" strokeWidth="0.5" />
                
                <line x1="50" y1="20" x2="50" y2="180" stroke="var(--text-charcoal)" strokeWidth="0.5" />
                <line x1="50" y1="180" x2="470" y2="180" stroke="var(--text-charcoal)" strokeWidth="0.5" />
                
                {(() => {
                  const points = statsData.gdpTrend.map((t, idx) => {
                    const x = 50 + idx * 50;
                    const y = 180 - ((t.value - 690) / 120) * 150;
                    return { x, y, value: t.value, year: t.year };
                  });
                  const path = points.map(p => `${p.x},${p.y}`).join(' ');
                  
                  return (
                    <>
                      <polygon fill="var(--gold-light)" opacity="0.3" points={`50,180 ${path} 450,180`} />
                      <polyline fill="none" stroke="var(--primary-gold)" strokeWidth="2" points={path} />
                      {points.map((p, idx) => (
                        <g key={idx}>
                          <circle cx={p.x} cy={p.y} r="4" fill="var(--primary-gold)" />
                          <text x={p.x} y={p.y - 12} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-ink)" textAnchor="middle" fontWeight="bold">
                            {p.value}B
                          </text>
                          <text x={p.x} y="198" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-charcoal)" textAnchor="middle">
                            {p.year}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-charcoal)', display: 'block', marginTop: '12px' }}>{t('Quelle: BFS / SECO', 'Quelle: BFS / SECO')}</span>
          </div>

          {/* Chart 2: Export vs Import Dual Line */}
          <div style={{ backgroundColor: '#FFFFFF', border: '0.5px solid var(--light-border)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontFamily: '"Playfair Display", serif', fontWeight: 700, color: 'var(--text-ink)' }}>
                {t('Handelsbilanz: Exporte vs. Importe (Mrd. CHF)', 'Handelsbilanz: Exporte vs. Importe (Mrd. CHF)')}
              </h3>
              <button 
                onClick={() => handleDownloadCSV('Handelsbilanz', ['Year', 'Exports_Billion', 'Imports_Billion'], exportImportData)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-charcoal)' }}
                title="Download CSV"
              >
                <Download size={16} />
              </button>
            </div>
            
            <div style={{ width: '100%', overflowX: 'auto' }}>
              <svg viewBox="0 0 500 220" style={{ width: '100%', minWidth: '400px', height: 'auto', backgroundColor: '#FFFDF7' }}>
                <line x1="50" y1="50" x2="470" y2="50" stroke="var(--light-border)" strokeWidth="0.5" />
                <line x1="50" y1="95" x2="470" y2="95" stroke="var(--light-border)" strokeWidth="0.5" />
                <line x1="50" y1="140" x2="470" y2="140" stroke="var(--light-border)" strokeWidth="0.5" />
                
                <line x1="50" y1="20" x2="50" y2="180" stroke="var(--text-charcoal)" strokeWidth="0.5" />
                <line x1="50" y1="180" x2="470" y2="180" stroke="var(--text-charcoal)" strokeWidth="0.5" />
                
                {(() => {
                  const exportPoints = exportImportData.map((d, i) => ({
                    x: 60 + i * 65,
                    y: 180 - ((d.exports - 150) / 180) * 140,
                    val: d.exports,
                    year: d.year
                  }));
                  
                  const importPoints = exportImportData.map((d, i) => ({
                    x: 60 + i * 65,
                    y: 180 - ((d.imports - 150) / 180) * 140,
                    val: d.imports,
                    year: d.year
                  }));

                  const exportPath = exportPoints.map(p => `${p.x},${p.y}`).join(' ');
                  const importPath = importPoints.map(p => `${p.x},${p.y}`).join(' ');

                  return (
                    <>
                      {/* Exports Line (Gold) */}
                      <polyline fill="none" stroke="var(--primary-gold)" strokeWidth="2.5" points={exportPath} />
                      {/* Imports Line (Red) */}
                      <polyline fill="none" stroke="var(--accent-red)" strokeWidth="2.5" points={importPath} />

                      {exportPoints.map((p, idx) => (
                        <g key={`exp-${idx}`}>
                          <circle cx={p.x} cy={p.y} r="3.5" fill="var(--primary-gold)" />
                          <text x={p.x} y={p.y - 8} fontSize="8" fontFamily="var(--font-mono)" fill="var(--text-ink)" textAnchor="middle">{p.val}B</text>
                          <text x={p.x} y="195" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-charcoal)" textAnchor="middle">{p.year}</text>
                        </g>
                      ))}
                      {importPoints.map((p, idx) => (
                        <g key={`imp-${idx}`}>
                          <circle cx={p.x} cy={p.y} r="3.5" fill="var(--accent-red)" />
                          <text x={p.x} y={p.y + 12} fontSize="8" fontFamily="var(--font-mono)" fill="var(--accent-red)" textAnchor="middle">{p.val}B</text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '11px', marginTop: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--primary-gold)', display: 'inline-block' }} /> {t('Exporte', 'Exporte')}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--accent-red)', display: 'inline-block' }} /> {t('Importe', 'Importe')}
              </span>
              <span style={{ color: 'var(--text-charcoal)', marginLeft: 'auto' }}>{t('Quelle: Zollverwaltung (EZV)', 'Quelle: Zollverwaltung (EZV)')}</span>
            </div>
          </div>

          {/* Chart 3: Employment by Sector (Horizontal bar chart) */}
          <div style={{ backgroundColor: '#FFFFFF', border: '0.5px solid var(--light-border)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontFamily: '"Playfair Display", serif', fontWeight: 700, color: 'var(--text-ink)' }}>
                {t('Arbeitskräfteverteilung nach Sektor (%)', 'Arbeitskräfteverteilung nach Sektor (%)')}
              </h3>
              <button 
                onClick={() => handleDownloadCSV('Arbeitskrafteverteilung', ['Sector', 'Share_Percent'], statsData.sectors)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-charcoal)' }}
                title="Download CSV"
              >
                <Download size={16} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
              {statsData.sectors.map((sec, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-ink)' }}>{t(sec.name, sec.name)}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary-gold)' }}>{sec.share}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--surface-warm)', border: '0.5px solid var(--light-border)', borderRadius: '0px' }}>
                    <div 
                      style={{ 
                        width: `${sec.share * 2}%`, 
                        height: '100%', 
                        backgroundColor: 'var(--primary-gold)'
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-charcoal)', display: 'block', marginTop: '20px' }}>{t('Quelle: BFS / SECO', 'Quelle: BFS / SECO')}</span>
          </div>

          {/* Chart 4: Switzerland Canton Choropleth Map Grid */}
          <div style={{ backgroundColor: '#FFFFFF', border: '0.5px solid var(--light-border)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontFamily: '"Playfair Display", serif', fontWeight: 700, color: 'var(--text-ink)', margin: 0 }}>
                {t('Unternehmensdichte nach Kanton', 'Unternehmensdichte nach Kanton')}
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-charcoal)' }}>{t('canton_distribution', 'Kantonale Verteilung')}</span>
            </div>
            
            <p style={{ fontSize: '12px', color: 'var(--text-charcoal)', lineHeight: 1.5, marginBottom: '20px' }}>
              {t('Klicken Sie auf ein Kantonskürzel, um im Verzeichnis nach Unternehmen in diesem Kanton zu filtern.', 'Klicken Sie auf ein Kantonskürzel, um im Verzeichnis nach Unternehmen in diesem Kanton zu filtern.')}
            </p>

            {/* Grid Layout */}
            <div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(10, 1fr)', 
                gap: '8px',
                maxWidth: '400px',
                margin: '0 auto'
              }}
            >
              {Array.from({ length: 5 }).map((_, y) => {
                return Array.from({ length: 10 }).map((_, x) => {
                  const matched = CANTON_GRID.find(c => c.x === x && c.y === y);
                  
                  if (!matched) {
                    return <div key={`empty-${x}-${y}`} style={{ aspectRatio: '1' }} />;
                  }

                  const activeWeight = statsData.cantonWeights[matched.code] || 20;

                  return (
                    <button
                      key={matched.code}
                      onMouseEnter={() => setHoveredCanton(matched.code)}
                      onMouseLeave={() => setHoveredCanton(null)}
                      onClick={() => navigate(`/unternehmen?canton=${matched.code}`)}
                      style={{
                        aspectRatio: '1',
                        backgroundColor: getCantonColor(matched.code),
                        border: hoveredCanton === matched.code ? '1.5px solid var(--primary-gold)' : '0.5px solid var(--light-border)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#1A1A1A',
                        position: 'relative'
                      }}
                      title={`${CANTON_NAMES[matched.code]} (${matched.code}): Dichte ${activeWeight}%`}
                    >
                      {matched.code}
                    </button>
                  );
                });
              })}
            </div>

            {/* Live Hover Report Panel */}
            <div 
              style={{ 
                marginTop: '20px', 
                backgroundColor: 'var(--bg-ivory)', 
                border: '0.5px solid var(--light-border)',
                padding: '12px', 
                textAlign: 'center',
                minHeight: '40px',
                fontSize: '13px',
                fontWeight: 500
              }}
            >
              {hoveredCanton ? (
                <div>
                  <strong style={{ color: 'var(--text-ink)' }}>{t('Kanton', 'Kanton')} {t(CANTON_NAMES[hoveredCanton], CANTON_NAMES[hoveredCanton])} ({hoveredCanton})</strong>
                  <span style={{ color: 'var(--gold-hover)', marginLeft: '12px' }}>{t('Dichteindex:', 'Dichteindex:')} {statsData.cantonWeights[hoveredCanton]}%</span>
                </div>
              ) : (
                <span style={{ color: 'var(--text-charcoal)' }}>{t('Navigieren Sie über die Kantonskacheln für Live-Dossier-Metriken.', 'Navigieren Sie über die Kantonskacheln für Live-Dossier-Metriken.')}</span>
              )}
            </div>
          </div>

          {/* Chart 5: Company Formation Rate */}
          <div style={{ backgroundColor: '#FFFFFF', border: '0.5px solid var(--light-border)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontFamily: '"Playfair Display", serif', fontWeight: 700, color: 'var(--text-ink)' }}>
                {t('Neugründungsrate (Holdings & SMEs)', 'Neugründungsrate (Holdings & SMEs)')}
              </h3>
              <button 
                onClick={() => handleDownloadCSV('Neugrundungen', ['Year', 'New_Formations'], formationRateData)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-charcoal)' }}
                title="Download CSV"
              >
                <Download size={16} />
              </button>
            </div>
            
            <div style={{ width: '100%', overflowX: 'auto' }}>
              <svg viewBox="0 0 500 220" style={{ width: '100%', minWidth: '400px', height: 'auto', backgroundColor: '#FFFDF7' }}>
                <line x1="50" y1="160" x2="470" y2="160" stroke="var(--text-charcoal)" strokeWidth="0.5" />
                
                {formationRateData.map((d, i) => {
                  const x = 75 + i * 65;
                  const barWidth = 32;
                  const barHeight = (d.value / 60000) * 130;
                  const y = 160 - barHeight;

                  return (
                    <g key={i}>
                      <rect x={x} y={y} width={barWidth} height={barHeight} fill="var(--gold-light)" stroke="var(--primary-gold)" strokeWidth="1" />
                      <text x={x + barWidth / 2} y={y - 8} fill="var(--text-ink)" fontSize="8.5" fontFamily="var(--font-mono)" textAnchor="middle" fontWeight="bold">
                        {d.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'")}
                      </text>
                      <text x={x + barWidth / 2} y="178" fill="var(--text-charcoal)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">
                        {d.year}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-charcoal)', display: 'block', marginTop: '12px' }}>{t('Quelle: Zefix Handelsregister', 'Quelle: Zefix Handelsregister')}</span>
          </div>

          {/* Chart 6: Top Industries Revenue */}
          <div style={{ backgroundColor: '#FFFFFF', border: '0.5px solid var(--light-border)', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontFamily: '"Playfair Display", serif', fontWeight: 700, color: 'var(--text-ink)', marginBottom: '20px' }}>
              {t('Branchenumsatz-Vergleich (Mrd. CHF)', 'Branchenumsatz-Vergleich (Mrd. CHF)')}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { name: 'Chemie & Pharma (Roche, Novartis)', rev: '124B' },
                { name: 'Finanzdienstleistungen (UBS, Swiss Re)', rev: '98B' },
                { name: 'Nahrungsmittel (Nestlé)', rev: '93B' },
                { name: 'Rohstoffhandel (Glencore)', rev: '220B' },
                { name: 'Uhren & Luxusgüter (Rolex, Richemont)', rev: '32B' }
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px solid var(--light-border)', paddingBottom: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-ink)' }}>{t(item.name, item.name)}</span>
                  <span style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary-gold)' }}>CHF {item.rev.replace('B', "'000M")}</span>
                </div>
              ))}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-charcoal)', display: 'block', marginTop: '24px' }}>{t('Quelle: BFS / Eidg. Steuerverwaltung', 'Quelle: BFS / Eidg. Steuerverwaltung')}</span>
          </div>

        </div>
      </div>

      {/* Downloadable Data Tables */}
      <div className="container" style={{ marginTop: '48px' }}>
        <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '24px', fontWeight: 700, color: 'var(--text-ink)', marginBottom: '16px', borderBottom: '1px solid var(--primary-gold)', paddingBottom: '8px' }}>
          {t('Makroökonomische Datentabellen', 'Makroökonomische Datentabellen')}
        </h3>
        
        <div style={{ backgroundColor: '#FFFFFF', border: '0.5px solid var(--light-border)', padding: '20px', borderRadius: '4px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--light-border)', color: 'var(--text-charcoal)' }}>
                <th style={{ padding: '12px 8px' }}>{t('Kennzahl / Indikator', 'Kennzahl / Indikator')}</th>
                <th style={{ padding: '12px 8px' }}>2021</th>
                <th style={{ padding: '12px 8px' }}>2022</th>
                <th style={{ padding: '12px 8px' }}>2023</th>
                <th style={{ padding: '12px 8px' }}>2024</th>
                <th style={{ padding: '12px 8px' }}>2025</th>
                <th style={{ padding: '12px 8px' }}>2026 ({t('Prognose', 'Prognose')})</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '0.5px solid var(--light-border)' }}>
                <td style={{ padding: '12px 8px', fontWeight: 600 }}>{t('Nominales BIP (Mrd. CHF)', 'Nominales BIP (Mrd. CHF)')}</td>
                <td style={{ padding: '12px 8px', fontFamily: 'var(--font-mono)' }}>735</td>
                <td style={{ padding: '12px 8px', fontFamily: 'var(--font-mono)' }}>750</td>
                <td style={{ padding: '12px 8px', fontFamily: 'var(--font-mono)' }}>765</td>
                <td style={{ padding: '12px 8px', fontFamily: 'var(--font-mono)' }}>780</td>
                <td style={{ padding: '12px 8px', fontFamily: 'var(--font-mono)' }}>792</td>
                <td style={{ padding: '12px 8px', fontFamily: 'var(--font-mono)', color: 'var(--primary-gold)', fontWeight: 'bold' }}>805</td>
              </tr>
              <tr style={{ borderBottom: '0.5px solid var(--light-border)' }}>
                <td style={{ padding: '12px 8px', fontWeight: 600 }}>{t('Erwerbstätige (Milliarden)', 'Erwerbstätige (Milliarden)')}</td>
                <td style={{ padding: '12px 8px', fontFamily: 'var(--font-mono)' }}>5.08M</td>
                <td style={{ padding: '12px 8px', fontFamily: 'var(--font-mono)' }}>5.15M</td>
                <td style={{ padding: '12px 8px', fontFamily: 'var(--font-mono)' }}>5.22M</td>
                <td style={{ padding: '12px 8px', fontFamily: 'var(--font-mono)' }}>5.28M</td>
                <td style={{ padding: '12px 8px', fontFamily: 'var(--font-mono)' }}>5.34M</td>
                <td style={{ padding: '12px 8px', fontFamily: 'var(--font-mono)', color: 'var(--primary-gold)', fontWeight: 'bold' }}>5.40M</td>
              </tr>
              <tr>
                <td style={{ padding: '12px 8px', fontWeight: 600 }}>{t('Aussenhandel Exporte (Mrd. CHF)', 'Aussenhandel Exporte (Mrd. CHF)')}</td>
                <td style={{ padding: '12px 8px', fontFamily: 'var(--font-mono)' }}>250</td>
                <td style={{ padding: '12px 8px', fontFamily: 'var(--font-mono)' }}>278</td>
                <td style={{ padding: '12px 8px', fontFamily: 'var(--font-mono)' }}>285</td>
                <td style={{ padding: '12px 8px', fontFamily: 'var(--font-mono)' }}>298</td>
                <td style={{ padding: '12px 8px', fontFamily: 'var(--font-mono)' }}>305</td>
                <td style={{ padding: '12px 8px', fontFamily: 'var(--font-mono)', color: 'var(--primary-gold)', fontWeight: 'bold' }}>312</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Attribution footer */}
      <div className="container" style={{ marginTop: '48px', borderTop: '0.5px solid var(--light-border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-charcoal)', fontFamily: 'Inter, sans-serif' }}>
        <span>{t('Datenquelle: Bundesamt für Statistik (BFS) / Staatssekretariat für Wirtschaft (SECO) / Schweizerische Nationalbank (SNB)', 'Datenquelle: Bundesamt für Statistik (BFS) / Staatssekretariat für Wirtschaft (SECO) / Schweizerische Nationalbank (SNB)')}</span>
        <span>{t('Letztes Update:', 'Letztes Update:')} Q2 2026</span>
      </div>

    </div>
  );
}
