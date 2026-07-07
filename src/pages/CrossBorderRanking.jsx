import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Medal, Search, Filter, ShieldCheck, ArrowRight, Star, ExternalLink } from 'lucide-react';

export default function CrossBorderRanking({ navigate }) {
  const { t, isRtl } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All');

  const rankData = [
    { rank: 1, name: "Google Switzerland", category: "Technology", hq: "Mountain View / Zurich", score: 98, employees: "5,000+", metric: "$1.2B R&D local spend" },
    { rank: 2, name: "Nestlé USA", category: "Consumer Goods", hq: "Vevey / Arlington", score: 95, employees: "48,000+", metric: "$12B US Revenue" },
    { rank: 3, name: "Roche Genentech", category: "Pharmaceuticals", hq: "Basel / South San Francisco", score: 94, employees: "12,000+", metric: "Major California oncology lab" },
    { rank: 4, name: "Disney Research Zurich", category: "Entertainment", hq: "Burbank / Zurich", score: 89, employees: "200+ Researchers", metric: "Core CGI & CGI AI breakthroughs" },
    { rank: 5, name: "Logitech", category: "Technology", hq: "Lausanne / Newark", score: 88, employees: "3,500+", metric: "$4.3B global sales base" },
    { rank: 6, name: "UBS Americas", category: "Financial Services", hq: "Zurich / Los Angeles", score: 87, employees: "20,000+", metric: "Wealth management leader" }
  ];

  const sectors = ["All", "Technology", "Consumer Goods", "Pharmaceuticals", "Entertainment", "Financial Services"];

  const filteredData = rankData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.hq.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = sectorFilter === "All" || item.category === sectorFilter;
    return matchesSearch && matchesSector;
  });

  return (
    <div style={{ backgroundColor: 'var(--bg-ivory)', minHeight: 'calc(100vh - 120px)', padding: '40px 0 64px' }}>
      <div className="container">
        
        {/* Breadcrumb */}
        <div style={{ fontSize: '12px', color: 'var(--text-charcoal)', marginBottom: '24px', display: 'flex', gap: '6px', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>{t('Home', 'Home')}</span>
          <span>/</span>
          <span style={{ fontWeight: 600, color: 'var(--text-ink)' }}>Cross-Border Ranking</span>
        </div>

        {/* Header Block */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ color: 'var(--primary-red)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
            Transatlantic Index
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '38px', fontWeight: 700, color: 'var(--text-ink)', margin: '0 0 16px' }}>
            Cross-Border Ranking
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--text-charcoal)', maxWidth: '680px', margin: '0 auto', lineHeight: '1.6' }}>
            Ranks the top corporations bridging the Swiss and California business sectors based on local research and development investments, employee size, and transatlantic trade integration.
          </p>
        </div>

        {/* Filter Bar */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          backgroundColor: '#FFFFFF', 
          border: '1px solid var(--light-border)', 
          padding: '16px 24px', 
          marginBottom: '24px',
          gap: '16px',
          flexWrap: 'wrap',
          flexDirection: isRtl ? 'row-reverse' : 'row'
        }}>
          {/* Search box */}
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--light-border)', padding: '8px 12px', backgroundColor: '#FFFDF7', flex: 1, maxWidth: '400px' }}>
            <Search size={16} style={{ color: '#888', marginRight: '8px' }} />
            <input 
              type="text" 
              placeholder="Search companies or hubs..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'none', outline: 'none', fontSize: '13px', width: '100%' }}
            />
          </div>

          {/* Sector selection dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} style={{ color: 'var(--primary-red)' }} />
            <select
              value={sectorFilter}
              onChange={e => setSectorFilter(e.target.value)}
              style={{ padding: '8px 16px', border: '1px solid var(--light-border)', backgroundColor: '#FFFDF7', fontSize: '13px', fontFamily: 'var(--font-sans)' }}
            >
              {sectors.map(sec => <option key={sec} value={sec}>{sec}</option>)}
            </select>
          </div>
        </div>

        {/* Ranks Table */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--light-border)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: isRtl ? 'right' : 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #000', backgroundColor: '#F9F9F9' }}>
                <th style={{ padding: '16px 24px', fontWeight: 700, width: '80px' }}>Rank</th>
                <th style={{ padding: '16px 24px', fontWeight: 700 }}>Company Name</th>
                <th style={{ padding: '16px 24px', fontWeight: 700 }}>Sector</th>
                <th style={{ padding: '16px 24px', fontWeight: 700 }}>Transatlantic HQ Hub</th>
                <th style={{ padding: '16px 24px', fontWeight: 700, width: '150px' }}>Integration Score</th>
                <th style={{ padding: '16px 24px', fontWeight: 700, textAlign: 'right' }}>Key Metric</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--light-border)', transition: 'background-color 0.15s ease' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FFFDF7'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '16px 24px', fontWeight: 700 }}>
                    {item.rank <= 3 ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: item.rank === 1 ? '#D4AF37' : item.rank === 2 ? '#C0C0C0' : '#CD7F32', color: '#FFF', fontSize: '12px' }}>
                        {item.rank}
                      </span>
                    ) : (
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-charcoal)', paddingLeft: '8px' }}>#{item.rank}</span>
                    )}
                  </td>
                  <td style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-ink)' }}>{item.name}</td>
                  <td style={{ padding: '16px 24px', color: 'var(--text-charcoal)' }}>{item.category}</td>
                  <td style={{ padding: '16px 24px', color: 'var(--text-charcoal)', fontSize: '13px' }}>{item.hq}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontFamily: 'var(--font-mono)' }}>{item.score}%</strong>
                      <div style={{ width: '80px', height: '6px', backgroundColor: '#EAEAEA', borderRadius: '3px', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: `${item.score}%`, backgroundColor: 'var(--primary-red)', borderRadius: '3px' }} />
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', color: 'var(--text-charcoal)' }}>
                    <strong>{item.metric}</strong> ({item.employees})
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                    No companies match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
