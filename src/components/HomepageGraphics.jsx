import React, { useState, useEffect } from 'react';
import { Landmark, AlertCircle, Network, TrendingUp, Users, Shield, Award, MapPin } from 'lucide-react';

const CANTON_DATA = [
  { code: 'ZH', name: 'Zürich', count: '124\'820', gdp: '21.5%', color: '#BF9B30' },
  { code: 'BE', name: 'Bern', count: '78\'410', gdp: '12.8%', color: '#003453' },
  { code: 'GE', name: 'Genf', count: '46\'950', gdp: '9.2%', color: '#8B0000' },
  { code: 'VD', name: 'Waadt', count: '42\'110', gdp: '8.7%', color: '#4A6741' },
  { code: 'BS', name: 'Basel-Stadt', count: '28\'730', gdp: '7.1%', color: '#D4AF37' },
  { code: 'ZG', name: 'Zug', count: '24\'550', gdp: '4.8%', color: '#5A5A5A' },
  { code: 'SG', name: 'St. Gallen', count: '22\'180', gdp: '4.2%', color: '#C5A059' },
  { code: 'AG', name: 'Aargau', count: '19\'400', gdp: '3.9%', color: '#2B4C7E' },
];

const INITIAL_REGISTER_EVENTS = [
  { id: 1, time: 'Vor 2 Min.', company: 'Roche Holding AG', canton: 'BS', action: 'VR-Mitglied Mutation eingetragen', type: 'mutation' },
  { id: 2, time: 'Vor 5 Min.', company: 'UBS Group AG', canton: 'ZH', action: 'Kapitalerhöhung im Handelsregister publiziert', type: 'capital' },
  { id: 3, time: 'Vor 12 Min.', company: 'Stadler Rail AG', canton: 'TG', action: 'Statutenänderung genehmigt', type: 'statutes' },
  { id: 4, time: 'Vor 18 Min.', company: 'Glencore International AG', canton: 'ZG', action: 'Prokura erloschen für 2 Zeichnungsberechtigte', type: 'deletion' },
  { id: 5, time: 'Vor 25 Min.', company: 'Nestlé S.A.', canton: 'VD', action: 'Neue Zweigniederlassung registriert in Vevey', type: 'new' },
  { id: 6, time: 'Vor 35 Min.', company: 'Swisscom AG', canton: 'BE', action: 'Zweigniederlassung Mutation', type: 'mutation' }
];

const MOCK_REGISTER_TEMPLATES = [
  { company: 'Novartis AG', canton: 'BS', action: 'Eintragung eines neuen Markenpatents', type: 'patent' },
  { company: 'SGS SA', canton: 'GE', action: 'Statutenänderung und Sitzverlegung', type: 'statutes' },
  { company: 'Richemont SA', canton: 'GE', action: 'VR-Präsident wiedergewählt', type: 'mutation' },
  { company: 'Kühne + Nagel International AG', canton: 'SZ', action: 'Aktienkapital neu CHF 120\'000\'000', type: 'capital' },
  { company: 'Swiss Re AG', canton: 'ZH', action: 'Veränderung der Zeichnungsberechtigung', type: 'mutation' },
  { company: 'Holcim AG', canton: 'ZG', action: 'Verschmelzung mit Tochtergesellschaft genehmigt', type: 'merger' }
];

