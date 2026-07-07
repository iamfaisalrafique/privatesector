import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Play, Pause, Volume2, Globe, Clock, MessageSquare, Download } from 'lucide-react';

export default function TranslaticTranscript({ navigate }) {
  const { t, isRtl } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [langTab, setLangTab] = useState('en'); // 'en' | 'de'

  const speakers = [
    {
      name: "Dr. Beat Schuler",
      title: "Senior Trade Commissioner, VitalSwiss",
      avatar: "🇨🇭",
      bio: "Former delegate to the Swiss Federal Department of Economic Affairs, specializing in European-American bilateral investment frameworks."
    },
    {
      name: "Sarah Jenkins, Esq.",
      title: "Executive Director, California-Swiss Alliance",
      avatar: "🇺🇸",
      bio: "Silicon Valley policy attorney and expert on cross-border corporate governance, tax treaties, and trade compliance."
    }
  ];

  const transcripts = {
    en: [
      { time: "00:12", speaker: "Dr. Beat Schuler", text: "Welcome everyone. Today we are addressing a critical nexus: how Swiss precision capital meets the sheer entrepreneurial velocity of Southern California. For a long time, the Silicon Valley route was the default, but we are witnessing an unprecedented shift towards SoCal—especially in biotech, aerospace, and advanced logistics." },
      { time: "01:45", speaker: "Sarah Jenkins, Esq.", text: "Absolutely, Beat. Southern California presents a unique dual benefit: deep tech talent pools from institutions like Caltech and UCLA, combined with massive logistics gateways like the Ports of Los Angeles and Long Beach. Swiss firms aren't just finding customers here; they're establishing secondary R&D headquarters." },
      { time: "03:10", speaker: "Dr. Beat Schuler", text: "Yes, and the regulatory environment is adapting. With the recent double-taxation updates, the friction points for Swiss SMEs expanding into the United States have been significantly minimized. Our role is to ensure that transition remains seamless." },
      { time: "05:02", speaker: "Sarah Jenkins, Esq.", text: "The cross-border ranking we recently published underscores this. The cantons of Zurich and Zug are seeing direct reciprocal investment from SoCal-based venture funds. It's a bilateral highway of innovation, not just a one-way street." }
    ],
    de: [
      { time: "00:12", speaker: "Dr. Beat Schuler", text: "Herzlich willkommen allerseits. Heute widmen wir uns einer entscheidenden Verbindung: Wie präzises Schweizer Kapital auf die reine unternehmerische Dynamik Südkaliforniens trifft. Lange Zeit war das Silicon Valley der Standard, aber wir erleben eine beispiellose Verlagerung nach Südkalifornien—insbesondere in den Bereichen Biotech, Luft- und Raumfahrt sowie fortschrittliche Logistik." },
      { time: "01:45", speaker: "Sarah Jenkins, Esq.", text: "Absolut, Beat. Südkalifornien bietet einen einzigartigen doppelten Vorteil: einen grossen Pool an Technologie-Talenten von Institutionen wie Caltech und der UCLA, kombiniert mit riesigen Logistiktoren wie den Häfen von Los Angeles und Long Beach. Schweizer Unternehmen finden hier nicht nur Kunden; sie errichten sekundäre F&E-Hauptsitzte." },
      { time: "03:10", speaker: "Dr. Beat Schuler", text: "Ja, und das regulatorische Umfeld passt sich an. Mit den jüngsten Aktualisierungen zur Doppelbesteuerung wurden die Reibungspunkte für Schweizer KMUs, die in die USA expandieren, erheblich minimiert. Unsere Aufgabe ist es, einen nahtlosen Übergang zu gewährleisten." },
      { time: "05:02", speaker: "Sarah Jenkins, Esq.", text: "Das jüngst veröffentlichte länderübergreifende Ranking unterstreicht dies. Die Kantone Zürich und Zug verzeichnen direkte gegenseitige Investitionen von Risikokapitalfonds aus Südkalifornien. Es ist eine bilaterale Innovationsautobahn, keine Einbahnstrasse." }
    ]
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-ivory)', minHeight: 'calc(100vh - 120px)', padding: '40px 0 64px' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        
        {/* Breadcrumb */}
        <div style={{ fontSize: '12px', color: 'var(--text-charcoal)', marginBottom: '24px', display: 'flex', gap: '6px', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>{t('Home', 'Home')}</span>
          <span>/</span>
          <span style={{ fontWeight: 600, color: 'var(--text-ink)' }}>Translatic Transcript</span>
        </div>

        {/* Editorial Header */}
        <div style={{ borderBottom: '2px solid #000', paddingBottom: '24px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
            <span className="caps-label" style={{ color: 'var(--primary-red)', fontWeight: 700 }}>Exclusive Briefing</span>
            <span style={{ fontSize: '13px', color: 'var(--text-charcoal)', fontFamily: 'var(--font-mono)' }}>VOL. IV // NO. 12</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '38px', fontWeight: 800, lineHeight: '1.2', color: 'var(--text-ink)', marginBottom: '16px' }}>
            Translatic Transcript
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--text-charcoal)', lineHeight: '1.5', fontFamily: 'var(--font-sans)', fontWeight: 300 }}>
            An in-depth dialogue on trade acceleration, capital pathways, and regulatory synchronization between Switzerland and Southern California.
          </p>
        </div>

        {/* Speakers Panel */}
        <div style={{ backgroundColor: '#F9F9F9', border: '1px solid var(--light-border)', padding: '24px', marginBottom: '32px' }}>
          <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-red)', marginBottom: '16px', fontWeight: 700 }}>Featured Speakers</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {speakers.map((s, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '16px' }}>
                <span style={{ fontSize: '32px', lineHeight: '1' }}>{s.avatar}</span>
                <div>
                  <strong style={{ display: 'block', fontSize: '15px', color: 'var(--text-ink)' }}>{s.name}</strong>
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--primary-red)', fontWeight: 500, marginBottom: '6px' }}>{s.title}</span>
                  <p style={{ fontSize: '12px', color: 'var(--text-charcoal)', lineHeight: '1.5' }}>{s.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Premium Audio Player Mockup */}
        <div style={{ 
          background: 'linear-gradient(135deg, #111 0%, #222 100%)', 
          color: '#FFF', 
          padding: '20px 24px', 
          borderRadius: '4px',
          display: 'flex', 
          alignItems: 'center', 
          gap: '20px', 
          marginBottom: '32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          flexDirection: isRtl ? 'row-reverse' : 'row'
        }}>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--primary-red)', 
              border: 'none', 
              color: '#FFF', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {isPlaying ? <Pause size={20} fill="#FFF" /> : <Play size={20} fill="#FFF" style={{ marginLeft: '2px' }} />}
          </button>
          
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#888', marginBottom: '6px', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
              <span>Transatlantic Policy Briefing #89</span>
              <span>{isPlaying ? "01:24 / 06:45" : "00:00 / 06:45"}</span>
            </div>
            {/* Fake wave/bar */}
            <div style={{ height: '4px', backgroundColor: '#333', borderRadius: '2px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ 
                position: 'absolute', 
                left: isRtl ? 'auto' : 0, 
                right: isRtl ? 0 : 'auto', 
                top: 0, 
                bottom: 0, 
                width: isPlaying ? '20%' : '0%', 
                backgroundColor: 'var(--primary-red)',
                transition: 'width 1s linear'
              }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="desktop-only">
            <Volume2 size={18} style={{ color: '#888' }} />
            <div style={{ width: '60px', height: '4px', backgroundColor: '#333', borderRadius: '2px' }}>
              <div style={{ width: '80%', height: '100%', backgroundColor: '#888', borderRadius: '2px' }} />
            </div>
          </div>

          <button style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} className="desktop-only">
            <Download size={16} />
            <span style={{ fontSize: '11px' }}>MP3</span>
          </button>
        </div>

        {/* Translation Toggle & Info Bar */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          borderBottom: '1px solid var(--light-border)', 
          paddingBottom: '12px', 
          marginBottom: '24px',
          flexDirection: isRtl ? 'row-reverse' : 'row'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-charcoal)', fontSize: '13px' }}>
            <Clock size={14} />
            <span>Published July 2026</span>
            <span>•</span>
            <MessageSquare size={14} />
            <span>Full Transcript</span>
          </div>

          <div style={{ display: 'flex', gap: '4px', backgroundColor: '#F0F0F0', padding: '2px', borderRadius: '4px' }}>
            <button 
              onClick={() => setLangTab('en')}
              style={{
                border: 'none',
                backgroundColor: langTab === 'en' ? '#FFF' : 'transparent',
                color: langTab === 'en' ? 'var(--text-ink)' : '#666',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                borderRadius: '3px'
              }}
            >
              English
            </button>
            <button 
              onClick={() => setLangTab('de')}
              style={{
                border: 'none',
                backgroundColor: langTab === 'de' ? '#FFF' : 'transparent',
                color: langTab === 'de' ? 'var(--text-ink)' : '#666',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                borderRadius: '3px'
              }}
            >
              Deutsch
            </button>
          </div>
        </div>

        {/* Transcript Dialogue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {transcripts[langTab].map((para, idx) => (
            <div 
              key={idx} 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: '150px 1fr', 
                gap: '24px',
                borderLeft: para.speaker.includes('Beat') ? '3px solid var(--primary-red)' : '3px solid #000',
                paddingLeft: '16px'
              }}
            >
              <div>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--primary-red)', display: 'block' }}>{para.time}</span>
                <strong style={{ fontSize: '14px', color: 'var(--text-ink)' }}>{para.speaker}</strong>
              </div>
              <div>
                <p style={{ 
                  fontSize: '15px', 
                  color: 'var(--text-charcoal)', 
                  lineHeight: '1.7',
                  fontFamily: 'var(--font-sans)' 
                }}>
                  {para.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter promo */}
        <div style={{ marginTop: '56px', borderTop: '2px solid #000', paddingTop: '32px', textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Get Transatlantic Updates</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-charcoal)', marginBottom: '16px', maxWidth: '480px', margin: '0 auto 16px' }}>
            Subscribe to our weekly policy summaries and cross-border briefing digests delivered directly to your inbox.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', maxWidth: '400px', margin: '0 auto' }}>
            <input 
              type="email" 
              placeholder="Enter your corporate email" 
              style={{ padding: '8px 12px', border: '1px solid var(--light-border)', width: '100%', fontSize: '13px' }} 
            />
            <button className="btn btn-gold-fill" style={{ minHeight: '38px', padding: '0 16px' }}>Subscribe</button>
          </div>
        </div>

      </div>
    </div>
  );
}
