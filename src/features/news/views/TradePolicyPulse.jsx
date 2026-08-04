import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { ShieldAlert, TrendingUp, Landmark, BookOpen, Layers } from 'lucide-react';

export default function TradePolicyPulse({ navigate }) {
  const { t, isRtl } = useLanguage();
  const [checklist, setChecklist] = useState({
    wht: false,
    nexus: false,
    gdpr: false,
    visa: false
  });

  const alerts = [
    { category: "Tax", title: "US-Swiss Double Taxation Amendment Approved", desc: "Reduces withholding taxes on intellectual property licensing and qualified dividend transfers.", date: "June 2026", status: "Active" },
    { category: "Compliance", title: "California Privacy Rights Act (CPRA) Updates", desc: "Affects Swiss B2B firms collecting marketing data from Southern California customers.", date: "May 2026", status: "Regulatory" },
    { category: "Tariffs", title: "Bilateral Machinery Tariff Exemption Extensions", desc: "Swiss high-precision mechanical tools maintain tariff exemptions at US ports of entry.", date: "April 2026", status: "Passed" }
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-ivory)', minHeight: 'calc(100vh - 120px)', padding: '40px 0 64px' }}>
      <div className="container">
        
        {/* Breadcrumb */}
        <div style={{ fontSize: '12px', color: 'var(--text-charcoal)', marginBottom: '24px', display: 'flex', gap: '6px', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>{t('Home', 'Home')}</span>
          <span>/</span>
          <span style={{ fontWeight: 600, color: 'var(--text-ink)' }}>Trade & Policy Pulse</span>
        </div>

        {/* Editorial Header */}
        <div style={{ marginBottom: '40px' }}>
          <span className="caps-label" style={{ color: 'var(--primary-red)', fontWeight: 700, display: 'block', marginBottom: '8px' }}>Regulatory Tracking</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '38px', fontWeight: 700, color: 'var(--text-ink)', margin: '0 0 16px' }}>
            Trade & Policy Pulse
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--text-charcoal)', maxWidth: '720px', lineHeight: '1.6' }}>
            Monitors changes in tariffs, double taxation treaties, data privacy compliance, and logistics rules governing Swiss-American commerce, with direct inputs from our Los Angeles office.
          </p>
        </div>

        {/* 3 Metric cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <div style={{ backgroundColor: '#FFF', border: '1px solid var(--light-border)', padding: '24px' }}>
            <TrendingUp size={24} style={{ color: 'var(--primary-red)', marginBottom: '12px' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-charcoal)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Annual Trade Volume</span>
            <strong style={{ fontSize: '28px', color: 'var(--text-ink)', fontFamily: 'var(--font-mono)' }}>$48.5 Billion</strong>
            <p style={{ fontSize: '11px', color: 'var(--text-charcoal)', marginTop: '8px' }}>Total trade in services, technology, and precision machinery.</p>
          </div>

          <div style={{ backgroundColor: '#FFF', border: '1px solid var(--light-border)', padding: '24px' }}>
            <Landmark size={24} style={{ color: 'var(--primary-red)', marginBottom: '12px' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-charcoal)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Swiss FDI in California</span>
            <strong style={{ fontSize: '28px', color: 'var(--text-ink)', fontFamily: 'var(--font-mono)' }}>$22.8 Billion</strong>
            <p style={{ fontSize: '11px', color: 'var(--text-charcoal)', marginTop: '8px' }}>Direct foreign investment supporting 100,000+ local jobs.</p>
          </div>

          <div style={{ backgroundColor: '#FFF', border: '1px solid var(--light-border)', padding: '24px' }}>
            <Layers size={24} style={{ color: 'var(--primary-red)', marginBottom: '12px' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-charcoal)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>US Corporate Presence</span>
            <strong style={{ fontSize: '28px', color: 'var(--text-ink)', fontFamily: 'var(--font-mono)' }}>750+ Entities</strong>
            <p style={{ fontSize: '11px', color: 'var(--text-charcoal)', marginTop: '8px' }}>Swiss subsidiaries in California and California offices in Switzerland.</p>
          </div>
        </div>

        {/* Layout: Alerts Left, Checklist Right */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '40px' }} className="home-news-row">
          
          {/* Policy updates table */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, marginBottom: '20px', borderBottom: '1px solid #000', paddingBottom: '10px' }}>Active Regulatory Updates</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {alerts.map((al, idx) => (
                <div key={idx} style={{ borderBottom: '1px solid var(--light-border)', paddingBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                    <span style={{ fontSize: '11px', color: 'var(--primary-red)', fontWeight: 600, textTransform: 'uppercase' }}>{al.category}</span>
                    <span style={{ fontSize: '11px', backgroundColor: '#EAEAEA', padding: '2px 8px', borderRadius: '2px', fontWeight: 500 }}>{al.status}</span>
                  </div>
                  <h3 style={{ fontSize: '17px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-ink)', marginBottom: '6px' }}>{al.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-charcoal)', lineHeight: '1.5', marginBottom: '8px' }}>{al.desc}</p>
                  <span style={{ fontSize: '11px', color: 'var(--text-charcoal)', fontFamily: 'var(--font-mono)' }}>Published: {al.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive expansion checklist */}
          <div style={{ backgroundColor: '#F9F9F9', border: '1px solid var(--light-border)', padding: '24px' }}>
            <h3 style={{ fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-red)', marginBottom: '16px', fontWeight: 700 }}>Transatlantic Compliance Checklist</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-charcoal)', marginBottom: '20px', lineHeight: '1.5' }}>Ensure your cross-border operations conform to the latest standard legal checklists:</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer', fontSize: '13px' }}>
                <input 
                  type="checkbox" 
                  checked={checklist.wht} 
                  onChange={() => setChecklist({...checklist, wht: !checklist.wht})} 
                  style={{ marginTop: '3px' }} 
                />
                <div>
                  <strong>Withholding Tax Compliance</strong>
                  <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-charcoal)' }}>Bilateral forms loaded under treaty updates.</span>
                </div>
              </label>

              <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer', fontSize: '13px' }}>
                <input 
                  type="checkbox" 
                  checked={checklist.nexus} 
                  onChange={() => setChecklist({...checklist, nexus: !checklist.nexus})} 
                  style={{ marginTop: '3px' }} 
                />
                <div>
                  <strong>State Corporate Nexus Assessment</strong>
                  <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-charcoal)' }}>Analyze physical vs. economic presence thresholds in California.</span>
                </div>
              </label>

              <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer', fontSize: '13px' }}>
                <input 
                  type="checkbox" 
                  checked={checklist.gdpr} 
                  onChange={() => setChecklist({...checklist, gdpr: !checklist.gdpr})} 
                  style={{ marginTop: '3px' }} 
                />
                <div>
                  <strong>FADP & CCPA Data Sync</strong>
                  <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-charcoal)' }}>Reconcile Swiss Data Act provisions with California Consumer Privacy.</span>
                </div>
              </label>

              <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer', fontSize: '13px' }}>
                <input 
                  type="checkbox" 
                  checked={checklist.visa} 
                  onChange={() => setChecklist({...checklist, visa: !checklist.visa})} 
                  style={{ marginTop: '3px' }} 
                />
                <div>
                  <strong>Treaty Investor Visa Verification</strong>
                  <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-charcoal)' }}>Confirm Swiss ownership ratios meet US E-2 requirements.</span>
                </div>
              </label>
            </div>

            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--light-border)', textAlign: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-charcoal)' }}>
                {Object.values(checklist).filter(Boolean).length} of 4 steps completed
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
