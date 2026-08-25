import React, { useState, useEffect } from 'react';
import CompanyCard from '../../../shared/components/CompanyCard';
import AdSlot from '../../../shared/components/AdSlot';
import { Search, Map, Filter, ChevronDown, ChevronUp, CheckSquare, Square, Grid, List, Sparkles, Building2, ArrowRight, Clock, Calendar, Bookmark, MapPin, Tag } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import SeoHead from '../../../shared/components/SeoHead';

const CANTONS = [
  'ZH', 'BE', 'LU', 'UR', 'SZ', 'OW', 'NW', 'GL', 'ZG', 'FR', 'SO', 'BS', 'BL', 'SH',
  'AR', 'AI', 'SG', 'GR', 'AG', 'TG', 'TI', 'VD', 'VS', 'NE', 'GE', 'JU'
];

const INDUSTRIES = [
  'Consumer Goods',
  'Pharmaceuticals',
  'Financial Services',
  'Luxury Goods',
  'Manufacturing',
  'Technology',
  'Commodities'
];

export const SwissFlagIcon = ({ size = 18, style = {} }) => (
  <svg 
    width={size} 
    height={Math.round(size * 0.75)} 
    viewBox="0 0 32 24" 
    style={{ borderRadius: '2px', display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
  >
    <rect width="32" height="24" fill="#D52B1E" />
    <rect x="13" y="4" width="6" height="16" fill="#FFFFFF" />
    <rect x="7" y="9" width="18" height="6" fill="#FFFFFF" />
  </svg>
);

export default function Directory({ 
  initialSearch = '', 
  initialCanton = '', 
  initialIndustry = '', 
  initialCountry = '', 
  initialTab = '', 
  initialTag = '', 
  selectCompany, 
  navigate 
}) {
  const { t } = useLanguage();
  const [companies, setCompanies] = useState([]);
  const [hiddenSwissArticles, setHiddenSwissArticles] = useState([]);
  const [activeTab, setActiveTab] = useState(initialTab || (initialTag === 'Hidden Swiss' ? 'hidden-swiss' : 'all'));
  const [searchVal, setSearchVal] = useState(initialSearch);
  const [selectedCantons, setSelectedCantons] = useState(initialCanton ? initialCanton.split(',') : []);
  const [selectedIndustries, setSelectedIndustries] = useState(initialIndustry ? initialIndustry.split(',') : []);
  const [sizeClass, setSizeClass] = useState('All');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [ecoOnly, setEcoOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  const [cantonsExpanded, setCantonsExpanded] = useState(!!initialCanton);
  const [industriesExpanded, setIndustriesExpanded] = useState(true);
  const [sizeExpanded, setSizeExpanded] = useState(true);

  // 1. Fetch Companies
  useEffect(() => {
    async function fetchFilteredCompanies() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchVal) params.append('search', searchVal);
        if (selectedCantons.length > 0) params.append('canton', selectedCantons.join(','));
        if (selectedIndustries.length > 0) params.append('industry', selectedIndustries.join(','));
        if (sizeClass !== 'All') params.append('size', sizeClass);
        if (verifiedOnly) params.append('verified', 'true');

        const res = await fetch(`/api/companies?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setCompanies(data);
        }
      } catch (e) {
        console.error('Error fetching companies:', e);
      } finally {
        setLoading(false);
      }
    }

    const delayDebounce = setTimeout(() => {
      fetchFilteredCompanies();
    }, 150);

    return () => clearTimeout(delayDebounce);
  }, [searchVal, selectedCantons, selectedIndustries, sizeClass, verifiedOnly]);

  // 2. Fetch Hidden Swiss News Articles
  useEffect(() => {
    async function fetchHiddenSwissArticles() {
      setLoadingArticles(true);
      try {
        const res = await fetch('/api/news');
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list)) {
            const hiddenSwiss = list.filter(art => {
              const tags = Array.isArray(art.tags) 
                ? art.tags 
                : (typeof art.tags === 'string' ? JSON.parse(art.tags || '[]') : []);
              const tagMatch = tags.some(tag => 
                typeof tag === 'string' && (
                  tag.toLowerCase().includes('hidden swiss') || 
                  tag.toLowerCase() === 'crevoisier sa' || 
                  tag.toLowerCase() === 'yalosys ag' ||
                  tag.toLowerCase().includes('swiss precision')
                )
              );
              const titleMatch = (art.title || '').toLowerCase().includes('hidden in the jura') || 
                                 (art.title || '').toLowerCase().includes('tiny company in zug') ||
                                 (art.content_body || '').toLowerCase().includes('hidden swiss');
              return tagMatch || titleMatch;
            });
            setHiddenSwissArticles(hiddenSwiss);
          }
        }
      } catch (e) {
        console.error('Error loading Hidden Swiss articles:', e);
      } finally {
        setLoadingArticles(false);
      }
    }
    fetchHiddenSwissArticles();
  }, []);

  useEffect(() => {
    setSearchVal(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    if (initialCanton) {
      setSelectedCantons(initialCanton.split(','));
      setCantonsExpanded(true);
    } else {
      setSelectedCantons([]);
    }
  }, [initialCanton]);

  useEffect(() => {
    if (initialIndustry) {
      setSelectedIndustries(initialIndustry.split(','));
      setIndustriesExpanded(true);
    } else {
      setSelectedIndustries([]);
    }
  }, [initialIndustry]);

  const handleCantonToggle = (canton) => {
    setSelectedCantons(prev => 
      prev.includes(canton) ? prev.filter(c => c !== canton) : [...prev, canton]
    );
  };

  const handleIndustryToggle = (ind) => {
    setSelectedIndustries(prev => 
      prev.includes(ind) ? prev.filter(i => i !== ind) : [...prev, ind]
    );
  };

  const handleResetAll = () => {
    setSearchVal('');
    setSelectedCantons([]);
    setSelectedIndustries([]);
    setSizeClass('All');
    setVerifiedOnly(false);
    setEcoOnly(false);
  };

  const filteredCompanies = ecoOnly 
    ? companies.filter(c => c.esg_rating >= 80)
    : companies;

  // Filter Hidden Swiss articles with active search term
  const filteredHiddenArticles = hiddenSwissArticles.filter(art => {
    if (!searchVal.trim()) return true;
    const query = searchVal.toLowerCase();
    const titleMatch = (art.title || '').toLowerCase().includes(query);
    const subtitleMatch = (art.subtitle || '').toLowerCase().includes(query);
    const bodyMatch = (art.content_body || '').toLowerCase().includes(query);
    const tags = Array.isArray(art.tags) ? art.tags : [];
    const tagMatch = tags.some(t => typeof t === 'string' && t.toLowerCase().includes(query));
    return titleMatch || subtitleMatch || bodyMatch || tagMatch;
  });

  return (
    <div style={{ backgroundColor: 'var(--bg-ivory)', minHeight: 'calc(100vh - 120px)' }}>
      <SeoHead
        title="Switzerland Companies & Hidden Champions Directory"
        description="Comprehensive Swiss company directory and Hidden Swiss corporate intelligence — exploring precision engineering, advanced manufacturing, and enterprise leaders."
        type="website"
      />

      {/* Top Breadcrumbs & Leaderboard Zone A */}
      <div className="container" style={{ paddingTop: '24px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-charcoal)', marginBottom: '16px', display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>{t('Home', 'Home')}</span>
          <span>/</span>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/unternehmen')}>{t('Switzerland', 'Switzerland')}</span>
          <span>/</span>
          <span style={{ fontWeight: 600, color: 'var(--text-ink)' }}>{t('Swiss Companies', 'Swiss Companies')}</span>
        </div>
        <AdSlot position="A" />
      </div>

      {/* Hero Header Section */}
      <div className="container" style={{ marginTop: '24px', marginBottom: '32px' }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '0.5px solid var(--light-border)',
          borderRadius: '8px',
          padding: '32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ maxWidth: '820px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <SwissFlagIcon size={20} />
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary-red)' }}>
                  SWITZERLAND COMPANY SECTION & INTELLIGENCE
                </span>
              </div>
              <h1 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '34px', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--text-ink)', lineHeight: 1.2 }}>
                Swiss Companies & Hidden Champions
              </h1>
              <p style={{ fontSize: '15px', color: 'var(--text-charcoal)', lineHeight: 1.6, margin: 0 }}>
                Authoritative directory and investigative intelligence on Swiss enterprises — from global corporate titans in Zurich, Basel, and Geneva to the family-owned precision champions hidden across Jura, Zug, and St. Gallen.
              </p>
            </div>

            {/* Quick Stats Banner */}
            <div style={{ display: 'flex', gap: '20px', backgroundColor: 'var(--bg-ivory)', padding: '16px 24px', borderRadius: '6px', border: '1px solid var(--light-border)' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-charcoal)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Hidden Swiss</span>
                <strong style={{ fontSize: '24px', color: 'var(--primary-red)', fontFamily: 'var(--font-mono)' }}>
                  {hiddenSwissArticles.length} Stories
                </strong>
              </div>
              <div style={{ width: '1px', backgroundColor: 'var(--light-border)' }} />
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-charcoal)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Verified B2B</span>
                <strong style={{ fontSize: '24px', color: 'var(--text-ink)', fontFamily: 'var(--font-mono)' }}>
                  {companies.length}+ Entities
                </strong>
              </div>
            </div>
          </div>

          {/* Section Navigation Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '28px', borderTop: '1px solid var(--light-border)', paddingTop: '20px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('all')}
              style={{
                padding: '10px 20px',
                borderRadius: '4px',
                border: activeTab === 'all' ? '1px solid var(--primary-red)' : '1px solid var(--light-border)',
                backgroundColor: activeTab === 'all' ? '#FFF5F5' : '#FFFFFF',
                color: activeTab === 'all' ? 'var(--primary-red)' : 'var(--text-ink)',
                fontWeight: 600,
                fontSize: '13.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
            >
              <SwissFlagIcon size={16} />
              <span>All Swiss Companies & Intelligence</span>
            </button>

            <button
              onClick={() => setActiveTab('hidden-swiss')}
              style={{
                padding: '10px 20px',
                borderRadius: '4px',
                border: activeTab === 'hidden-swiss' ? '1px solid var(--primary-red)' : '1px solid var(--light-border)',
                backgroundColor: activeTab === 'hidden-swiss' ? '#FFF5F5' : '#FFFFFF',
                color: activeTab === 'hidden-swiss' ? 'var(--primary-red)' : 'var(--text-ink)',
                fontWeight: 600,
                fontSize: '13.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
            >
              <Sparkles size={16} style={{ color: 'var(--primary-red)' }} />
              <span>⭐ Hidden Swiss Champions ({hiddenSwissArticles.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('directory')}
              style={{
                padding: '10px 20px',
                borderRadius: '4px',
                border: activeTab === 'directory' ? '1px solid var(--primary-red)' : '1px solid var(--light-border)',
                backgroundColor: activeTab === 'directory' ? '#FFF5F5' : '#FFFFFF',
                color: activeTab === 'directory' ? 'var(--primary-red)' : 'var(--text-ink)',
                fontWeight: 600,
                fontSize: '13.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
            >
              <Building2 size={16} style={{ color: 'var(--text-charcoal)' }} />
              <span>🏢 Verified Enterprise Directory</span>
            </button>
          </div>
        </div>
      </div>

      {/* Large Search Box */}
      <div className="container" style={{ marginBottom: '32px' }}>
        <div 
          style={{ 
            backgroundColor: '#FFFFFF',
            border: '0.5px solid var(--light-border)',
            borderRadius: '6px',
            padding: '16px',
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}
        >
          <div style={{ position: 'relative', flex: 1 }}>
            <input 
              type="text" 
              placeholder={t('Search Swiss companies or Hidden Champions (e.g. Crevoisier, Yalosys, Nestlé, Jura)...', 'Search Swiss companies or Hidden Champions (e.g. Crevoisier, Yalosys, Nestlé, Jura)...')} 
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="input-field"
              style={{ 
                paddingLeft: '44px', 
                borderRadius: '0px', 
                height: '52px', 
                fontSize: '15px', 
                borderColor: 'var(--light-border)',
                outline: 'none'
              }}
            />
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--primary-red)' }} />
          </div>
          <button 
            className="btn btn-gold-fill" 
            style={{ height: '52px', padding: '0 32px', fontSize: '15px' }}
          >
            {t('Suchen', 'Suchen')}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. DEDICATED HIDDEN SWISS SHOWCASE SECTION (Visible on 'all' and 'hidden-swiss') */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'hidden-swiss') && (
        <div className="container" style={{ marginBottom: '48px' }}>
          <div style={{
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            borderRadius: '8px',
            padding: '36px 32px',
            border: '1px solid #1E293B',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px', borderBottom: '1px solid #334155', paddingBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ 
                    backgroundColor: 'var(--primary-red)', 
                    color: '#FFFFFF', 
                    fontSize: '11px', 
                    fontWeight: 700, 
                    padding: '3px 8px', 
                    borderRadius: '3px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase'
                  }}>
                    🇨🇭 HIDDEN SWISS SERIES
                  </span>
                  <span style={{ color: '#94A3B8', fontSize: '12px', fontWeight: 500 }}>
                    Specialist Depth & Precision Champions
                  </span>
                </div>
                <h2 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '28px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                  Behind the Big Names: The Hidden Swiss Champions
                </h2>
                <p style={{ color: '#94A3B8', fontSize: '14px', marginTop: '6px', maxWidth: '750px', lineHeight: 1.5 }}>
                  We know the famous Swiss giants. PrivateSector goes deeper into the workshops and high-tech cleanrooms where Switzerland’s true industrial backbone is built.
                </p>
              </div>

              <button 
                onClick={() => navigate('/news')}
                style={{ 
                  backgroundColor: 'transparent',
                  border: '1px solid #475569',
                  color: '#F8FAFC',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>View News Archives</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Articles Grid */}
            {loadingArticles ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8' }}>
                <div style={{ width: '32px', height: '32px', border: '2px solid #334155', borderTopColor: 'var(--primary-red)', borderRadius: '50%', animation: 'spin 1s infinite linear', margin: '0 auto 12px' }} />
                <span>Loading Hidden Swiss intelligence...</span>
              </div>
            ) : filteredHiddenArticles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#1E293B', borderRadius: '6px' }}>
                <p style={{ color: '#94A3B8', margin: 0 }}>No Hidden Swiss articles match your current search.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
                {filteredHiddenArticles.map(art => {
                  const tags = Array.isArray(art.tags) 
                    ? art.tags 
                    : (typeof art.tags === 'string' ? JSON.parse(art.tags || '[]') : []);

                  // Detect canton tag
                  const cantonTag = tags.find(t => typeof t === 'string' && (t.toLowerCase().includes('canton') || t.toLowerCase() === 'zug' || t.toLowerCase() === 'jura'));

                  return (
                    <div 
                      key={art.id}
                      onClick={() => navigate(`/news/${art.slug || art.id}`)}
                      style={{
                        backgroundColor: '#1E293B',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.borderColor = 'var(--primary-red)';
                        e.currentTarget.style.boxShadow = '0 12px 24px -6px rgba(0, 0, 0, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = '#334155';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Image Thumbnail */}
                      <div style={{ position: 'relative', height: '200px', width: '100%', overflow: 'hidden', backgroundColor: '#0B0F19' }}>
                        {art.image_url ? (
                          <img 
                            src={art.image_url} 
                            alt={art.title} 
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800';
                            }}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#334155' }}>
                            <Building2 size={36} style={{ color: '#64748B' }} />
                          </div>
                        )}
                        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
                          <span style={{ backgroundColor: 'rgba(213, 43, 30, 0.95)', color: '#FFFFFF', padding: '3px 8px', borderRadius: '3px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em' }}>
                            🇨🇭 HIDDEN SWISS
                          </span>
                          {cantonTag && (
                            <span style={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)', color: '#F1F5F9', padding: '3px 8px', borderRadius: '3px', fontSize: '11px', fontWeight: 600 }}>
                              📍 {cantonTag}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content Body */}
                      <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '11px', color: '#F87171', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                              {art.category || 'Advanced Manufacturing'}
                            </span>
                            <span style={{ fontSize: '11px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={12} />
                              {art.read_time_mins || 4} min read
                            </span>
                          </div>

                          <h3 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '19px', color: '#FFFFFF', margin: '0 0 10px 0', fontWeight: 700, lineHeight: 1.35 }}>
                            {art.title}
                          </h3>

                          <p style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.55, margin: '0 0 16px 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {art.subtitle}
                          </p>

                          {/* Key tags */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                            {tags.slice(0, 4).map((t, idx) => (
                              <span key={idx} style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#94A3B8', padding: '2px 8px', borderRadius: '12px', fontSize: '11px' }}>
                                #{t}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Card Footer Button */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #334155', paddingTop: '16px' }}>
                          <span style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} />
                            {art.date_published}
                          </span>
                          <span style={{ color: '#EF4444', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>Read Full Dossier</span>
                            <ArrowRight size={14} />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. VERIFIED ENTERPRISE DIRECTORY & CANTON FILTER SECTION */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'directory') && (
        <div className="container" style={{ paddingBottom: '64px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid var(--light-border)', paddingBottom: '12px', marginBottom: '28px' }}>
            <div>
              <span className="caps-label" style={{ color: 'var(--primary-red)', fontWeight: 700, fontSize: '11px', display: 'block', marginBottom: '2px' }}>
                CANTON & INDUSTRY B2B REGISTER
              </span>
              <h2 style={{ fontSize: '24px', fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, margin: 0, color: 'var(--text-ink)' }}>
                Swiss Corporate Directory & Verification Database
              </h2>
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text-charcoal)' }}>
              {filteredCompanies.length} {filteredCompanies.length === 1 ? t('Eintrag gefunden', 'Eintrag gefunden') : t('Einträge gefunden', 'Einträge gefunden')}
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
            
            {/* Left Filter Sidebar - 280px */}
            <div style={{ flex: '0 0 280px', width: '280px' }} className="filter-sidebar">
              <div 
                style={{ 
                  border: '0.5px solid var(--light-border)', 
                  backgroundColor: '#FFFFFF',
                  borderRadius: '6px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '0.5px solid var(--light-border)', paddingBottom: '12px' }}>
                  <Filter size={18} style={{ color: 'var(--primary-red)' }} />
                  <h3 style={{ fontSize: '17px', fontFamily: '"Playfair Display", serif', color: 'var(--text-ink)', margin: 0, fontWeight: 700 }}>{t('Filterpanel', 'Filterpanel')}</h3>
                </div>

                {/* Verified Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span className="caps-label" style={{ color: 'var(--text-ink)', fontSize: '11px', fontWeight: 600 }}>{t('Verified Only', 'Verified Only')}</span>
                  <button
                    onClick={() => setVerifiedOnly(!verifiedOnly)}
                    style={{
                      width: '40px',
                      height: '22px',
                      borderRadius: '0px',
                      backgroundColor: verifiedOnly ? 'var(--accent-green)' : 'var(--surface-warm)',
                      border: '0.5px solid var(--light-border)',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <div 
                      style={{
                        width: '14px',
                        height: '14px',
                        backgroundColor: verifiedOnly ? '#FFFFFF' : 'var(--text-charcoal)',
                        position: 'absolute',
                        top: '3px',
                        left: verifiedOnly ? '22px' : '4px',
                        transition: 'left 0.2s'
                      }}
                    />
                  </button>
                </div>

                {/* Eco-Leader Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderTop: '0.5px solid var(--light-border)', paddingTop: '12px' }}>
                  <span className="caps-label" style={{ color: 'var(--text-ink)', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>🍃 {t('Eco-Leader Only', 'Eco-Leader Only')}</span>
                  <button
                    onClick={() => setEcoOnly(!ecoOnly)}
                    style={{
                      width: '40px',
                      height: '22px',
                      borderRadius: '0px',
                      backgroundColor: ecoOnly ? '#2E7D32' : 'var(--surface-warm)',
                      border: '0.5px solid var(--light-border)',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <div 
                      style={{
                        width: '14px',
                        height: '14px',
                        backgroundColor: ecoOnly ? '#FFFFFF' : 'var(--text-charcoal)',
                        position: 'absolute',
                        top: '3px',
                        left: ecoOnly ? '22px' : '4px',
                        transition: 'left 0.2s'
                      }}
                    />
                  </button>
                </div>

                {/* Canton Filter */}
                <div>
                  <div className="filter-header" onClick={() => setCantonsExpanded(!cantonsExpanded)}>
                    <span className="caps-label" style={{ color: 'var(--text-ink)' }}>{t('Kanton', 'Kanton')} ({CANTONS.length})</span>
                    {cantonsExpanded ? <ChevronUp size={16} style={{ color: 'var(--primary-red)' }} /> : <ChevronDown size={16} style={{ color: 'var(--primary-red)' }} />}
                  </div>
                  {cantonsExpanded && (
                    <div style={{ maxHeight: '180px', overflowY: 'auto', marginTop: '8px', paddingRight: '4px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {CANTONS.map(canton => {
                          const isChecked = selectedCantons.includes(canton);
                          return (
                            <div 
                              key={canton} 
                              onClick={() => handleCantonToggle(canton)}
                              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: isChecked ? 'var(--text-ink)' : 'var(--text-charcoal)' }}
                            >
                              {isChecked ? <CheckSquare size={14} style={{ color: 'var(--primary-red)' }} /> : <Square size={14} style={{ color: 'var(--light-border)' }} />}
                              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: isChecked ? 600 : 400 }}>{canton}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Industry Filter */}
                <div>
                  <div className="filter-header" onClick={() => setIndustriesExpanded(!industriesExpanded)}>
                    <span className="caps-label" style={{ color: 'var(--text-ink)' }}>{t('Industrie', 'Industrie')} ({INDUSTRIES.length})</span>
                    {industriesExpanded ? <ChevronUp size={16} style={{ color: 'var(--primary-red)' }} /> : <ChevronDown size={16} style={{ color: 'var(--primary-red)' }} />}
                  </div>
                  {industriesExpanded && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                      {INDUSTRIES.map(ind => {
                        const isChecked = selectedIndustries.includes(ind);
                        return (
                          <div 
                            key={ind} 
                            onClick={() => handleIndustryToggle(ind)}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: isChecked ? 'var(--text-ink)' : 'var(--text-charcoal)' }}
                          >
                            {isChecked ? <CheckSquare size={14} style={{ color: 'var(--primary-red)' }} /> : <Square size={14} style={{ color: 'var(--light-border)' }} />}
                            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: isChecked ? 600 : 400 }}>{ind}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Size Filter */}
                <div>
                  <div className="filter-header" onClick={() => setSizeExpanded(!sizeExpanded)}>
                    <span className="caps-label" style={{ color: 'var(--text-ink)' }}>{t('Firmengrösse', 'Firmengrösse')}</span>
                    {sizeExpanded ? <ChevronUp size={16} style={{ color: 'var(--primary-red)' }} /> : <ChevronDown size={16} style={{ color: 'var(--primary-red)' }} />}
                  </div>
                  {sizeExpanded && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                      {['All', 'Small', 'Medium', 'Large'].map(size => (
                        <label key={size} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: sizeClass === size ? 'var(--text-ink)' : 'var(--text-charcoal)' }}>
                          <input 
                            type="radio" 
                            name="sizeClass" 
                            value={size} 
                            checked={sizeClass === size}
                            onChange={() => setSizeClass(size)}
                            style={{ accentColor: 'var(--primary-red)' }}
                          />
                          <span>{size === 'All' ? t('Alle Grössen', 'Alle Grössen') : `${t(size, size)} ${t('Enterprise', 'Enterprise')}`}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reset Filters Link */}
                <div style={{ borderTop: '0.5px solid var(--light-border)', paddingTop: '16px', marginTop: '8px', textAlign: 'center' }}>
                  <button 
                    onClick={handleResetAll} 
                    style={{ background: 'none', border: 'none', color: '#8B0000', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                  >
                    {t('Filter zurücksetzen', 'Filter zurücksetzen')}
                  </button>
                </div>

              </div>

              {/* Sidebar Sticky Ad Block - Zone C */}
              <AdSlot position="C" />
            </div>

            {/* Main Content Area - Grid */}
            <div style={{ flex: 1, minWidth: '320px' }}>
              {/* Sort Bar + Grid/List Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '0.5px solid var(--light-border)', paddingBottom: '12px' }}>
                <span className="caps-label" style={{ color: 'var(--text-ink)', fontWeight: 600 }}>
                  {filteredCompanies.length} {filteredCompanies.length === 1 ? t('Eintrag gefunden', 'Eintrag gefunden') : t('Einträge gefunden', 'Einträge gefunden')}
                </span>
                
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-charcoal)' }}>{t('Ansicht:', 'Ansicht:')}</span>
                  <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--surface-warm)', padding: '2px', borderRadius: '4px' }}>
                    <button 
                      onClick={() => setViewMode('grid')}
                      style={{ 
                        background: viewMode === 'grid' ? '#FFFFFF' : 'none', 
                        border: 'none', 
                        padding: '4px', 
                        cursor: 'pointer',
                        borderRadius: '3px',
                        color: viewMode === 'grid' ? 'var(--primary-red)' : 'var(--text-charcoal)' 
                      }}
                    >
                      <Grid size={16} />
                    </button>
                    <button 
                      onClick={() => setViewMode('list')}
                      style={{ 
                        background: viewMode === 'list' ? '#FFFFFF' : 'none', 
                        border: 'none', 
                        padding: '4px', 
                        cursor: 'pointer',
                        borderRadius: '3px',
                        color: viewMode === 'list' ? 'var(--primary-red)' : 'var(--text-charcoal)' 
                      }}
                    >
                      <List size={16} />
                    </button>
                  </div>
                </div>
              </div>
  
              {loading ? (
                <div style={{ textAlign: 'center', padding: '64px 0' }}>
                  <div style={{ width: '40px', height: '40px', border: '2px solid var(--light-border)', borderTopColor: 'var(--primary-red)', borderRadius: '50%', animation: 'spin 1s infinite linear', margin: '0 auto 16px' }} />
                  <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '18px', color: 'var(--text-charcoal)' }}>{t('Firmendaten werden geladen...', 'Firmendaten werden geladen...')}</p>
                </div>
              ) : filteredCompanies.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 24px', border: '0.5px solid var(--light-border)', borderRadius: '6px', backgroundColor: '#FFFFFF' }}>
                  <Map size={48} style={{ color: 'var(--primary-red)', margin: '0 auto 16px', opacity: 0.6 }} />
                  <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '22px', color: 'var(--text-ink)', marginBottom: '8px' }}>{t('Keine Ergebnisse gefunden', 'Keine Ergebnisse gefunden')}</h3>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: 'var(--text-charcoal)', maxWidth: '400px', margin: '0 auto' }}>
                    {t('Es wurden keine Unternehmen gefunden, die den gewählten Filtern entsprechen. Setzen Sie die Filter zurück oder passen Sie die Suche an.', 'Es wurden keine Unternehmen gefunden, die den gewählten Filtern entsprechen. Setzen Sie die Filter zurück oder passen Sie die Suche an.')}
                  </p>
                  <button 
                    className="btn btn-gold-fill" 
                    style={{ marginTop: '24px', fontSize: '12px' }}
                    onClick={handleResetAll}
                  >
                    {t('Filter zurücksetzen', 'Filter zurücksetzen')}
                  </button>
                </div>
              ) : (
                <div>
                  <div 
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: viewMode === 'grid' 
                        ? 'repeat(auto-fill, minmax(285px, 1fr))' 
                        : '1fr', 
                      gap: '24px' 
                    }}
                  >
                    {filteredCompanies.map((company, index) => {
                      const cardElement = (
                        <CompanyCard 
                          key={company.id} 
                          company={company} 
                          onClick={() => selectCompany(company.id)} 
                        />
                      );
  
                      // Inject Zone F Spotlight Ad every 9th card
                      if ((index + 1) % 9 === 0) {
                        return (
                          <React.Fragment key={`slot-${index}`}>
                            {cardElement}
                            <AdSlot position="F" />
                          </React.Fragment>
                        );
                      }
  
                      return cardElement;
                    })}
                  </div>

                  {/* Editorial Pagination */}
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '48px', borderTop: '0.5px solid var(--light-border)', paddingTop: '24px' }}>
                    <button className="btn btn-gold-outline" style={{ minHeight: '36px', padding: '6px 16px', fontSize: '12px', opacity: 0.5, cursor: 'not-allowed' }} disabled>
                      {t('← Zurück', '← Zurück')}
                    </button>
                    <span style={{ fontSize: '13px', color: 'var(--text-charcoal)', fontFamily: 'var(--font-mono)' }}>
                      {t('Seite', 'Seite')} <strong style={{ color: 'var(--text-ink)' }}>1</strong> {t('von', 'von')} 1
                    </span>
                    <button className="btn btn-gold-outline" style={{ minHeight: '36px', padding: '6px 16px', fontSize: '12px', opacity: 0.5, cursor: 'not-allowed' }} disabled>
                      {t('Vorwärts →', 'Vorwärts →')}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .filter-sidebar {
            flex: 0 0 100% !important;
            width: 100% !important;
            margin-bottom: 24px;
          }
        }
      `}</style>
    </div>
  );
}
