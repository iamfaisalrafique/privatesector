import React, { useState, useEffect } from 'react';
import { Landmark, AlertCircle, Network, TrendingUp, Users, Shield, Award, MapPin } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const CANTON_DATA = [
  { code: 'ZH', name: 'Zürich', count: '124\'820', gdp: '21.5%', color: 'var(--primary-red)' },
  { code: 'BE', name: 'Bern', count: '78\'410', gdp: '12.8%', color: '#003453' },
  { code: 'GE', name: 'Genf', count: '46\'950', gdp: '9.2%', color: '#8B0000' },
  { code: 'VD', name: 'Waadt', count: '42\'110', gdp: '8.7%', color: '#4A6741' },
  { code: 'BS', name: 'Basel-Stadt', count: '28\'730', gdp: '7.1%', color: '#D4AF37' },
  { code: 'ZG', name: 'Zug', count: '24\'550', gdp: '4.8%', color: '#5A5A5A' },
  { code: 'SG', name: 'St. Gallen', count: '22\'180', gdp: '4.2%', color: '#C5A059' },
  { code: 'AG', name: 'Aargau', count: '19\'400', gdp: '3.9%', color: '#2B4C7E' },
];

const INITIAL_REGISTER_EVENTS = [
  { id: 1, time: '2 mins ago', company: 'Roche Holding AG', canton: 'BS', action: 'Board Member mutation registered', type: 'mutation' },
  { id: 2, time: '5 mins ago', company: 'UBS Group AG', canton: 'ZH', action: 'Capital increase published in commercial register', type: 'capital' },
  { id: 3, time: '12 mins ago', company: 'Stadler Rail AG', canton: 'TG', action: 'Articles of association amendment approved', type: 'statutes' },
  { id: 4, time: '18 mins ago', company: 'Glencore International AG', canton: 'ZG', action: 'Power of attorney expired for 2 signatories', type: 'deletion' },
  { id: 5, time: '25 mins ago', company: 'Nestlé S.A.', canton: 'VD', action: 'New branch office registered in Vevey', type: 'new' },
  { id: 6, time: '35 mins ago', company: 'Swisscom AG', canton: 'BE', action: 'Branch office mutation', type: 'mutation' }
];

const MOCK_REGISTER_TEMPLATES = [
  { company: 'Novartis AG', canton: 'BS', action: 'Registration of a new trademark patent', type: 'patent' },
  { company: 'SGS SA', canton: 'GE', action: 'Amendment of articles and transfer of seat', type: 'statutes' },
  { company: 'Richemont SA', canton: 'GE', action: 'Board Chairman re-elected', type: 'mutation' },
  { company: 'Kühne + Nagel International AG', canton: 'SZ', action: 'Share capital newly CHF 120,000,000', type: 'capital' },
  { company: 'Swiss Re AG', canton: 'ZH', action: 'Change in signing authority', type: 'mutation' },
  { company: 'Holcim AG', canton: 'ZG', action: 'Merger with subsidiary approved', type: 'merger' }
];

