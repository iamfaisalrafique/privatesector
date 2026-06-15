import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ArrowRight, Search, Landmark } from 'lucide-react';

export default function Hero({ navigate }) {
  const { t, isRtl } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const stats = [
    { value: "500'000+", label: "Companies" },
    { value: "26", label: "Cantons" },
    { value: "CHF 4'200'000M", label: "GDP" },
    { value: "18", label: "Languages" },
    { value: "50'000+", label: "Readers" }
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/unternehmen?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleQuickSearch = (term) => {
    navigate(`/unternehmen?search=${encodeURIComponent(term)}`);
  };

  return (
    <div 
      style={{ 
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F9F9F9 100%)', 
        borderBottom: '1.5px solid rgba(213, 43, 30, 0.15)',
        position: 'relative',
        overflow: 'hidden',
        color: 'var(--text-ink)'
      }}
    >
      {/* Delicate Network Connections SVG Background */}
      <svg 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          zIndex: 1, 
          opacity: 0.35, 
          pointerEvents: 'none' 
        }}
      >
        <defs>
          <radialGradient id="dotGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--primary-red)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Network connections */}
        <circle cx="10%" cy="20%" r="2" fill="#000000" />
        <circle cx="15%" cy="45%" r="3" fill="var(--primary-red)" />
        <circle cx="8%" cy="70%" r="1.5" fill="#000000" />
        
        <circle cx="85%" cy="15%" r="2.5" fill="var(--primary-red)" />
        <circle cx="92%" cy="50%" r="1.5" fill="#000000" />
        <circle cx="88%" cy="80%" r="3" fill="#000000" />

        <line x1="10%" y1="20%" x2="15%" y2="45%" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
        <line x1="15%" y1="45%" x2="8%" y2="70%" stroke="rgba(213,43,30,0.12)" strokeWidth="1" />
        
        <line x1="85%" y1="15%" x2="92%" y2="50%" stroke="rgba(213,43,30,0.08)" strokeWidth="1" />
        <line x1="92%" y1="50%" x2="88%" y2="80%" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />

        {/* Decorative soft glow paths */}
        <circle cx="15%" cy="45%" r="60" fill="url(#dotGrad)" />
        <circle cx="88%" cy="80%" r="70" fill="url(#dotGrad)" />
      </svg>

      {/* Hero Body */}
      <div 
        className="container"
        style={{
          paddingTop: '96px',
          paddingBottom: '96px',
          position: 'relative',
          zIndex: 2
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '48px', alignItems: 'center', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
          
          {/* Left Column - 60% */}
          <div style={{ flex: '1 1 550px', textAlign: isRtl ? 'right' : 'left' }}>
            <span 
              className="caps-label" 
              style={{ 
                display: 'block', 
                fontSize: '12px', 
                letterSpacing: '0.15em', 
                marginBottom: '16px',
                color: 'var(--primary-red)',
                fontWeight: 600
              }}
            >
              🇨🇭 Switzerland's Private Sector Platform
            </span>
            
            <h1 
              style={{
                fontSize: '56px',
                fontFamily: 'var(--font-display)',
                lineHeight: 1.15,
                color: '#000000',
                marginBottom: '20px',
                fontWeight: 700
              }}
            >
              The Swiss Private <br />
              Sector, <span style={{ color: 'var(--primary-red)', fontStyle: 'italic' }}>Unified.</span>
            </h1>
            
            <p 
              style={{
                fontSize: '17px',
                color: 'var(--text-charcoal)',
                fontFamily: 'var(--font-sans)',
                lineHeight: 1.6,
                marginBottom: '32px',
                maxWidth: '520px'
              }}
            >
              {t('hero_subtitle', "Access premium insights, verified B2B data, and the latest news on Swiss enterprises.")}
            </p>

            {/* Dossier search form */}
            <form 
              onSubmit={handleSearchSubmit}
              style={{
                display: 'flex',
                maxWidth: '520px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--light-border)',
                padding: '6px',
                borderRadius: '0px',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '14px',
                boxShadow: '0 4px 20px rgba(0, 52, 83, 0.05)'
              }}
            >
              <Search size={18} style={{ color: 'var(--primary-red)', marginLeft: '12px' }} />
              <input 
                type="text"
                placeholder="Firma suchen (z.B. Nestlé, Roche, UBS)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  fontFamily: 'var(--font-sans)',
                  color: 'var(--text-ink)',
                  padding: '8px 0'
                }}
              />
              <button 
                type="submit"
                className="btn btn-gold-fill"
                style={{
                  minHeight: '38px',
                  height: '38px',
                  padding: '0 20px',
                  fontSize: '13px'
                }}
              >
                Suchen
              </button>
            </form>

            {/* Quick searches */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '36px', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-charcoal)' }}>Beliebte Suchen:</span>
              {['Nestlé', 'Roche', 'UBS', 'Stadler Rail'].map(term => (
                <span 
                  key={term}
                  onClick={() => handleQuickSearch(term)}
                  className="quick-search-link"
                  style={{
                    color: '#000000',
                    cursor: 'pointer',
                    fontWeight: 600,
                    textDecoration: 'underline'
                  }}
                >
                  {term}
                </span>
              ))}
            </div>
            
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: isRtl ? 'flex-end' : 'flex-start' }}>
              <button 
                onClick={() => navigate('/unternehmen')}
                className="btn btn-gold-fill"
                style={{ display: 'flex', gap: '8px', padding: '14px 28px', fontSize: '14px' }}
              >
                <span>{t('button_browse', 'Browse Companies')}</span>
                <ArrowRight size={16} />
              </button>
              
              <button 
                onClick={() => navigate('/news')}
                className="btn btn-gold-outline"
                style={{ padding: '14px 28px', fontSize: '14px' }}
              >
                {t('button_latest_news', 'Latest News')}
              </button>
            </div>
          </div>

          {/* Right Column - 40% (Overlapping Card Stack - Moneyhouse style) */}
          <div 
            style={{ 
              flex: '1 1 350px', 
              position: 'relative', 
              height: '380px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Third Card (Rolex - Back) */}
            <div 
              style={{
                position: 'absolute',
                width: '280px',
                backgroundColor: '#FFFFFF',
                border: '0.5px solid var(--light-border)',
                borderTop: '3px solid var(--primary-red)',
                borderRadius: '6px',
                padding: '20px',
                transform: 'translate(-25px, -25px) rotate(-4deg)',
                zIndex: 1,
                opacity: 0.65,
                color: '#1A1A1A',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)'
              }}
            >
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ width: '24px', height: '24px', backgroundColor: '#114D30', borderRadius: '2px' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '14px' }}>Rolex SA</span>
              </div>
              <div style={{ width: '40%', height: '6px', backgroundColor: '#F5F0E8' }} />
            </div>

            {/* Second Card (Roche - Middle) */}
            <div 
              style={{
                position: 'absolute',
                width: '280px',
                backgroundColor: '#FFFFFF',
                border: '0.5px solid var(--light-border)',
                borderTop: '3px solid var(--primary-red)',
                borderRadius: '6px',
                padding: '20px',
                transform: 'translate(15px, 15px) rotate(3deg)',
                zIndex: 2,
                opacity: 0.85,
                color: '#1A1A1A',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.04)'
              }}
            >
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ width: '24px', height: '24px', backgroundColor: '#0066CC', borderRadius: '2px' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '14px' }}>Roche Holding</span>
              </div>
              <div style={{ width: '50%', height: '6px', backgroundColor: '#F5F0E8' }} />
            </div>

            {/* Top Card (Nestlé - Front) */}
            <div 
              style={{
                position: 'absolute',
                width: '290px',
                backgroundColor: '#FFFFFF',
                border: '0.5px solid var(--light-border)',
                borderTop: '3px solid var(--primary-red)',
                borderRadius: '6px',
                padding: '24px',
                transform: 'translate(0px, 0px) rotate(-1deg)',
                zIndex: 3,
                color: '#1A1A1A',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}
              className="hero-top-card"
            >
              <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                <span className="badge badge-verified" style={{ fontSize: '9px', padding: '2px 6px' }}>✓ Premium</span>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ width: '36px', height: '36px', backgroundColor: '#1A365D', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 'bold', fontSize: '14px' }}>N</div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: '#1A1A1A', fontWeight: 600 }}>Nestlé S.A.</h3>
                  <span style={{ fontSize: '11px', color: '#5A5A5A' }}>Canton VD · Consumer Goods</span>
                </div>
              </div>

              <p style={{ fontSize: '12px', color: '#5A5A5A', lineHeight: 1.5, marginBottom: '20px' }}>
                The world's largest food & beverage company. Headquartered in Vevey.
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '0.5px solid #E8E0C8', paddingTop: '16px', fontSize: '11px' }}>
                <div>
                  <span style={{ color: '#5A5A5A', display: 'block', fontSize: '9px', textTransform: 'uppercase' }}>FOUNDED</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary-red)' }}>1866</span>
                </div>
                <div>
                  <span style={{ color: '#5A5A5A', display: 'block', fontSize: '9px', textTransform: 'uppercase' }}>REVENUE</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary-red)' }}>CHF 93'000M</span>
                </div>
                <div>
                  <span style={{ color: '#5A5A5A', display: 'block', fontSize: '9px', textTransform: 'uppercase' }}>EMPLOYEES</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary-red)' }}>273'000</span>
                </div>
              </div>
            </div>
            
          </div>
          
        </div>
      </div>

      {/* Bottom Ticker Stats Strip */}
      <div 
        style={{
          backgroundColor: '#000000',
          padding: '16px 0',
          borderTop: '1.5px solid var(--primary-red)'
        }}
      >
        <div 
          className="container"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          {stats.map((st, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span 
                style={{ 
                  fontFamily: 'var(--font-mono)', 
                  color: '#FFFFFF', 
                  fontSize: '16px', 
                  fontWeight: 700 
                }}
              >
                {st.value}
              </span>
              <span 
                style={{ 
                  color: 'var(--primary-red)', 
                  fontFamily: 'var(--font-sans)', 
                  fontSize: '11px', 
                  fontWeight: 600,
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em'
                }}
              >
                {st.label}
              </span>
              {idx < stats.length - 1 && (
                <span style={{ color: 'rgba(255, 255, 255, 0.2)', marginLeft: '16px' }} className="desktop-only">·</span>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <style>{`
        .hero-top-card:hover {
          transform: translate(0px, -12px) rotate(0deg) !important;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15) !important;
        }
        .quick-search-link:hover {
          color: var(--primary-red) !important;
        }
      `}</style>
    </div>
  );
}
