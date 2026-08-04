import React, { useState, useEffect } from 'react';
import AdSlot from '../../../shared/components/AdSlot';
import { useLanguage } from '../../../context/LanguageContext';
import { ArrowLeft, GraduationCap, Globe, BookOpen, Mic, ArrowRight, Calendar } from 'lucide-react';

export default function StudentProfile({ studentId, navigate }) {
  const { t, isRtl } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        const res = await fetch(`/api/students/${studentId}`);
        if (res.ok) setProfile(await res.json());
      } catch (e) {
        console.error('Error loading student profile:', e);
      } finally {
        setLoading(false);
      }
    }
    if (studentId) loadProfile();
  }, [studentId]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '64px 0', textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '2px solid var(--light-border)', borderTopColor: 'var(--primary-red)', borderRadius: '50%', animation: 'spin 1s infinite linear', margin: '0 auto 16px' }} />
        <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '18px', color: 'var(--text-charcoal)' }}>{t('Studenten-Profil wird geladen...', 'Studenten-Profil wird geladen...')}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container" style={{ padding: '64px 0', textAlign: 'center' }}>
        <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '24px', color: 'var(--text-ink)', marginBottom: '16px' }}>
          {t('Profil nicht gefunden', 'Profil nicht gefunden')}
        </h2>
        <button className="btn btn-gold-fill" onClick={() => navigate('/karriere')}>
          {t('Zurück zur Karriere-Plattform', 'Zurück zur Karriere-Plattform')}
        </button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-ivory)', minHeight: 'calc(100vh - 120px)' }}>
      
      {/* Premium Dark Hero Header */}
      <div style={{ backgroundColor: '#0A0A0A', color: '#FFFDF7', padding: '64px 0', borderBottom: '1.5px solid rgba(191, 155, 48, 0.3)' }}>
        <div className="container">
          <button 
            onClick={() => navigate('/karriere')}
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
            <span>{t('Zurück zur Übersicht', 'Zurück zur Übersicht')}</span>
          </button>

          <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
            <img 
              src={profile.avatar} 
              alt={profile.name}
              style={{
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                border: '3px solid var(--primary-red)',
                objectFit: 'cover'
              }}
            />

            <div style={{ flex: 1, textAlign: isRtl ? 'right' : 'left' }}>
              <span className="caps-label" style={{ color: 'var(--primary-red)', fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                {t('Zertifizierter Student Contributor', 'Zertifizierter Student Contributor')}
              </span>
              
              <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '38px', fontWeight: 700, color: '#FFFDF7', marginBottom: '8px' }}>
                {profile.name}
              </h1>
              
              <p style={{ color: 'var(--primary-red)', fontSize: '16px', fontWeight: 500, marginBottom: '16px', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: isRtl ? 'flex-end' : 'flex-start' }}>
                <GraduationCap size={18} /> {t(profile.university, profile.university)}
              </p>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px', color: '#888888', fontFamily: 'var(--font-mono)' }}>
                <span>{t('Fachbereich:', 'Fachbereich:')} {t(profile.study_field, profile.study_field)}</span>
                <span>·</span>
                <span>{t('Abschlussklasse', 'Abschlussklasse')} {profile.grad_year}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '48px 0 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '48px', alignItems: 'flex-start' }} className="student-profile-layout">
          
          {/* Left Panel: Bio & Contact */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ backgroundColor: '#FFFFFF', border: '0.5px solid var(--light-border)', borderRadius: '6px', padding: '32px' }}>
              <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '20px', fontWeight: 700, color: 'var(--text-ink)', marginBottom: '16px', borderBottom: '0.5px solid var(--light-border)', paddingBottom: '8px' }}>
                {t('Über mich', 'Über mich')}
              </h3>
              
              <p style={{ fontSize: '13.5px', color: 'var(--text-charcoal)', lineHeight: 1.6, marginBottom: '24px' }}>
                {t(profile.bio, profile.bio)}
              </p>

              {/* Contact Details */}
              <div style={{ marginBottom: '24px', borderTop: '0.5px solid var(--light-border)', paddingTop: '16px', fontSize: '13px', color: 'var(--text-charcoal)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {profile.email && <div><strong>Email:</strong> {profile.email}</div>}
                {profile.phone_number && <div><strong>Phone:</strong> {profile.phone_number}</div>}
                {profile.birth_date && <div><strong>Birth Date:</strong> {profile.birth_date}</div>}
              </div>
              
              <a 
                href={profile.portfolio_url}
                target="_blank"
                rel="nofollow noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--primary-red)',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
                className="portfolio-link"
              >
                <Globe size={16} />
                <span>{t('Externes Universitäts-Portfolio', 'Externes Universitäts-Portfolio')}</span>
                <ArrowRight size={14} />
              </a>
            </div>

            {/* Skills */}
            {profile.skills && (
              <div style={{ backgroundColor: '#FFFFFF', border: '0.5px solid var(--light-border)', borderRadius: '6px', padding: '32px' }}>
                <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '18px', fontWeight: 700, color: 'var(--text-ink)', marginBottom: '16px', borderBottom: '0.5px solid var(--light-border)', paddingBottom: '8px' }}>
                  {t('Fähigkeiten', 'Skills & Endorsements')}
                </h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {(() => {
                    try {
                      const parsed = JSON.parse(profile.skills || '[]');
                      return parsed.map(s => (
                        <span key={s} style={{ backgroundColor: 'var(--bg-ivory)', border: '0.5px solid var(--light-border)', padding: '4px 10px', borderRadius: '16px', fontSize: '11px', fontWeight: 500, color: 'var(--text-charcoal)' }}>
                          {s}
                        </span>
                      ));
                    } catch (e) { return null; }
                  })()}
                </div>
              </div>
            )}

            {/* Sidebar ad Zone C */}
            <AdSlot position="C" />
          </div>

          {/* Right Panel: Authored Publications Portfolio & Experience */}
          <div>
            
            {/* Experience Section */}
            {profile.experience && (
              <div style={{ marginBottom: '40px', backgroundColor: '#FFFFFF', border: '0.5px solid var(--light-border)', borderRadius: '6px', padding: '32px' }}>
                <h3 style={{ fontSize: '20px', fontFamily: '"Playfair Display", serif', fontWeight: 700, borderBottom: '0.5px solid var(--light-border)', paddingBottom: '12px', marginBottom: '20px' }}>
                  {t('Berufserfahrung', 'Experience')}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {(() => {
                    try {
                      const parsed = JSON.parse(profile.experience || '[]');
                      if (parsed.length === 0) return <p style={{ fontSize: '13px', color: 'var(--text-charcoal)', fontStyle: 'italic' }}>No experiences listed yet.</p>;
                      return parsed.map((exp, idx) => (
                        <div key={idx}>
                          <strong style={{ fontSize: '15px', color: 'var(--text-ink)', display: 'block' }}>{exp.role}</strong>
                          <span style={{ fontSize: '12px', color: 'var(--primary-red)', fontWeight: 600, display: 'block', marginTop: '2px' }}>{exp.company} · {exp.duration}</span>
                          {exp.description && <p style={{ fontSize: '13px', color: 'var(--text-charcoal)', margin: '8px 0 0', lineHeight: 1.5 }}>{exp.description}</p>}
                        </div>
                      ));
                    } catch (e) { return null; }
                  })()}
                </div>
              </div>
            )}

            {/* Written Publications */}
            <div style={{ marginBottom: '40px' }}>
              <div style={{ borderBottom: '0.5px solid var(--light-border)', paddingBottom: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={18} style={{ color: 'var(--primary-red)' }} />
                <h3 style={{ fontSize: '20px', fontFamily: '"Playfair Display", serif', fontWeight: 700, margin: 0 }}>
                  {t('Publikationen & Analysen', 'Publikationen & Analysen')}
                </h3>
              </div>

              {profile.articles.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-charcoal)', fontStyle: 'italic' }}>{t('Noch keine schriftlichen Wirtschaftsanalysen veröffentlicht.', 'Noch keine schriftlichen Wirtschaftsanalysen veröffentlicht.')}</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {profile.articles.map(art => (
                    <div 
                      key={art.id}
                      onClick={() => navigate(`/news/${art.id}`)}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '0.5px solid var(--light-border)',
                        borderRadius: '6px',
                        padding: '20px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      className="contributed-card"
                    >
                      <div>
                        <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--primary-red)', letterSpacing: '0.05em', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                          {t(art.category, art.category)}
                        </span>
                        <h4 style={{ fontSize: '15px', fontFamily: '"Playfair Display", serif', fontWeight: 700, color: 'var(--text-ink)', margin: 0 }}>
                          {t(art.title, art.title)}
                        </h4>
                        <span style={{ fontSize: '11px', color: 'var(--text-charcoal)', fontFamily: 'var(--font-mono)', display: 'block', marginTop: '6px' }}>
                          {art.date_published}
                        </span>
                      </div>
                      <ArrowRight size={14} style={{ color: 'var(--primary-red)' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Podcasts & Broadcasts */}
            <div>
              <div style={{ borderBottom: '0.5px solid var(--light-border)', paddingBottom: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mic size={18} style={{ color: 'var(--primary-red)' }} />
                <h3 style={{ fontSize: '20px', fontFamily: '"Playfair Display", serif', fontWeight: 700, margin: 0 }}>
                  {t('Audio Briefings & Podcasts', 'Audio Briefings & Podcasts')}
                </h3>
              </div>

              {profile.podcasts.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-charcoal)', fontStyle: 'italic' }}>{t('Noch keine Audio-Podcasts oder Interviews aufgezeichnet.', 'Noch keine Audio-Podcasts oder Interviews aufgezeichnet.')}</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {profile.podcasts.map(pod => (
                    <div 
                      key={pod.id}
                      onClick={() => navigate(`/interviews/${pod.id}`)}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '0.5px solid var(--light-border)',
                        borderRadius: '6px',
                        padding: '20px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      className="contributed-card"
                    >
                      <div>
                        <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--primary-red)', letterSpacing: '0.05em', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                          {t(pod.category, pod.category)}
                        </span>
                        <h4 style={{ fontSize: '15px', fontFamily: '"Playfair Display", serif', fontWeight: 700, color: 'var(--text-ink)', margin: 0 }}>
                          {t(pod.title, pod.title)}
                        </h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-charcoal)', margin: '4px 0 8px', lineHeight: 1.4 }}>
                          {t(pod.subtitle, pod.subtitle)}
                        </p>
                        <span style={{ fontSize: '11px', color: 'var(--text-charcoal)', fontFamily: 'var(--font-mono)' }}>
                          {pod.date_published}
                        </span>
                      </div>
                      <ArrowRight size={14} style={{ color: 'var(--primary-red)' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Native Sponsored Banner */}
            <AdSlot position="native" />

          </div>

        </div>
      </div>

      <style>{`
        .contributed-card:hover {
          border-color: var(--primary-red) !important;
          box-shadow: 0 4px 12px rgba(191,155,48,0.05);
        }
        .portfolio-link:hover {
          text-decoration: underline !important;
        }
        @media (max-width: 768px) {
          .student-profile-layout {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </div>
  );
}