export default function HomepageGraphics({ navigate }) {
  const { t } = useLanguage();
  const [registerEvents, setRegisterEvents] = useState(INITIAL_REGISTER_EVENTS);
  const [activeNetworkNode, setActiveNetworkNode] = useState(null);

  // Live Register Ticker Feed simulator
  useEffect(() => {
    const interval = setInterval(() => {
      const randomTemplate = MOCK_REGISTER_TEMPLATES[Math.floor(Math.random() * MOCK_REGISTER_TEMPLATES.length)];
      const newEvent = {
        id: Date.now(),
        time: 'Just now',
        company: randomTemplate.company,
        canton: randomTemplate.canton,
        action: randomTemplate.action,
        type: randomTemplate.type
      };
      
      setRegisterEvents(prev => {
        // Shift existing times
        const updatedPrev = prev.map((e, idx) => {
          if (e.time === 'Just now') return { ...e, time: '1 min ago' };
          if (e.time.startsWith('1 min')) return { ...e, time: '3 mins ago' };
          if (e.time.startsWith('2 mins')) return { ...e, time: '5 mins ago' };
          if (e.time.startsWith('5 mins')) return { ...e, time: '8 mins ago' };
          if (e.time.startsWith('12 mins')) return { ...e, time: '15 mins ago' };
          if (e.time.startsWith('18 mins')) return { ...e, time: '22 mins ago' };
          if (e.time.startsWith('25 mins')) return { ...e, time: '30 mins ago' };
          return e;
        });
        return [newEvent, ...updatedPrev.slice(0, 5)];
      });
    }, 9000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="homepage-graphics-section" style={{ marginTop: '64px' }}>
      
      {/* 2-Column Section: Canton Grid & Live Register Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }} className="graphics-main-row">
        
        {/* Canton Grid (Zefix style selector) */}
        <div 
          style={{ 
            backgroundColor: '#FFFFFF', 
            border: '0.5px solid var(--light-border)', 
            borderRadius: '6px', 
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <MapPin size={22} style={{ color: 'var(--primary-gold)' }} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, margin: 0 }}>
                {t('canton_distribution', 'Canton Distribution')}
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-charcoal)', lineHeight: 1.6, marginBottom: '24px' }}>
              {t('canton_desc', 'Explore Swiss companies by canton. Click on a canton to open the B2B index directly for that region.')}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {CANTON_DATA.map(canton => (
              <div 
                key={canton.code}
                onClick={() => navigate(`/unternehmen?canton=${canton.code}`)}
                className="canton-selector-card"
                style={{
                  border: '0.5px solid var(--light-border)',
                  padding: '16px',
                  borderRadius: '0px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  backgroundColor: 'var(--bg-ivory)',
                  transition: 'transform 0.2s, border-color 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 700, color: 'var(--text-ink)' }}>
                    {canton.code}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-charcoal)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {t(canton.name, canton.name)}
                  </span>
                </div>
                
                <div style={{ fontSize: '16px', fontWeight: 600, fontFamily: 'var(--font-sans)', color: 'var(--text-ink)', marginBottom: '8px' }}>
                  {canton.count} <span style={{ fontSize: '10px', color: 'var(--text-charcoal)', fontWeight: 400 }}>{t('companies_label', 'Companies')}</span>
                </div>

                {/* Density micro progress bar */}
                <div style={{ width: '100%', height: '3px', backgroundColor: 'rgba(232, 224, 200, 0.4)' }}>
                  <div 
                    style={{ 
                      width: canton.gdp, 
                      height: '100%', 
                      backgroundColor: 'var(--primary-gold)',
                      transition: 'width 0.3s ease'
                    }} 
                  />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '9px', color: 'var(--text-charcoal)' }}>
                  <span>{t('gdp_share', 'Swiss GDP Share:')}</span>
                  <span style={{ fontWeight: 600 }}>{canton.gdp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Commercial Register Feed (Moneyhouse style ticker) */}
        <div 
          style={{ 
            backgroundColor: '#FFFFFF', 
            border: '0.5px solid var(--light-border)', 
            borderRadius: '6px', 
            padding: '32px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Landmark size={22} style={{ color: 'var(--primary-gold)' }} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, margin: 0 }}>
                {t('register_live_title', 'Commercial Register Live Feed')}
              </h3>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div className="live-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-red)' }} />
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-red)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                LIVE
              </span>
            </div>
          </div>
          
          <p style={{ fontSize: '13px', color: 'var(--text-charcoal)', lineHeight: 1.6, marginBottom: '24px' }}>
            {t('register_live_desc', 'Real-time notifications from cantonal commercial register offices (Zefix / SOGC interface simulation).')}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            {registerEvents.map(event => (
              <div 
                key={event.id}
                className="ticker-item-fade"
                style={{
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'flex-start',
                  borderBottom: '0.5px solid var(--light-border)',
                  paddingBottom: '12px',
                  position: 'relative'
                }}
              >
                {/* Canton Badge */}
                <div 
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 700,
                    width: '32px',
                    height: '24px',
                    backgroundColor: 'var(--surface-warm)',
                    border: '0.5px solid var(--light-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-ink)',
                    marginTop: '2px'
                  }}
                >
                  {event.canton}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span 
                      style={{ 
                        fontFamily: 'var(--font-sans)', 
                        fontSize: '14px', 
                        fontWeight: 600, 
                        color: 'var(--text-ink)',
                        cursor: 'pointer'
                      }}
                      className="ticker-company-link"
                      onClick={() => navigate(`/unternehmen`)}
                    >
                      {event.company}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-charcoal)', fontFamily: 'var(--font-mono)' }}>
                      {t(event.time, event.time)}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-charcoal)', marginTop: '2px', lineHeight: 1.4 }}>
                    {t(event.action, event.action)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 2-Column Section B: Corporate Network Visualizer & Key B2B Indicators */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '40px', marginTop: '40px' }} className="graphics-secondary-row">
        
        {/* SVG Network Graph (North Data style) */}
        <div 
          style={{ 
            backgroundColor: '#FFFFFF', 
            border: '0.5px solid var(--light-border)', 
            borderRadius: '6px', 
            padding: '32px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Network size={22} style={{ color: 'var(--primary-gold)' }} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, margin: 0 }}>
                {t('network_title', 'Corporate Groups & Participations Map')}
              </h3>
          </div>
            <p style={{ fontSize: '13px', color: 'var(--text-charcoal)', lineHeight: 1.6, marginBottom: '24px' }}>
              {t('network_desc', 'Interactive visualization of corporate structures. Hover over an entity to reveal ownership relationships and voting rights.')}
            </p>

          {/* SVG Canvas Area */}
          <div 
            style={{ 
              backgroundColor: 'var(--bg-ivory)', 
              border: '0.5px solid var(--light-border)', 
              height: '340px', 
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 500 300" style={{ cursor: 'default' }}>
              {/* Connection Lines with gradients */}
              <line x1="250" y1="150" x2="100" y2="70" stroke={activeNetworkNode === 'genentech' ? 'var(--primary-red)' : '#E8E0C8'} strokeWidth={activeNetworkNode === 'genentech' ? 3 : 1.5} style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }} />
              <line x1="250" y1="150" x2="400" y2="70" stroke={activeNetworkNode === 'chugai' ? 'var(--primary-red)' : '#E8E0C8'} strokeWidth={activeNetworkNode === 'chugai' ? 3 : 1.5} style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }} />
              <line x1="250" y1="150" x2="120" y2="230" stroke={activeNetworkNode === 'diagnostics' ? 'var(--primary-red)' : '#E8E0C8'} strokeWidth={activeNetworkNode === 'diagnostics' ? 3 : 1.5} style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }} />
              <line x1="250" y1="150" x2="380" y2="230" stroke={activeNetworkNode === 'foundation' ? 'var(--primary-red)' : '#E8E0C8'} strokeWidth={activeNetworkNode === 'foundation' ? 3 : 1.5} style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }} />

              {/* Node 1: Center Parent (Roche Holding) */}
              <g 
                onMouseEnter={() => setActiveNetworkNode('roche')} 
                onMouseLeave={() => setActiveNetworkNode(null)}
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/unternehmen')}
              >
                <circle cx="250" cy="150" r="32" fill="#FFFFFF" stroke="#003453" strokeWidth="3" />
                <circle cx="250" cy="150" r="28" fill="rgba(0, 52, 83, 0.05)" />
                <text x="250" y="153" fontFamily="Inter" fontSize="10" fontWeight="bold" fill="#003453" textAnchor="middle">{t('Roche', 'Roche')}</text>
                <text x="250" y="163" fontFamily="Inter" fontSize="7" fill="var(--primary-red)" textAnchor="middle">{t('Holding AG', 'Holding AG')}</text>
              </g>

              {/* Node 2: Genentech */}
              <g 
                onMouseEnter={() => setActiveNetworkNode('genentech')} 
                onMouseLeave={() => setActiveNetworkNode(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle cx="100" cy="70" r="22" fill="#FFFFFF" stroke={activeNetworkNode === 'genentech' ? 'var(--primary-red)' : '#E8E0C8'} strokeWidth="2" style={{ transition: 'stroke 0.2s' }} />
                <text x="100" y="73" fontFamily="Inter" fontSize="8" fontWeight="600" fill="var(--text-ink)" textAnchor="middle">{t('Genentech', 'Genentech')}</text>
                <text x="100" y="81" fontFamily="JetBrains Mono" fontSize="6" fill="var(--text-charcoal)" textAnchor="middle">{t('100% (US)', '100% (US)')}</text>
              </g>

              {/* Node 3: Chugai */}
              <g 
                onMouseEnter={() => setActiveNetworkNode('chugai')} 
                onMouseLeave={() => setActiveNetworkNode(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle cx="400" cy="70" r="22" fill="#FFFFFF" stroke={activeNetworkNode === 'chugai' ? 'var(--primary-red)' : '#E8E0C8'} strokeWidth="2" style={{ transition: 'stroke 0.2s' }} />
                <text x="400" y="73" fontFamily="Inter" fontSize="8" fontWeight="600" fill="var(--text-ink)" textAnchor="middle">{t('Chugai', 'Chugai')}</text>
                <text x="400" y="81" fontFamily="JetBrains Mono" fontSize="6" fill="var(--text-charcoal)" textAnchor="middle">{t('61.5% (JP)', '61.5% (JP)')}</text>
              </g>

              {/* Node 4: Roche Diagnostics */}
              <g 
                onMouseEnter={() => setActiveNetworkNode('diagnostics')} 
                onMouseLeave={() => setActiveNetworkNode(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle cx="120" cy="230" r="22" fill="#FFFFFF" stroke={activeNetworkNode === 'diagnostics' ? 'var(--primary-red)' : '#E8E0C8'} strokeWidth="2" style={{ transition: 'stroke 0.2s' }} />
                <text x="120" y="233" fontFamily="Inter" fontSize="8" fontWeight="600" fill="var(--text-ink)" textAnchor="middle">{t('Diagnostics', 'Diagnostics')}</text>
                <text x="120" y="241" fontFamily="JetBrains Mono" fontSize="6" fill="var(--text-charcoal)" textAnchor="middle">{t('100% (CH)', '100% (CH)')}</text>
              </g>

              {/* Node 5: Foundation Medicine */}
              <g 
                onMouseEnter={() => setActiveNetworkNode('foundation')} 
                onMouseLeave={() => setActiveNetworkNode(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle cx="380" cy="230" r="22" fill="#FFFFFF" stroke={activeNetworkNode === 'foundation' ? 'var(--primary-red)' : '#E8E0C8'} strokeWidth="2" style={{ transition: 'stroke 0.2s' }} />
                <text x="380" y="233" fontFamily="Inter" fontSize="8" fontWeight="600" fill="var(--text-ink)" textAnchor="middle">{t('Foundation', 'Foundation')}</text>
                <text x="380" y="241" fontFamily="JetBrains Mono" fontSize="6" fill="var(--text-charcoal)" textAnchor="middle">{t('100% (US)', '100% (US)')}</text>
              </g>
            </svg>

            {/* Graphic dynamic detail hover panel */}
            <div 
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                right: '12px',
                backgroundColor: 'rgba(255, 253, 247, 0.95)',
                border: '0.5px solid var(--light-border)',
                padding: '12px 16px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                justifyContent: 'space-between',
                transition: 'opacity 0.2s'
              }}
            >
              <div>
                <strong style={{ color: 'var(--text-ink)', fontFamily: 'var(--font-sans)', display: 'block' }}>
                  {activeNetworkNode === 'roche' && t('Roche Holding AG (Parent Company)', 'Roche Holding AG (Parent Company)')}
                  {activeNetworkNode === 'genentech' && t('Genentech Inc. (San Francisco, USA)', 'Genentech Inc. (San Francisco, USA)')}
                  {activeNetworkNode === 'chugai' && t('Chugai Pharmaceutical Co., Ltd. (Tokyo, Japan)', 'Chugai Pharmaceutical Co., Ltd. (Tokyo, Japan)')}
                  {activeNetworkNode === 'diagnostics' && t('Roche Diagnostics International AG (Rotkreuz, CH)', 'Roche Diagnostics International AG (Rotkreuz, CH)')}
                  {activeNetworkNode === 'foundation' && t('Foundation Medicine Inc. (Cambridge, USA)', 'Foundation Medicine Inc. (Cambridge, USA)')}
                  {!activeNetworkNode && t('Focus a node to see details', 'Focus a node to see details')}
                </strong>
                <span style={{ color: 'var(--text-charcoal)', fontSize: '11px' }}>
                  {activeNetworkNode === 'roche' && t('Consolidates 273,000 employees worldwide.', 'Consolidates 273,000 employees worldwide.')}
                  {activeNetworkNode === 'genentech' && t('100% owned. R&D center for oncology.', '100% owned. R&D center for oncology.')}
                  {activeNetworkNode === 'chugai' && t('Strategic partnership (61.5% capital shares).', 'Strategic partnership (61.5% capital shares).')}
                  {activeNetworkNode === 'diagnostics' && t('Central Swiss production and development site.', 'Central Swiss production and development site.')}
                  {activeNetworkNode === 'foundation' && t('Acquisition 2018. Genomic profiling.', 'Acquisition 2018. Genomic profiling.')}
                  {!activeNetworkNode && t('Shows ownership chains and direct participations.', 'Shows ownership chains and direct participations.')}
                </span>
              </div>
              
              {activeNetworkNode && (
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <Shield size={14} style={{ color: 'var(--accent-green)' }} />
                  <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--accent-green)', textTransform: 'uppercase' }}>{t('Zefix Verified', 'Zefix Verified')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Key Indicators / Radial charts */}
        <div 
          style={{ 
            backgroundColor: '#FFFFFF', 
            border: '0.5px solid var(--light-border)', 
            borderRadius: '6px', 
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <TrendingUp size={22} style={{ color: 'var(--primary-gold)' }} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, margin: 0 }}>
                {t('market_indicators', 'Swiss Market Indicators')}
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-charcoal)', lineHeight: 1.6, marginBottom: '24px' }}>
              {t('market_indicators_desc', 'Key economic figures and trust indices of registered Swiss corporations.')}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, justifyContent: 'center' }}>
            
            {/* Stat Card 1: B2B trust index */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              {/* Mini SVG Radial Progress */}
              <div style={{ width: '50px', height: '50px', position: 'relative' }}>
                <svg width="50" height="50" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(232, 224, 200, 0.4)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--primary-red)" strokeWidth="3" strokeDasharray="94 6" strokeDashoffset="25" />
                </svg>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  94%
                </div>
              </div>
              
              <div>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-charcoal)', display: 'block', fontWeight: 600 }}>
                  {t('stat_b2b_trust_title', 'B2B Trust Index (Verified)')}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-ink)', lineHeight: 1.4 }}>
                  {t('stat_b2b_trust_desc', '94% of all premium profiles have fully verified Zefix dossiers.')}
                </span>
              </div>
            </div>

            {/* Stat Card 2: ESG sustainability scorecard rates */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              {/* Mini SVG Radial Progress */}
              <div style={{ width: '50px', height: '50px', position: 'relative' }}>
                <svg width="50" height="50" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(232, 224, 200, 0.4)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#4A6741" strokeWidth="3" strokeDasharray="78 22" strokeDashoffset="25" />
                </svg>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#4A6741' }}>
                  78%
                </div>
              </div>

              <div>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-charcoal)', display: 'block', fontWeight: 600 }}>
                  {t('stat_sustainability_title', 'Sustainability Reporting')}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-ink)', lineHeight: 1.4 }}>
                  {t('stat_sustainability_desc', '78% of the top 100 Swiss corporations have validated ESG scores above 75/100.')}
                </span>
              </div>
            </div>

            {/* Stat Card 3: GDP validation */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              {/* Mini SVG Radial Progress */}
              <div style={{ width: '50px', height: '50px', position: 'relative' }}>
                <svg width="50" height="50" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(232, 224, 200, 0.4)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#003453" strokeWidth="3" strokeDasharray="85 15" strokeDashoffset="25" />
                </svg>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#003453' }}>
                  85%
                </div>
              </div>

              <div>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-charcoal)', display: 'block', fontWeight: 600 }}>
                  {t('stat_rd_title', 'R&D Location Attractiveness')}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-ink)', lineHeight: 1.4 }}>
                  {t('stat_rd_desc', '85% of Swiss R&D hubs receive top ratings for tax frameworks.')}
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>

      <style>{`
        .canton-selector-card:hover {
          transform: translateY(-2px);
          border-color: var(--primary-gold) !important;
        }
        .ticker-item-fade {
          animation: itemFadeIn 0.5s ease-out;
        }
        .ticker-company-link:hover {
          color: var(--primary-gold) !important;
          text-decoration: underline;
        }
        @keyframes itemFadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .live-pulse {
          animation: pulseRed 2s infinite;
        }
        @keyframes pulseRed {
          0% {
            transform: scale(0.9);
            box-shadow: 0 0 0 0 rgba(139, 0, 0, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 5px rgba(139, 0, 0, 0);
          }
          100% {
            transform: scale(0.9);
            box-shadow: 0 0 0 0 rgba(139, 0, 0, 0);
          }
        }
        @media (max-width: 900px) {
          .graphics-main-row, .graphics-secondary-row {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
      `}</style>

    </div>
  );
}
