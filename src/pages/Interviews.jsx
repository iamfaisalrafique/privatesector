import React, { useState, useEffect } from 'react';
import AdSlot from '../components/AdSlot';
import { useLanguage } from '../context/LanguageContext';
import { Calendar, Clock, Play, Pause, ArrowLeft, ArrowRight, Volume2, Mic } from 'lucide-react';

export default function Interviews({ selectedInterviewId, isPodcastOnly = false, selectInterview, navigate }) {
  const { t, isRtl } = useLanguage();
  const [interviews, setInterviews] = useState([]);
  const [activeDossier, setActiveDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companyCardData, setCompanyCardData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Audio Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef] = useState(new Audio());

  useEffect(() => {
    async function fetchInterviews() {
      setLoading(true);
      try {
        if (selectedInterviewId) {
          const res = await fetch(`/api/interviews/${selectedInterviewId}`);
          if (res.ok) {
            const data = await res.json();
            setActiveDossier(data);

            // Fetch company details for sidebar card
            if (data.company_id) {
              const compRes = await fetch(`/api/companies/${data.company_id}`);
              if (compRes.ok) setCompanyCardData(await compRes.json());
            }

            // Set up audio source if available
            if (data.audio_url) {
              audioRef.src = data.audio_url;
              audioRef.onended = () => setIsPlaying(false);
            }
          }
        } else {
          const url = isPodcastOnly ? '/api/interviews?has_audio=true' : '/api/interviews';
          const res = await fetch(url);
          if (res.ok) {
            setInterviews(await res.json());
            setActiveDossier(null);
          }
        }
      } catch (e) {
        console.error('Error fetching interviews:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchInterviews();

    return () => {
      audioRef.pause();
      setIsPlaying(false);
    };
  }, [selectedInterviewId, isPodcastOnly]);

  const handleAudioToggle = () => {
    if (isPlaying) {
      audioRef.pause();
      setIsPlaying(false);
    } else {
      audioRef.play();
      setIsPlaying(true);
    }
  };

  const formatSwissNumber = (num) => {
    return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") : '0';
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '64px 0', textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '2px solid var(--light-border)', borderTopColor: 'var(--primary-red)', borderRadius: '50%', animation: 'spin 1s infinite linear', margin: '0 auto 16px' }} />
        <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '18px', color: 'var(--text-charcoal)' }}>Dossiers werden geladen...</p>
      </div>
    );
  }

  // --- 1. SINGLE INTERVIEW / PODCAST DETAIL DOSSIER ---
  if (selectedInterviewId && activeDossier) {
    return (
      <div style={{ backgroundColor: 'var(--bg-ivory)', minHeight: 'calc(100vh - 120px)' }}>
        
        {/* Dark Hero Section */}
        <div style={{ backgroundColor: '#0A0A0A', color: '#FFFDF7', padding: '64px 0', borderBottom: '1.5px solid rgba(191, 155, 48, 0.3)' }}>
          <div className="container">
            <button 
              onClick={() => selectInterview(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-red)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                marginBottom: '32px'
              }}
            >
              <ArrowLeft size={16} />
              <span>Zurück zur Übersicht</span>
            </button>

            <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
              {/* Interviewee Avatar with Gold Ring */}
              <div style={{ position: 'relative', flexShrink: 0 }} className="avatar-container">
                <img 
                  src={activeDossier.interviewee_avatar} 
                  alt={activeDossier.interviewee_name}
                  style={{
                    width: '160px',
                    height: '160px',
                    borderRadius: '50%',
                    border: '3px solid var(--primary-red)',
                    objectFit: 'cover'
                  }}
                />
              </div>

              {/* Title & Metadata */}
              <div style={{ flex: 1, textAlign: isRtl ? 'right' : 'left' }}>
                <span className="caps-label" style={{ color: 'var(--primary-red)', fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                  CEO-Gespräch & Leader-Dossier
                </span>
                
                <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '40px', fontWeight: 700, color: '#FFFDF7', marginBottom: '8px' }}>
                  {activeDossier.interviewee_name}
                </h1>
                
                <p style={{ color: 'var(--primary-red)', fontSize: '16px', fontWeight: 500, marginBottom: '16px', fontFamily: 'Inter, sans-serif' }}>
                  {activeDossier.interviewee_title} — {activeDossier.company_name}
                </p>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px', color: '#888888', fontFamily: 'var(--font-mono)' }}>
                  <span>{activeDossier.date_published}</span>
                  <span>·</span>
                  <span>{activeDossier.read_time_mins} Min. Lesezeit</span>
                  {activeDossier.audio_url && (
                    <>
                      <span>·</span>
                      <span style={{ color: 'var(--primary-red)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mic size={12} /> PODCAST EPISODE
                      </span>
                    </>
                  )}
                </div>

                {activeDossier.studentAuthor && (
                  <div 
                    onClick={() => navigate(`/student/${activeDossier.studentAuthor.id}`)}
                    style={{ 
                      marginTop: '16px', 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      cursor: 'pointer',
                      border: '0.5px solid rgba(191, 155, 48, 0.4)',
                      padding: '6px 14px',
                      backgroundColor: 'rgba(255, 253, 247, 0.05)',
                      borderRadius: '4px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-red)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(191, 155, 48, 0.4)'}
                  >
                    <img 
                      src={activeDossier.studentAuthor.avatar} 
                      alt={activeDossier.studentAuthor.name} 
                      style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--primary-red)' }}
                    />
                    <span style={{ fontSize: '11.5px', color: 'var(--primary-red)', fontWeight: 600 }}>
                      Beitrag von {activeDossier.studentAuthor.name} ({activeDossier.studentAuthor.university})
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Article Body + Sidebar Layout */}
        <div className="container" style={{ padding: '48px 0 64px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '48px', alignItems: 'flex-start' }} className="news-layout-grid">
            
            {/* Left Q&A Body (Dark Premium Surface Container) */}
            <div style={{ backgroundColor: '#1A1A1A', padding: '40px', borderRadius: '6px', border: '0.5px solid var(--dark-border)' }}>
              
              {/* Premium Podcast Player Widget if audio is enabled */}
              {activeDossier.audio_url && (
                <div 
                  style={{ 
                    backgroundColor: '#0D0D0D', 
                    border: '1px solid var(--primary-red)', 
                    padding: '20px', 
                    marginBottom: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px' 
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button 
                      onClick={handleAudioToggle}
                      style={{ 
                        width: '48px', 
                        height: '48px', 
                        borderRadius: '50%', 
                        backgroundColor: 'var(--primary-red)', 
                        border: 'none', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        cursor: 'pointer',
                        color: '#1A1A1A'
                      }}
                    >
                      {isPlaying ? <Pause size={20} fill="#1A1A1A" /> : <Play size={20} fill="#1A1A1A" style={{ marginLeft: '4px' }} />}
                    </button>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFFDF7', display: 'block' }}>Audio-Podcast abspielen</span>
                      <span style={{ fontSize: '11px', color: '#888' }}>Laurent Freixe im Gespräch mit der Redaktion</span>
                    </div>
                  </div>
                  <Volume2 size={20} style={{ color: 'var(--primary-red)' }} />
                </div>
              )}

              {/* Headline block */}
              <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '28px', color: '#FFFDF7', marginBottom: '32px', fontStyle: 'italic', borderBottom: '0.5px solid #2A2A2A', paddingBottom: '16px' }}>
                „{activeDossier.title}“
              </h2>

              {/* Q&A dialogue stream */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {activeDossier.qa_content.map((qa, index) => (
                  <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    {/* Question (gold uppercase) */}
                    <span 
                      style={{ 
                        fontFamily: 'Inter, sans-serif', 
                        fontSize: '13px', 
                        fontWeight: 600, 
                        letterSpacing: '0.08em', 
                        color: 'var(--primary-red)',
                        textTransform: 'uppercase'
                      }}
                    >
                      Q: {qa.q}
                    </span>

                    {/* Answer (ivory) */}
                    <p 
                      style={{ 
                        fontFamily: 'Inter, sans-serif', 
                        fontSize: '17px', 
                        lineHeight: 1.8, 
                        color: '#FFFDF7' 
                      }}
                    >
                      {qa.a}
                    </p>

                    {/* Gold Divider */}
                    {index < activeDossier.qa_content.length - 1 && (
                      <div style={{ height: '1px', backgroundColor: 'rgba(191, 155, 48, 0.2)', marginTop: '16px' }} />
                    )}

                  </div>
                ))}
              </div>

            </div>

            {/* Right Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="news-right-col">
              
              {/* Linked Company Mini Card */}
              {companyCardData && (
                <div 
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '0.5px solid var(--light-border)',
                    borderRadius: '6px',
                    padding: '24px'
                  }}
                >
                  <span className="caps-label" style={{ fontSize: '11px', display: 'block', marginBottom: '16px' }}>
                    Unternehmen im Fokus
                  </span>
                  
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ width: '40px', height: '40px', backgroundColor: companyCardData.logo_bg || 'var(--surface-warm)', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 'bold' }}>
                      {companyCardData.name.charAt(0)}
                    </div>
                    <div>
                      <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text-ink)' }}>{companyCardData.name}</strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-charcoal)' }}>Kanton {companyCardData.canton}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--text-charcoal)', lineHeight: 1.5, marginBottom: '16px' }}>
                    {companyCardData.description}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', borderTop: '0.5px solid var(--light-border)', paddingTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-charcoal)' }}>Mitarbeiter:</span>
                      <strong style={{ color: 'var(--text-ink)', fontFamily: 'var(--font-mono)' }}>{formatSwissNumber(companyCardData.employees)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-charcoal)' }}>Umsatzklasse:</span>
                      <strong style={{ color: 'var(--text-ink)', fontFamily: 'var(--font-mono)' }}>{companyCardData.revenue_band}</strong>
                    </div>
                  </div>

                  <button 
                    onClick={() => navigate(`/unternehmen/${companyCardData.id}`)}
                    className="btn btn-gold-outline"
                    style={{ width: '100%', fontSize: '11px', padding: '8px', minHeight: '36px', marginTop: '16px' }}
                  >
                    Dossier ansehen
                  </button>
                </div>
              )}

              {/* Zone C Rectangle Ad */}
              <AdSlot position="C" />

            </div>

          </div>
        </div>

      </div>
    );
  }

  // --- 2. LIST INDEX VIEW (Interviews & Podcasts List) ---
  return (
    <div style={{ backgroundColor: 'var(--bg-ivory)', minHeight: 'calc(100vh - 120px)', padding: '48px 0 64px' }}>
      <div className="container">
        
        {/* Header Title */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="caps-label" style={{ display: 'block', marginBottom: '8px' }}>
            {isPodcastOnly ? 'AUDIO BRIEFINGS' : 'REDENDE INHABER & EXECUTIVES'}
          </span>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '42px', fontWeight: 700, color: 'var(--text-ink)', margin: 0 }}>
            {isPodcastOnly ? 'Swiss Private Sector Podcasts' : 'Unternehmer-Interviews'}
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: 'var(--text-charcoal)', marginTop: '8px' }}>
            Dossiers und vertiefende Audio-Gespräche mit CEOs, Gründern und Verwaltungsräten der Schweiz.
          </p>
        </div>

        {/* Zone A Leaderboard Ad */}
        <AdSlot position="A" />

        {/* Category Tabs */}
        {!selectedInterviewId && interviews.length > 0 && (
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px', flexWrap: 'wrap', marginTop: '32px' }}>
            {['All', 'Executive Briefing', 'Street Briefing', 'University Perspective'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  background: selectedCategory === cat ? 'var(--primary-red)' : '#FFFFFF',
                  color: selectedCategory === cat ? '#FFFFFF' : 'var(--text-ink)',
                  border: '0.5px solid var(--light-border)',
                  padding: '8px 16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderRadius: '0px',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.15s ease-in-out'
                }}
              >
                {cat === 'All' ? 'Alle Beiträge' : 
                 cat === 'Executive Briefing' ? 'Executive Briefings' : 
                 cat === 'Street Briefing' ? 'Street Briefings 🎤' : 'University Perspectives 🎓'}
              </button>
            ))}
          </div>
        )}

        {/* Grid List */}
        {(() => {
          const filteredInterviews = selectedCategory === 'All'
            ? interviews
            : interviews.filter(iv => iv.category === selectedCategory);
            
          if (filteredInterviews.length === 0) {
            return (
              <p style={{ textAlign: 'center', color: 'var(--text-charcoal)', marginTop: '48px', fontFamily: '"Playfair Display", serif', fontSize: '18px' }}>
                Keine Beiträge in dieser Kategorie vorhanden.
              </p>
            );
          }
          
          return (
            <div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                gap: '32px',
                marginTop: '32px'
              }}
            >
              {filteredInterviews.map(iv => (
                <div 
                  key={iv.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '0.5px solid var(--light-border)',
                    borderRadius: '6px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onClick={() => selectInterview(iv.id)}
                >
                  {/* Header with avatar thumbnail */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                    <img 
                      src={iv.interviewee_avatar} 
                      alt={iv.interviewee_name} 
                      style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1.5px solid var(--primary-red)', objectFit: 'cover' }}
                    />
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-ink)', display: 'block' }}>{iv.interviewee_name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-charcoal)' }}>{iv.interviewee_title}</span>
                    </div>
                  </div>

                  <h3 
                    style={{ 
                      fontFamily: '"Playfair Display", serif', 
                      fontSize: '18px', 
                      color: 'var(--text-ink)', 
                      marginBottom: '12px',
                      fontWeight: 700,
                      lineHeight: 1.3
                    }}
                  >
                    {iv.title}
                  </h3>
                  
                  <p 
                    style={{ 
                      fontFamily: 'Inter, sans-serif', 
                      fontSize: '12px', 
                      color: 'var(--text-charcoal)', 
                      lineHeight: 1.5,
                      marginBottom: '20px',
                      flex: 1
                    }}
                  >
                    {iv.subtitle}
                  </p>

                  <div 
                    style={{ 
                      marginTop: 'auto',
                      borderTop: '0.5px solid var(--light-border)',
                      paddingTop: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '11px',
                      color: 'var(--primary-gold)',
                      fontWeight: 600
                    }}
                  >
                    <span style={{ color: 'var(--text-charcoal)', fontFamily: 'var(--font-mono)' }}>
                      {iv.date_published}
                    </span>
                    
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {iv.audio_url ? 'Podcast anhören' : 'Dossier lesen'} <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

      </div>
    </div>
  );
}
