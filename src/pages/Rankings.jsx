import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import AdSlot from '../components/AdSlot';
import { Medal, Search, Filter, ShieldCheck, ArrowRight, Star, ArrowUpRight } from 'lucide-react';

export default function Rankings({ selectCompany, navigate }) {
  const { t, isRtl } = useLanguage();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [industryFilter, setIndustryFilter] = useState('All');
  const [cantonFilter, setCantonFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('esg'); // 'esg' | 'employees' | 'revenue'

  const INDUSTRIES = [
    'Consumer Goods',
    'Pharmaceuticals',
    'Financial Services',
    'Luxury Goods',
    'Manufacturing',
    'Technology',
    'Commodities'
  ];

  const CANTONS = [
    'ZH', 'BE', 'LU', 'UR', 'SZ', 'OW', 'NW', 'GL', 'ZG', 'FR', 'SO', 'BS', 'BL', 'SH',
    'AR', 'AI', 'SG', 'GR', 'AG', 'TG', 'TI', 'VD', 'VS', 'NE', 'GE', 'JU'
  ];

  useEffect(() => {
    async function loadCompanies() {
      setLoading(true);
      try {
        const res = await fetch('/api/companies');
        if (res.ok) {
          setCompanies(await res.json());
        }
      } catch (e) {
        console.error('Failed to load companies for rankings:', e);
      } finally {
        setLoading(false);
      }
    }
    loadCompanies();
  }, []);

  // Map revenue band string to a numeric value for sorting
  const getRevenueValue = (band) => {
    if (!band) return 0;
    const cleanBand = band.toUpperCase();
    if (cleanBand.includes('90B+')) return 90;
    if (cleanBand.includes('50B') && cleanBand.includes('90B')) return 70;
    if (cleanBand.includes('20B') && cleanBand.includes('50B')) return 35;
    if (cleanBand.includes('10B') && cleanBand.includes('20B')) return 15;
    if (cleanBand.includes('5B') && cleanBand.includes('10B')) return 7.5;
    if (cleanBand.includes('1B') && cleanBand.includes('5B')) return 3;
    if (cleanBand.includes('<')) return 0.5;
    return 0;
  };

  // Filter companies
  const filtered = companies.filter(c => {
    if (industryFilter !== 'All' && c.industry !== industryFilter) return false;
    if (cantonFilter !== 'All' && c.canton !== cantonFilter) return false;
    return true;
  });

  // Sort companies based on active tab
  const sorted = [...filtered].sort((a, b) => {
    if (activeTab === 'esg') {
      return (b.esg_rating || 0) - (a.esg_rating || 0);
    } else if (activeTab === 'employees') {
      return (b.employees || 0) - (a.employees || 0);
    } else if (activeTab === 'revenue') {
      return getRevenueValue(b.revenue_band) - getRevenueValue(a.revenue_band);
    }
    return 0;
  });

  // Helper to format rank badge
  const renderRankBadge = (index) => {
    const rank = index + 1;
    if (rank === 1) return <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#D4AF37', color: '#FFF', fontWeight: 'bold', fontSize: '13px' }}><Medal size={14} /></span>;
    if (rank === 2) return <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#C0C0C0', color: '#FFF', fontWeight: 'bold', fontSize: '13px' }}>2</span>;
    if (rank === 3) return <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#CD7F32', color: '#FFF', fontWeight: 'bold', fontSize: '13px' }}>3</span>;
    return <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color: 'var(--text-charcoal)' }}>#{rank}</span>;
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-ivory)', minHeight: 'calc(100vh - 120px)', padding: '40px 0 64px' }}>
      <div className="container">
        
        {/* Breadcrumb */}
        <div style={{ fontSize: '12px', color: 'var(--text-charcoal)', marginBottom: '16px', display: 'flex', gap: '6px' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>{t('Home', 'Home')}</span>
          <span>/</span>
          <span style={{ fontWeight: 600, color: 'var(--text-ink)' }}>{t('Ranking', 'Ranking')}</span>
        </div>

        <AdSlot position="A" />

        {/* Header Block */}
        <div style={{ textAlign: 'center', marginBottom: '40px', marginTop: '32px' }}>
          <span style={{ color: 'var(--primary-red)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
            {t('Swiss Corporate Leaderboard', 'Swiss Corporate Leaderboard')}
          </span>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '38px', fontWeight: 700, color: 'var(--text-ink)', margin: '0 0 12px' }}>
            {t('Company Rankings & Indices', 'Company Rankings & Indices')}
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: 'var(--text-charcoal)', maxWidth: '600px', margin: '0 auto' }}>
            {t('Discover Switzerland\'s top private sector corporations ranked by ESG sustainability ratings, national and global employment figures, and annual gross revenues.', 'Discover Switzerland\'s top private sector corporations ranked by ESG sustainability ratings, national and global employment figures, and annual gross revenues.')}
          </p>
        </div>

        {/* Tabs Control and Quick Filters Panel */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'center', backgroundColor: '#FFFFFF', border: '0.5px solid var(--light-border)', padding: '16px 24px', borderRadius: '4px', marginBottom: '24px' }} className="rankings-control-panel">
          
          {/* Leaderboard Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('esg')}
              style={{
                padding: '10px 20px',
                border: 'none',
                background: activeTab === 'esg' ? '#0A0A0A' : 'none',
                color: activeTab === 'esg' ? '#FFFDF7' : 'var(--text-ink)',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '0px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              🍃 {t('ESG Leaders', 'ESG Leaders')}
            </button>
            <button
              onClick={() => setActiveTab('employees')}
              style={{
                padding: '10px 20px',
                border: 'none',
                background: activeTab === 'employees' ? '#0A0A0A' : 'none',
                color: activeTab === 'employees' ? '#FFFDF7' : 'var(--text-ink)',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '0px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              👥 {t('Largest Employers', 'Largest Employers')}
            </button>
            <button
              onClick={() => setActiveTab('revenue')}
              style={{
                padding: '10px 20px',
                border: 'none',
                background: activeTab === 'revenue' ? '#0A0A0A' : 'none',
                color: activeTab === 'revenue' ? '#FFFDF7' : 'var(--text-ink)',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '0px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              📊 {t('Revenue Leaders', 'Revenue Leaders')}
            </button>
          </div>

          {/* Quick Selection Dropdowns */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={14} style={{ color: 'var(--primary-red)' }} />
              <select
                value={industryFilter}
                onChange={e => setIndustryFilter(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid var(--light-border)', backgroundColor: '#FFFDF7', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}
              >
                <option value="All">{t('All Industries', 'All Industries')}</option>
                {INDUSTRIES.map(ind => <option key={ind} value={ind}>{t(ind, ind)}</option>)}
              </select>
            </div>
            
            <select
              value={cantonFilter}
              onChange={e => setCantonFilter(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid var(--light-border)', backgroundColor: '#FFFDF7', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}
            >
              <option value="All">{t('All Cantons', 'All Cantons')}</option>
              {CANTONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

        </div>

        {/* Main List Display */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div style={{ width: '40px', height: '40px', border: '2px solid var(--light-border)', borderTopColor: 'var(--primary-red)', borderRadius: '50%', animation: 'spin 1s infinite linear', margin: '0 auto 16px' }} />
            <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '16px', color: 'var(--text-charcoal)' }}>{t('Leaderboard data loading...', 'Leaderboard data loading...')}</p>
          </div>
        ) : sorted.length === 0 ? (
          <div style={{ backgroundColor: '#FFFFFF', border: '0.5px solid var(--light-border)', padding: '48px 24px', borderRadius: '4px', textAlign: 'center' }}>
            <p style={{ fontStyle: 'italic', color: 'var(--text-charcoal)' }}>{t('No companies match the chosen filters.', 'No companies match the chosen filters.')}</p>
          </div>
        ) : (
          <div style={{ backgroundColor: '#FFFFFF', border: '0.5px solid var(--light-border)', borderRadius: '4px', overflow: 'hidden' }}>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-ivory)', borderBottom: '1px solid var(--light-border)', color: 'var(--text-charcoal)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '16px 20px', width: '60px' }}>{t('Rank', 'Rank')}</th>
                    <th style={{ padding: '16px 20px' }}>{t('Company', 'Company')}</th>
                    <th style={{ padding: '16px 20px' }}>{t('Industry', 'Industry')}</th>
                    <th style={{ padding: '16px 20px', width: '90px', textAlign: 'center' }}>{t('Canton', 'Canton')}</th>
                    <th style={{ padding: '16px 20px', textAlign: 'right' }}>
                      {activeTab === 'esg' && t('ESG Rating', 'ESG Rating')}
                      {activeTab === 'employees' && t('Global Employees', 'Global Employees')}
                      {activeTab === 'revenue' && t('Gross Revenue', 'Gross Revenue')}
                    </th>
                    <th style={{ padding: '16px 20px', width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((company, index) => {
                    return (
                      <tr 
                        key={company.id}
                        onClick={() => selectCompany(company.id)}
                        style={{ borderBottom: '0.5px solid var(--light-border)', cursor: 'pointer', transition: 'background-color 0.2s', alignContent: 'center' }}
                        className="ranking-row"
                      >
                        {/* Rank Badge */}
                        <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                          {renderRankBadge(index)}
                        </td>

                        {/* Name and logo indicator */}
                        <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-ink)', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '28px', height: '28px', backgroundColor: company.logo_bg || '#1A365D', color: '#FFF', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px' }}>
                              {company.name ? company.name.charAt(0) : 'C'}
                            </div>
                            <span style={{ fontSize: '14px' }}>{t(company.name, company.name)}</span>
                            {company.verified === 1 && <ShieldCheck size={14} style={{ color: 'var(--accent-green)' }} />}
                            {company.premium === 1 && <Star size={12} style={{ color: '#D4AF37', fill: '#D4AF37' }} />}
                          </div>
                        </td>

                        {/* Industry */}
                        <td style={{ padding: '16px 20px', color: 'var(--text-charcoal)', verticalAlign: 'middle' }}>
                          {t(company.industry, company.industry)}
                        </td>

                        {/* Canton */}
                        <td style={{ padding: '16px 20px', textAlign: 'center', verticalAlign: 'middle' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, backgroundColor: 'var(--bg-ivory)', border: '0.5px solid var(--light-border)', padding: '2px 8px' }}>
                            {company.canton}
                          </span>
                        </td>

                        {/* Score Metric display */}
                        <td style={{ padding: '16px 20px', textAlign: 'right', verticalAlign: 'middle', fontWeight: 'bold', fontSize: '14px' }}>
                          {activeTab === 'esg' && (
                            <span style={{ color: (company.esg_rating >= 80) ? '#2E7D32' : 'var(--text-ink)' }}>
                              🍃 {company.esg_rating}/100
                            </span>
                          )}
                          {activeTab === 'employees' && (
                            <span style={{ color: 'var(--text-ink)', fontFamily: 'var(--font-mono)' }}>
                              {company.employees ? company.employees.toLocaleString() : 'N/A'}
                            </span>
                          )}
                          {activeTab === 'revenue' && (
                            <span style={{ color: 'var(--primary-red)', fontFamily: 'var(--font-mono)' }}>
                              {company.revenue_band || 'N/A'}
                            </span>
                          )}
                        </td>

                        {/* Hover Action */}
                        <td style={{ padding: '16px 20px', textAlign: 'center', verticalAlign: 'middle' }}>
                          <ArrowUpRight size={16} className="rank-row-arrow" style={{ color: 'var(--light-border)' }} />
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>
      
      <style>{`
        .ranking-row:hover {
          background-color: var(--bg-ivory);
        }
        .ranking-row:hover .rank-row-arrow {
          color: var(--primary-gold) !important;
        }
        @media (max-width: 768px) {
          .rankings-control-panel {
            grid-template-columns: 1fr !important;
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
