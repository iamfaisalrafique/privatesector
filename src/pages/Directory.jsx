import React, { useState, useEffect } from 'react';
import CompanyCard from '../components/CompanyCard';
import AdSlot from '../components/AdSlot';
import { Search, Map, Filter, ChevronDown, ChevronUp, CheckSquare, Square, Grid, List } from 'lucide-react';

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

export default function Directory({ initialSearch = '', initialCanton = '', initialIndustry = '', selectCompany }) {
  const [companies, setCompanies] = useState([]);
  const [searchVal, setSearchVal] = useState(initialSearch);
  const [selectedCantons, setSelectedCantons] = useState(initialCanton ? initialCanton.split(',') : []);
  const [selectedIndustries, setSelectedIndustries] = useState(initialIndustry ? initialIndustry.split(',') : []);
  const [sizeClass, setSizeClass] = useState('All');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [ecoOnly, setEcoOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  const [cantonsExpanded, setCantonsExpanded] = useState(!!initialCanton);
  const [industriesExpanded, setIndustriesExpanded] = useState(true);
  const [sizeExpanded, setSizeExpanded] = useState(true);

  const filteredCompanies = ecoOnly 
    ? companies.filter(c => c.esg_rating >= 80)
    : companies;

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

  return (
    <div style={{ backgroundColor: 'var(--bg-ivory)', minHeight: 'calc(100vh - 120px)' }}>
      {/* Top Breadcrumbs & Leaderboard Zone A */}
      <div className="container" style={{ paddingTop: '24px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-charcoal)', marginBottom: '16px', display: 'flex', gap: '6px' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => window.location.hash = '#'}>Home</span>
          <span>/</span>
          <span style={{ fontWeight: 600, color: 'var(--text-ink)' }}>Directory</span>
        </div>
        <AdSlot position="A" />
      </div>

      {/* Large Zefix-style Search Box */}
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
              placeholder="Firma suchen (z.B. Nestlé, Roche)..." 
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="input-field"
              style={{ 
                paddingLeft: '44px', 
                borderRadius: '0px', 
                height: '56px', 
                fontSize: '16px', 
                borderColor: 'var(--light-border)',
                outline: 'none'
              }}
            />
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '18px', color: '#BF9B30' }} />
          </div>
          <button 
            className="btn btn-gold-fill" 
            style={{ height: '56px', padding: '0 32px', fontSize: '15px' }}
          >
            Suchen
          </button>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '64px' }}>
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
                <Filter size={18} style={{ color: '#BF9B30' }} />
                <h2 style={{ fontSize: '18px', fontFamily: '"Playfair Display", serif', color: 'var(--text-ink)', margin: 0, fontWeight: 700 }}>Filterpanel</h2>
              </div>

              {/* Verified Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
                <span className="caps-label" style={{ color: 'var(--text-ink)', fontSize: '11px', fontWeight: 600 }}>Verified Only</span>
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
                <span className="caps-label" style={{ color: 'var(--text-ink)', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>🍃 Eco-Leader Only</span>
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
                  <span className="caps-label" style={{ color: 'var(--text-ink)' }}>Kanton ({CANTONS.length})</span>
                  {cantonsExpanded ? <ChevronUp size={16} style={{ color: '#BF9B30' }} /> : <ChevronDown size={16} style={{ color: '#BF9B30' }} />}
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
                            {isChecked ? <CheckSquare size={14} style={{ color: '#BF9B30' }} /> : <Square size={14} style={{ color: 'var(--light-border)' }} />}
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
                  <span className="caps-label" style={{ color: 'var(--text-ink)' }}>Industrie ({INDUSTRIES.length})</span>
                  {industriesExpanded ? <ChevronUp size={16} style={{ color: '#BF9B30' }} /> : <ChevronDown size={16} style={{ color: '#BF9B30' }} />}
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
                          {isChecked ? <CheckSquare size={14} style={{ color: '#BF9B30' }} /> : <Square size={14} style={{ color: 'var(--light-border)' }} />}
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
                  <span className="caps-label" style={{ color: 'var(--text-ink)' }}>Firmengrösse</span>
                  {sizeExpanded ? <ChevronUp size={16} style={{ color: '#BF9B30' }} /> : <ChevronDown size={16} style={{ color: '#BF9B30' }} />}
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
                          style={{ accentColor: '#BF9B30' }}
                        />
                        <span>{size === 'All' ? 'Alle Grössen' : `${size} Enterprise`}</span>
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
                  Filter zurücksetzen
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
                {filteredCompanies.length} {filteredCompanies.length === 1 ? 'Eintrag' : 'Einträge'} gefunden
              </span>
              
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-charcoal)' }}>Ansicht:</span>
                <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--surface-warm)', padding: '2px', borderRadius: '4px' }}>
                  <button 
                    onClick={() => setViewMode('grid')}
                    style={{ 
                      background: viewMode === 'grid' ? '#FFFFFF' : 'none', 
                      border: 'none', 
                      padding: '4px', 
                      cursor: 'pointer',
                      borderRadius: '3px',
                      color: viewMode === 'grid' ? '#BF9B30' : 'var(--text-charcoal)' 
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
                      color: viewMode === 'list' ? '#BF9B30' : 'var(--text-charcoal)' 
                    }}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>
 
            {loading ? (
              <div style={{ textAlign: 'center', padding: '64px 0' }}>
                <div style={{ width: '40px', height: '40px', border: '2px solid var(--light-border)', borderTopColor: '#BF9B30', borderRadius: '50%', animation: 'spin 1s infinite linear', margin: '0 auto 16px' }} />
                <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '18px', color: 'var(--text-charcoal)' }}>Firmendaten werden geladen...</p>
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 24px', border: '0.5px solid var(--light-border)', borderRadius: '6px', backgroundColor: '#FFFFFF' }}>
                <Map size={48} style={{ color: '#BF9B30', margin: '0 auto 16px', opacity: 0.6 }} />
                <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '22px', color: 'var(--text-ink)', marginBottom: '8px' }}>Keine Ergebnisse gefunden</h3>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: 'var(--text-charcoal)', maxWidth: '400px', margin: '0 auto' }}>
                  Es wurden keine Unternehmen gefunden, die den gewählten Filtern entsprechen. Setzen Sie die Filter zurück oder passen Sie die Suche an.
                </p>
                <button 
                  className="btn btn-gold-fill" 
                  style={{ marginTop: '24px', fontSize: '12px' }}
                  onClick={handleResetAll}
                >
                  Filter zurücksetzen
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

                {/* Minimal Editorial Pagination */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '48px', borderTop: '0.5px solid var(--light-border)', paddingTop: '24px' }}>
                  <button className="btn btn-gold-outline" style={{ minHeight: '36px', padding: '6px 16px', fontSize: '12px', opacity: 0.5, cursor: 'not-allowed' }} disabled>
                    ← Zurück
                  </button>
                  <span style={{ fontSize: '13px', color: 'var(--text-charcoal)', fontFamily: 'var(--font-mono)' }}>
                    Seite <strong style={{ color: 'var(--text-ink)' }}>1</strong> von 1
                  </span>
                  <button className="btn btn-gold-outline" style={{ minHeight: '36px', padding: '6px 16px', fontSize: '12px', opacity: 0.5, cursor: 'not-allowed' }} disabled>
                    Vorwärts →
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
      
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
