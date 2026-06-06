import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ArrowRight } from 'lucide-react';

export default function Hero({ navigate }) {
  const { t, isRtl } = useLanguage();

  const stats = [
    { value: "500'000+", label: "Companies" },
    { value: "26", label: "Cantons" },
    { value: "CHF 4'200'000M", label: "GDP" },
    { value: "18", label: "Languages" },
    { value: "50'000+", label: "Readers" }
  ];

  return (
    <div 
      style={{ 
        backgroundColor: '#0A0A0A', 
        borderBottom: '1.5px solid rgba(191, 155, 48, 0.2)',
        position: 'relative',
        overflow: 'hidden',
        color: '#FFFFFF'
      }}
    >
      {/* Hero Body */}
      <div 
        className="container"
        style={{
          paddingTop: '80px',
          paddingBottom: '80px',
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
                color: '#BF9B30'
              }}
            >
              🇨🇭 Switzerland's Private Sector Platform
            </span>
            
            <h1 
              style={{
                fontSize: '60px',
                fontFamily: '"Playfair Display", Georgia, serif',
                lineHeight: 1.15,
                color: '#FFFDF7',
                marginBottom: '24px',
                fontWeight: 700
              }}
            >
              The Swiss Private <br />
              Sector, <span style={{ color: '#BF9B30', fontStyle: 'italic' }}>Unified.</span>
            </h1>
            
            <p 
              style={{
                fontSize: '18px',
                color: '#888888',
                fontFamily: 'Inter, sans-serif',
                lineHeight: 1.6,
                marginBottom: '36px',
                maxWidth: '480px'
              }}
            >
              {t('hero_subtitle', "Access premium insights, verified B2B data, and the latest news on Swiss enterprises.")}
            </p>
            
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
                className="btn btn-dark-outline"
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
                border: '0.5px solid #E8E0C8',
                borderTop: '3px solid #BF9B30',
                borderRadius: '6px',
                padding: '20px',
                transform: 'translate(-25px, -25px) rotate(-4deg)',
                zIndex: 1,
                opacity: 0.6,
                color: '#1A1A1A'
              }}
            >
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ width: '24px', height: '24px', backgroundColor: '#114D30', borderRadius: '2px' }} />
                <span style={{ fontFamily: '"Playfair Display", serif', fontWeight: 600, fontSize: '14px' }}>Rolex SA</span>
              </div>
              <div style={{ width: '40%', height: '6px', backgroundColor: '#F5F0E8' }} />
            </div>

            {/* Second Card (Roche - Middle) */}
            <div 
              style={{
                position: 'absolute',
                width: '280px',
                backgroundColor: '#FFFFFF',
                border: '0.5px solid #E8E0C8',
                borderTop: '3px solid #BF9B30',
                borderRadius: '6px',
                padding: '20px',
                transform: 'translate(15px, 15px) rotate(3deg)',
                zIndex: 2,
                opacity: 0.8,
                color: '#1A1A1A'
              }}
            >
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ width: '24px', height: '24px', backgroundColor: '#0066CC', borderRadius: '2px' }} />
                <span style={{ fontFamily: '"Playfair Display", serif', fontWeight: 600, fontSize: '14px' }}>Roche Holding</span>
              </div>
              <div style={{ width: '50%', height: '6px', backgroundColor: '#F5F0E8' }} />
            </div>

            {/* Top Card (Nestlé - Front) */}
            <div 
              style={{
                position: 'absolute',
                width: '290px',
                backgroundColor: '#FFFFFF',
                border: '0.5px solid #E8E0C8',
                borderTop: '3px solid #BF9B30',
                borderRadius: '6px',
                padding: '24px',
                transform: 'translate(0px, 0px) rotate(-1deg)',
                zIndex: 3,
                color: '#1A1A1A',
                transition: 'transform 0.3s ease'
              }}
              className="hero-top-card"
            >
              <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                <span className="badge badge-verified" style={{ fontSize: '9px', padding: '2px 6px' }}>✓ Premium</span>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ width: '36px', height: '36px', backgroundColor: '#1A365D', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 'bold', fontSize: '14px' }}>N</div>
                <div>
                  <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '16px', color: '#1A1A1A', fontWeight: 600 }}>Nestlé S.A.</h3>
                  <span style={{ fontSize: '11px', color: '#5A5A5A' }}>Canton VD · Consumer Goods</span>
                </div>
              </div>

              <p style={{ fontSize: '12px', color: '#5A5A5A', lineHeight: 1.5, marginBottom: '20px' }}>
                The world's largest food & beverage company. Headquartered in Vevey.
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '0.5px solid #E8E0C8', paddingTop: '16px', fontSize: '11px' }}>
                <div>
                  <span style={{ color: '#5A5A5A', display: 'block', fontSize: '9px', textTransform: 'uppercase' }}>FOUNDED</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#BF9B30' }}>1866</span>
                </div>
                <div>
                  <span style={{ color: '#5A5A5A', display: 'block', fontSize: '9px', textTransform: 'uppercase' }}>REVENUE</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#BF9B30' }}>CHF 93'000M</span>
                </div>
                <div>
                  <span style={{ color: '#5A5A5A', display: 'block', fontSize: '9px', textTransform: 'uppercase' }}>EMPLOYEES</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#BF9B30' }}>273'000</span>
                </div>
              </div>
            </div>
            
          </div>
          
        </div>
      </div>

      {/* Bottom Ticker Stats Strip */}
      <div 
        style={{
          backgroundColor: '#BF9B30',
          padding: '16px 0',
          borderTop: '0.5px solid rgba(255, 255, 255, 0.2)'
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
                  color: '#1A1A1A', 
                  fontSize: '16px', 
                  fontWeight: 700 
                }}
              >
                {st.value}
              </span>
              <span 
                style={{ 
                  color: '#1A1A1A', 
                  fontFamily: 'Inter, sans-serif', 
                  fontSize: '11px', 
                  fontWeight: 500,
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em'
                }}
              >
                {st.label}
              </span>
              {idx < stats.length - 1 && (
                <span style={{ color: '#1A1A1A', opacity: 0.3, marginLeft: '16px' }} className="desktop-only">·</span>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <style>{`
        .hero-top-card:hover {
          transform: translate(0px, -8px) rotate(0deg) !important;
        }
      `}</style>
    </div>
  );
}
