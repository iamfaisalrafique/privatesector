import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Landmark, Navigation, ArrowRight, ShieldCheck, HelpCircle, Activity } from 'lucide-react';

export default function SoCalGateway({ navigate }) {
  const { t, isRtl } = useLanguage();
  const [activeTab, setActiveTab] = useState('swiss-to-socal'); // 'swiss-to-socal' | 'socal-to-swiss'

  const hubs = [
    { name: "Silicon Beach (LA)", sector: "Aerospace, Gaming, SaaS", desc: "Home to space exploration tech pioneers and major creative studios." },
    { name: "San Diego County", sector: "Biotech & Genomics", desc: "A world-leading cluster of life sciences research and commercialization." },
    { name: "Orange County", sector: "Clean Tech & Medical Devices", desc: "Strong manufacturing, medical equipment development, and capital presence." }
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-ivory)', minHeight: 'calc(100vh - 120px)', padding: '40px 0 64px' }}>
      <div className="container">
        
        {/* Breadcrumb */}
        <div style={{ fontSize: '12px', color: 'var(--text-charcoal)', marginBottom: '24px', display: 'flex', gap: '6px', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>{t('Home', 'Home')}</span>
          <span>/</span>
          <span style={{ fontWeight: 600, color: 'var(--text-ink)' }}>The SoCal Gateway</span>
        </div>

        {/* Header Block */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{ color: 'var(--primary-red)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
            Transatlantic Corridors
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '38px', fontWeight: 700, color: 'var(--text-ink)', margin: '0 0 16px' }}>
            The SoCal Gateway
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--text-charcoal)', maxWidth: '680px', margin: '0 auto', lineHeight: '1.6' }}>
            Accelerating Swiss-American trade. We connect Zurich, Geneva, and Zug to Los Angeles, San Diego, and Orange County business ecosystems.
          </p>
        </div>

        {/* Two main tabs to switch direction */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px', gap: '12px' }}>
          <button
            onClick={() => setActiveTab('swiss-to-socal')}
            style={{
              padding: '12px 24px',
              border: 'none',
              backgroundColor: activeTab === 'swiss-to-socal' ? '#0A0A0A' : '#F3F4F6',
              color: activeTab === 'swiss-to-socal' ? '#FFF' : '#374151',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🇨🇭 Swiss Firms to Southern California
          </button>
          <button
            onClick={() => setActiveTab('socal-to-swiss')}
            style={{
              padding: '12px 24px',
              border: 'none',
              backgroundColor: activeTab === 'socal-to-swiss' ? '#0A0A0A' : '#F3F4F6',
              color: activeTab === 'socal-to-swiss' ? '#FFF' : '#374151',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🇺🇸 California Firms to Switzerland
          </button>
        </div>

        {/* Content Area split */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }} className="home-news-row">
          
          {/* Main expansion checklist / details */}
          <div style={{ backgroundColor: '#FFF', border: '1px solid var(--light-border)', padding: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-ink)' }}>
              {activeTab === 'swiss-to-socal' ? "Expanding to Southern California" : "Establishing Swiss Entity"}
            </h2>

            {activeTab === 'swiss-to-socal' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--red-light)', color: 'var(--primary-red)', flexShrink: 0, fontWeight: 'bold' }}>1</div>
                  <div>
                    <strong style={{ fontSize: '15px', color: 'var(--text-ink)', display: 'block', marginBottom: '4px' }}>Local Incorporation & Entity Setup</strong>
                    <p style={{ fontSize: '13px', color: 'var(--text-charcoal)', lineHeight: '1.5' }}>Evaluate LLC vs. C-Corp state registrations. Delaware filing with California physical operations is the standard route for Swiss technical startups.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--red-light)', color: 'var(--primary-red)', flexShrink: 0, fontWeight: 'bold' }}>2</div>
                  <div>
                    <strong style={{ fontSize: '15px', color: 'var(--text-ink)', display: 'block', marginBottom: '4px' }}>Tax Treaty Advisory & Compliance</strong>
                    <p style={{ fontSize: '13px', color: 'var(--text-charcoal)', lineHeight: '1.5' }}>Ensure alignment with the US-Swiss double taxation treaty to prevent redundant fiscal liabilities on cross-border licensing, dividends, and royalties.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--red-light)', color: 'var(--primary-red)', flexShrink: 0, fontWeight: 'bold' }}>3</div>
                  <div>
                    <strong style={{ fontSize: '15px', color: 'var(--text-ink)', display: 'block', marginBottom: '4px' }}>Visa & Executive Relocation</strong>
                    <p style={{ fontSize: '13px', color: 'var(--text-charcoal)', lineHeight: '1.5' }}>Secure L-1 intra-company transfer visas or E-2 treaty investor visas for Swiss key executives establishing the Southern California footprint.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#EAEAEA', color: '#000', flexShrink: 0, fontWeight: 'bold' }}>1</div>
                  <div>
                    <strong style={{ fontSize: '15px', color: 'var(--text-ink)', display: 'block', marginBottom: '4px' }}>Selecting the Ideal Canton</strong>
                    <p style={{ fontSize: '13px', color: 'var(--text-charcoal)', lineHeight: '1.5' }}>Zurich is ideal for global financial integrations, Zug for blockchain/DLT systems, and Vaud/Geneva for biological and health tech innovations.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#EAEAEA', color: '#000', flexShrink: 0, fontWeight: 'bold' }}>2</div>
                  <div>
                    <strong style={{ fontSize: '15px', color: 'var(--text-ink)', display: 'block', marginBottom: '4px' }}>Notary & Capital Deposit</strong>
                    <p style={{ fontSize: '13px', color: 'var(--text-charcoal)', lineHeight: '1.5' }}>Create blocked bank accounts to deposit statutory capital (CHF 20,000 for GmbH, CHF 100,000 for AG) and execute the public deed of incorporation before a Swiss notary.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#EAEAEA', color: '#000', flexShrink: 0, fontWeight: 'bold' }}>3</div>
                  <div>
                    <strong style={{ fontSize: '15px', color: 'var(--text-ink)', display: 'block', marginBottom: '4px' }}>Workforce Integration & Permits</strong>
                    <p style={{ fontSize: '13px', color: 'var(--text-charcoal)', lineHeight: '1.5' }}>Understand labor regulations. Recruit technical talent locally or navigate the quotas for non-EU/EFTA highly skilled specialists from California.</p>
                  </div>
                </div>
              </div>
            )}

            <button className="btn btn-gold-fill" style={{ marginTop: '32px' }}>
              Download PDF Guide <ArrowRight size={14} style={{ marginLeft: '6px' }} />
            </button>
          </div>

          {/* Hub highlights */}
          <div>
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-red)', marginBottom: '16px', fontWeight: 700 }}>Key SoCal Hubs</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {hubs.map((hub, idx) => (
                <div key={idx} style={{ border: '1.5px solid rgba(213,43,30,0.1)', padding: '20px', backgroundColor: '#FFFFFF' }}>
                  <span style={{ fontSize: '10px', backgroundColor: 'var(--red-light)', color: 'var(--primary-red)', padding: '2px 6px', fontWeight: 600, textTransform: 'uppercase', display: 'inline-block', marginBottom: '8px' }}>{hub.sector}</span>
                  <strong style={{ display: 'block', fontSize: '16px', color: 'var(--text-ink)', marginBottom: '6px' }}>{hub.name}</strong>
                  <p style={{ fontSize: '12px', color: 'var(--text-charcoal)', lineHeight: '1.5' }}>{hub.desc}</p>
                </div>
              ))}
            </div>

            {/* Support section */}
            <div style={{ marginTop: '24px', backgroundColor: '#F9F9F9', border: '1px solid var(--light-border)', padding: '20px', textAlign: 'center' }}>
              <HelpCircle size={32} style={{ color: 'var(--primary-red)', marginBottom: '12px' }} />
              <strong style={{ display: 'block', fontSize: '15px', marginBottom: '4px' }}>Need Advisory Help?</strong>
              <p style={{ fontSize: '12px', color: 'var(--text-charcoal)', marginBottom: '16px' }}>Our bi-national desks provide customized introductions to legal counsel, banks, and office space.</p>
              <button 
                onClick={() => navigate('/contact')}
                className="btn btn-gold-outline" 
                style={{ width: '100%', minHeight: '38px', fontSize: '11px', padding: '6px' }}
              >
                Inquire With Gateway Team
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
