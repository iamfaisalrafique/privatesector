import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, Target, Award, Users } from 'lucide-react';

export default function About({ navigate }) {
  const { t, isRtl } = useLanguage();

  return (
    <div style={{ backgroundColor: 'var(--bg-ivory)', minHeight: 'calc(100vh - 120px)', padding: '40px 0 64px' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        
        {/* Breadcrumb */}
        <div style={{ fontSize: '12px', color: 'var(--text-charcoal)', marginBottom: '24px', display: 'flex', gap: '6px', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>{t('Home', 'Home')}</span>
          <span>/</span>
          <span style={{ fontWeight: 600, color: 'var(--text-ink)' }}>About Us</span>
        </div>

        {/* Editorial Header */}
        <div style={{ borderBottom: '2px solid #000', paddingBottom: '24px', marginBottom: '32px' }}>
          <span className="caps-label" style={{ color: 'var(--primary-red)', fontWeight: 700 }}>Our Mission</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '38px', fontWeight: 800, lineHeight: '1.2', color: 'var(--text-ink)', marginTop: '8px' }}>
            Bridging Swiss Precision and California Innovation
          </h1>
        </div>

        {/* Main Editorial Text */}
        <div style={{ fontSize: '16px', lineHeight: '1.8', color: 'var(--text-charcoal)', fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <p>
            Established in Zurich with operations expanding to Los Angeles, **privatesector.ch** serves as the authoritative source of truth for B2B relationships, trade indicators, and commercial directory structures between Switzerland and the United States.
          </p>
          <p>
            Our platform provides verified corporate data, market analyses, and trade reports, ensuring transparency and facilitating cross-border collaborations. With the recent inclusion of our Southern California Gateway, we are directly enabling a pipeline of technology, R&D capital, and structural investments between the two regions.
          </p>
        </div>

        {/* Core Pillars Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginTop: '40px', marginBottom: '40px' }}>
          <div style={{ backgroundColor: '#F9F9F9', border: '1px solid var(--light-border)', padding: '24px' }}>
            <ShieldCheck size={28} style={{ color: 'var(--primary-red)', marginBottom: '12px' }} />
            <strong style={{ display: 'block', fontSize: '15px', color: 'var(--text-ink)', marginBottom: '8px' }}>Verified Data</strong>
            <p style={{ fontSize: '12px', color: 'var(--text-charcoal)', lineHeight: '1.5' }}>Zefix-integrated registry checks and audit-trails for all premium business records.</p>
          </div>

          <div style={{ backgroundColor: '#F9F9F9', border: '1px solid var(--light-border)', padding: '24px' }}>
            <Target size={28} style={{ color: 'var(--primary-red)', marginBottom: '12px' }} />
            <strong style={{ display: 'block', fontSize: '15px', color: 'var(--text-ink)', marginBottom: '8px' }}>Focus Corridors</strong>
            <p style={{ fontSize: '12px', color: 'var(--text-charcoal)', lineHeight: '1.5' }}>Specialized hubs supporting high-tech, aerospace, and life science trade lanes.</p>
          </div>

          <div style={{ backgroundColor: '#F9F9F9', border: '1px solid var(--light-border)', padding: '24px' }}>
            <Users size={28} style={{ color: 'var(--primary-red)', marginBottom: '12px' }} />
            <strong style={{ display: 'block', fontSize: '15px', color: 'var(--text-ink)', marginBottom: '8px' }}>Bilateral Team</strong>
            <p style={{ fontSize: '12px', color: 'var(--text-charcoal)', lineHeight: '1.5' }}>Dual advisory boards active in Switzerland and Southern California.</p>
          </div>
        </div>

        {/* Call to Action */}
        <div style={{ backgroundColor: 'var(--primary-red)', color: '#FFF', padding: '32px', textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, marginBottom: '8px', color: '#FFF' }}>Become a Partner</h3>
          <p style={{ fontSize: '14px', marginBottom: '20px', color: 'rgba(255,255,255,0.9)' }}>Explore custom integrations, spotlight directories, and advisory networking panels.</p>
          <button 
            onClick={() => navigate('/contact')}
            className="btn" 
            style={{ backgroundColor: '#FFF', color: 'var(--primary-red)', fontWeight: 700 }}
          >
            Contact our Alliance Team
          </button>
        </div>

      </div>
    </div>
  );
}