export default function HomepageGraphics({ navigate }) {
  const [registerEvents, setRegisterEvents] = useState(INITIAL_REGISTER_EVENTS);
  const [activeNetworkNode, setActiveNetworkNode] = useState(null);

  // Live Register Ticker Feed simulator
  useEffect(() => {
    const interval = setInterval(() => {
      const randomTemplate = MOCK_REGISTER_TEMPLATES[Math.floor(Math.random() * MOCK_REGISTER_TEMPLATES.length)];
      const newEvent = {
        id: Date.now(),
        time: 'Gerade eben',
        company: randomTemplate.company,
        canton: randomTemplate.canton,
        action: randomTemplate.action,
        type: randomTemplate.type
      };
      
      setRegisterEvents(prev => {
        // Shift existing times
        const updatedPrev = prev.map((e, idx) => {
          if (e.time === 'Gerade eben') return { ...e, time: 'Vor 1 Min.' };
          if (e.time.startsWith('Vor 1 Min.')) return { ...e, time: 'Vor 3 Min.' };
          if (e.time.startsWith('Vor 2')) return { ...e, time: 'Vor 5 Min.' };
          if (e.time.startsWith('Vor 5')) return { ...e, time: 'Vor 8 Min.' };
          if (e.time.startsWith('Vor 12')) return { ...e, time: 'Vor 15 Min.' };
          if (e.time.startsWith('Vor 18')) return { ...e, time: 'Vor 22 Min.' };
          if (e.time.startsWith('Vor 25')) return { ...e, time: 'Vor 30 Min.' };
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
                Kantonale Verteilung
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-charcoal)', lineHeight: 1.6, marginBottom: '24px' }}>
              Erkunden Sie Schweizer Unternehmen nach Kanton. Klicken Sie auf einen Kanton, um den B2B-Index direkt für diese Region zu öffnen.
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
                    {canton.name}
                  </span>
                </div>
                
                <div style={{ fontSize: '16px', fontWeight: 600, fontFamily: 'var(--font-sans)', color: 'var(--text-ink)', marginBottom: '8px' }}>
                  {canton.count} <span style={{ fontSize: '10px', color: 'var(--text-charcoal)', fontWeight: 400 }}>Firmen</span>
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
                  <span>Schweizer BIP Anteil:</span>
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
                Handelsregister Live-Meldungen
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
            Echtzeit-Meldungen der kantonalen Handelsregisterämter (Zefix / SOGC Schnittstellen-Simulation).
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
                      {event.time}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-charcoal)', marginTop: '2px', lineHeight: 1.4 }}>
                    {event.action}
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
              Konzerne & Beteiligungen Mapping
            </h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-charcoal)', lineHeight: 1.6, marginBottom: '24px' }}>
            Interaktive Visualisierung von Firmenstrukturen. Bewegen Sie den Mauszeiger über eine Einheit, um Eigentumsverhältnisse und Stimmrechtsanteile aufzudecken.
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
              <line x1="250" y1="150" x2="100" y2="70" stroke={activeNetworkNode === 'genentech' ? '#BF9B30' : '#E8E0C8'} strokeWidth={activeNetworkNode === 'genentech' ? 3 : 1.5} style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }} />
              <line x1="250" y1="150" x2="400" y2="70" stroke={activeNetworkNode === 'chugai' ? '#BF9B30' : '#E8E0C8'} strokeWidth={activeNetworkNode === 'chugai' ? 3 : 1.5} style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }} />
              <line x1="250" y1="150" x2="120" y2="230" stroke={activeNetworkNode === 'diagnostics' ? '#BF9B30' : '#E8E0C8'} strokeWidth={activeNetworkNode === 'diagnostics' ? 3 : 1.5} style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }} />
              <line x1="250" y1="150" x2="380" y2="230" stroke={activeNetworkNode === 'foundation' ? '#BF9B30' : '#E8E0C8'} strokeWidth={activeNetworkNode === 'foundation' ? 3 : 1.5} style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }} />

              {/* Node 1: Center Parent (Roche Holding) */}
              <g 
                onMouseEnter={() => setActiveNetworkNode('roche')} 
                onMouseLeave={() => setActiveNetworkNode(null)}
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/unternehmen')}
              >
                <circle cx="250" cy="150" r="32" fill="#FFFFFF" stroke="#003453" strokeWidth="3" />
                <circle cx="250" cy="150" r="28" fill="rgba(0, 52, 83, 0.05)" />
                <text x="250" y="153" fontFamily="Inter" fontSize="10" fontWeight="bold" fill="#003453" textAnchor="middle">Roche</text>
                <text x="250" y="163" fontFamily="Inter" fontSize="7" fill="#BF9B30" textAnchor="middle">Holding AG</text>
              </g>

              {/* Node 2: Genentech */}
              <g 
                onMouseEnter={() => setActiveNetworkNode('genentech')} 
                onMouseLeave={() => setActiveNetworkNode(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle cx="100" cy="70" r="22" fill="#FFFFFF" stroke={activeNetworkNode === 'genentech' ? '#BF9B30' : '#E8E0C8'} strokeWidth="2" style={{ transition: 'stroke 0.2s' }} />
                <text x="100" y="73" fontFamily="Inter" fontSize="8" fontWeight="600" fill="var(--text-ink)" textAnchor="middle">Genentech</text>
                <text x="100" y="81" fontFamily="JetBrains Mono" fontSize="6" fill="var(--text-charcoal)" textAnchor="middle">100% (US)</text>
              </g>

              {/* Node 3: Chugai */}
              <g 
                onMouseEnter={() => setActiveNetworkNode('chugai')} 
                onMouseLeave={() => setActiveNetworkNode(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle cx="400" cy="70" r="22" fill="#FFFFFF" stroke={activeNetworkNode === 'chugai' ? '#BF9B30' : '#E8E0C8'} strokeWidth="2" style={{ transition: 'stroke 0.2s' }} />
                <text x="400" y="73" fontFamily="Inter" fontSize="8" fontWeight="600" fill="var(--text-ink)" textAnchor="middle">Chugai</text>
                <text x="400" y="81" fontFamily="JetBrains Mono" fontSize="6" fill="var(--text-charcoal)" textAnchor="middle">61.5% (JP)</text>
              </g>

              {/* Node 4: Roche Diagnostics */}
              <g 
                onMouseEnter={() => setActiveNetworkNode('diagnostics')} 
                onMouseLeave={() => setActiveNetworkNode(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle cx="120" cy="230" r="22" fill="#FFFFFF" stroke={activeNetworkNode === 'diagnostics' ? '#BF9B30' : '#E8E0C8'} strokeWidth="2" style={{ transition: 'stroke 0.2s' }} />
                <text x="120" y="233" fontFamily="Inter" fontSize="8" fontWeight="600" fill="var(--text-ink)" textAnchor="middle">Diagnostics</text>
                <text x="120" y="241" fontFamily="JetBrains Mono" fontSize="6" fill="var(--text-charcoal)" textAnchor="middle">100% (CH)</text>
              </g>

              {/* Node 5: Foundation Medicine */}
              <g 
                onMouseEnter={() => setActiveNetworkNode('foundation')} 
                onMouseLeave={() => setActiveNetworkNode(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle cx="380" cy="230" r="22" fill="#FFFFFF" stroke={activeNetworkNode === 'foundation' ? '#BF9B30' : '#E8E0C8'} strokeWidth="2" style={{ transition: 'stroke 0.2s' }} />
                <text x="380" y="233" fontFamily="Inter" fontSize="8" fontWeight="600" fill="var(--text-ink)" textAnchor="middle">Foundation</text>
                <text x="380" y="241" fontFamily="JetBrains Mono" fontSize="6" fill="var(--text-charcoal)" textAnchor="middle">100% (US)</text>
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
                  {activeNetworkNode === 'roche' && 'Roche Holding AG (Muttergesellschaft)'}
                  {activeNetworkNode === 'genentech' && 'Genentech Inc. (San Francisco, USA)'}
                  {activeNetworkNode === 'chugai' && 'Chugai Pharmaceutical Co., Ltd. (Tokio, Japan)'}
                  {activeNetworkNode === 'diagnostics' && 'Roche Diagnostics International AG (Rotkreuz, CH)'}
                  {activeNetworkNode === 'foundation' && 'Foundation Medicine Inc. (Cambridge, USA)'}
                  {!activeNetworkNode && 'Fokusieren Sie einen Knoten'}
                </strong>
                <span style={{ color: 'var(--text-charcoal)', fontSize: '11px' }}>
                  {activeNetworkNode === 'roche' && 'Konsolidiert 273\'000 Mitarbeiter weltweit.'}
                  {activeNetworkNode === 'genentech' && '100% im Besitz. F&D Center für Onkologie.'}
                  {activeNetworkNode === 'chugai' && 'Strategische Beteiligung (61.5% Kapitalanteile).'}
                  {activeNetworkNode === 'diagnostics' && 'Zentraler Schweizer Produktions- und Entwicklungsstandort.'}
                  {activeNetworkNode === 'foundation' && 'Übernahme 2018. Genomische Profilierung.'}
                  {!activeNetworkNode && 'Zeigt Eigentumsketten und Direktbeteiligungen.'}
                </span>
              </div>
              
              {activeNetworkNode && (
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <Shield size={14} style={{ color: 'var(--accent-green)' }} />
                  <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--accent-green)', textTransform: 'uppercase' }}>Zefix Verifiziert</span>
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
                Schweizer Marktindikatoren
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-charcoal)', lineHeight: 1.6, marginBottom: '24px' }}>
              Wirtschaftliche Kennzahlen und Vertrauensindizes der eingetragenen Schweizer Kapitalgesellschaften.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, justifyContent: 'center' }}>
            
            {/* Stat Card 1: B2B trust index */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              {/* Mini SVG Radial Progress */}
              <div style={{ width: '50px', height: '50px', position: 'relative' }}>
                <svg width="50" height="50" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(232, 224, 200, 0.4)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#BF9B30" strokeWidth="3" strokeDasharray="94 6" strokeDashoffset="25" />
                </svg>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  94%
                </div>
              </div>
              
              <div>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-charcoal)', display: 'block', fontWeight: 600 }}>
                  B2B Vertrauensindex (Verifiziert)
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-ink)', lineHeight: 1.4 }}>
                  94% aller Premium-Profile verfügen über vollständig verifizierte Zefix-Dossiers.
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
                  Nachhaltigkeits-Reporting
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-ink)', lineHeight: 1.4 }}>
                  78% der Top-100 Schweizer Grosskonzerne weisen validierte ESG-Scores über 75/100 auf.
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
                  R&D Standortattraktivität
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-ink)', lineHeight: 1.4 }}>
                  85% der Schweizer R&D-Hubs erhalten Bestbewertungen für steuerliche Rahmenbedingungen.
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
