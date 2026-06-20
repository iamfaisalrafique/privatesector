import React, { useState, useEffect } from 'react';
import AdSlot from '../components/AdSlot';
import { useLanguage } from '../context/LanguageContext';
import { Briefcase, GraduationCap, MapPin, Calendar, Filter, ArrowRight, UserCheck } from 'lucide-react';

export default function Careers({ navigate }) {
  const { t, isRtl } = useLanguage();
  const [jobs, setJobs] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedType, setSelectedType] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const jobsUrl = `/api/jobs?type=${selectedType}&location=${selectedLocation}`;
        const jobsRes = await fetch(jobsUrl);
        if (jobsRes.ok) setJobs(await jobsRes.json());

        const studentsRes = await fetch('/api/students');
        if (studentsRes.ok) setStudents(await studentsRes.json());
      } catch (e) {
        console.error('Error loading careers data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedType, selectedLocation]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '64px 0', textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '2px solid var(--light-border)', borderTopColor: 'var(--primary-red)', borderRadius: '50%', animation: 'spin 1s infinite linear', margin: '0 auto 16px' }} />
        <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '18px', color: 'var(--text-charcoal)' }}>{t('Karriere-Zentrum wird geladen...', 'Karriere-Zentrum wird geladen...')}</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-ivory)', minHeight: 'calc(100vh - 120px)', padding: '48px 0 64px' }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="caps-label" style={{ display: 'block', marginBottom: '8px' }}>
            {t('TALENT FORUM & CAREERS', 'TALENT FORUM & CAREERS')}
          </span>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '42px', fontWeight: 700, color: 'var(--text-ink)', margin: 0 }}>
            {t('Karriere & Talent-Plattform', 'Karriere & Talent-Plattform')}
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: 'var(--text-charcoal)', marginTop: '8px', maxWidth: '600px', margin: '8px auto 24px' }}>
            {t('Die Schnittstelle zwischen Schweizer Spitzen-Universitäten (wie der HSG und ETH) und den führenden Unternehmen des Privatsektors.', 'Die Schnittstelle zwischen Schweizer Spitzen-Universitäten (wie der HSG und ETH) und den führenden Unternehmen des Privatsektors.')}
          </p>
          <button 
            onClick={() => navigate('/student-dashboard')}
            className="btn btn-gold-fill" 
            style={{ minHeight: '44px', fontSize: '14px', padding: '10px 24px' }}
          >
            {t('Go to Student Talent Dashboard 🚀', 'Go to Student Talent Dashboard 🚀')}
          </button>
        </div>

        {/* Leaderboard Ad Zone A */}
        <AdSlot position="A" />

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '48px', marginTop: '48px' }} className="careers-layout-grid">
          
          {/* Left Column: Featured Student Writers (Student Talent) */}
          <div>
            <div style={{ borderBottom: '0.5px solid var(--light-border)', paddingBottom: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GraduationCap size={20} style={{ color: 'var(--primary-red)' }} />
              <h2 style={{ fontSize: '22px', fontFamily: '"Playfair Display", serif', fontWeight: 700, margin: 0 }}>
                {t('Nachwuchstalente', 'Nachwuchstalente')}
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-charcoal)', lineHeight: 1.5, marginBottom: '24px' }}>
              {t('Diese Studierenden publizieren exklusive Wirtschaftsanalysen und Firmenstudien auf unserer Plattform. Klicken Sie auf ein Profil, um deren Dossier und Portfolio einzusehen.', 'Diese Studierenden publizieren exklusive Wirtschaftsanalysen und Firmenstudien auf unserer Plattform. Klicken Sie auf ein Profil, um deren Dossier und Portfolio einzusehen.')}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {students.map(s => (
                <div 
                  key={s.id}
                  onClick={() => navigate(`/student/${s.id}`)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '0.5px solid var(--light-border)',
                    borderRadius: '6px',
                    padding: '20px',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'center',
                    transition: 'all 0.2s ease-in-out'
                  }}
                  className="student-card"
                >
                  <img 
                    src={s.avatar} 
                    alt={s.name} 
                    style={{ width: '64px', height: '64px', borderRadius: '50%', border: '1.5px solid var(--primary-red)', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <strong style={{ display: 'block', fontSize: '15px', color: 'var(--text-ink)' }}>{s.name}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--primary-red)', display: 'block', margin: '2px 0 4px', fontWeight: 500 }}>
                      {t(s.university, s.university)}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-charcoal)', fontFamily: 'var(--font-mono)' }}>
                      {t(s.study_field, s.study_field)} · {t('Klasse', 'Klasse')} {s.grad_year}
                    </span>
                  </div>
                  <ArrowRight size={16} style={{ color: 'var(--primary-red)' }} className="arrow-icon" />
                </div>
              ))}
            </div>

            {/* Sidebar Ad Slot Zone C */}
            <AdSlot position="C" />
          </div>

          {/* Right Column: Corporate Jobs & Internships Feed */}
          <div>
            
            {/* Header & Filter Controls */}
            <div style={{ borderBottom: '0.5px solid var(--light-border)', paddingBottom: '12px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={20} style={{ color: 'var(--primary-red)' }} />
                <h2 style={{ fontSize: '22px', fontFamily: '"Playfair Display", serif', fontWeight: 700, margin: 0 }}>
                  {t('Stellenangebote & Praktika', 'Stellenangebote & Praktika')}
                </h2>
              </div>
              
              {/* Filter Pills */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Filter size={14} style={{ color: 'var(--text-charcoal)' }} />
                <select 
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--light-border)', backgroundColor: '#FFF', color: 'var(--text-ink)' }}
                >
                  <option value="">{t('Alle Typen', 'Alle Typen')}</option>
                  <option value="Internship">{t('Praktikum', 'Praktikum')}</option>
                  <option value="Trainee">{t('Trainee Program', 'Trainee Program')}</option>
                </select>
                
                <select 
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--light-border)', backgroundColor: '#FFF', color: 'var(--text-ink)' }}
                >
                  <option value="">{t('Alle Kantone', 'Alle Kantone')}</option>
                  <option value="ZH">{t('Zurich (ZH)', 'Zurich (ZH)')}</option>
                  <option value="VD">{t('Vaud (VD)', 'Vaud (VD)')}</option>
                  <option value="BS">{t('Basel (BS)', 'Basel (BS)')}</option>
                  <option value="SG">{t('St. Gallen (SG)', 'St. Gallen (SG)')}</option>
                </select>
              </div>
            </div>

            {/* Jobs list */}
            {jobs.length === 0 ? (
              <div style={{ backgroundColor: '#FFF', border: '0.5px solid var(--light-border)', borderRadius: '6px', padding: '40px', textAlign: 'center', color: 'var(--text-charcoal)' }}>
                {t('Keine passenden Stellenangebote im System gefunden.', 'Keine passenden Stellenangebote im System gefunden.')}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {jobs.map(j => (
                  <div 
                    key={j.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '0.5px solid var(--light-border)',
                      borderRadius: '6px',
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      borderLeft: '4px solid var(--primary-red)'
                    }}
                  >
                    {/* Badge */}
                    <span 
                      style={{ 
                        position: 'absolute', 
                        top: '20px', 
                        right: '24px', 
                        fontSize: '10px', 
                        textTransform: 'uppercase', 
                        fontWeight: 700, 
                        color: j.type === 'Internship' ? '#0066CC' : 'var(--primary-red)',
                        backgroundColor: j.type === 'Internship' ? 'rgba(0,102,204,0.1)' : 'rgba(191,155,48,0.1)',
                        padding: '4px 8px',
                        borderRadius: '4px'
                      }}
                    >
                      {t(j.type, j.type)}
                    </span>

                    {/* Job Title & Company */}
                    <h3 style={{ fontSize: '18px', fontFamily: '"Playfair Display", serif', fontWeight: 700, color: 'var(--text-ink)', margin: '0 0 4px', maxWidth: '80%' }}>
                      {t(j.title, j.title)}
                    </h3>
                    
                    <span 
                      onClick={() => j.company_id && navigate(`/unternehmen/${j.company_id}`)}
                      style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-charcoal)', cursor: j.company_id ? 'pointer' : 'default', textDecoration: j.company_id ? 'underline' : 'none', display: 'inline-block', marginBottom: '16px' }}
                    >
                      {t(j.company_name, j.company_name)}
                    </span>

                    {/* Description */}
                    <p style={{ fontSize: '13px', color: 'var(--text-charcoal)', lineHeight: 1.6, margin: '0 0 20px' }}>
                      {t(j.description, j.description)}
                    </p>

                    {/* Meta info & Action */}
                    <div 
                      style={{ 
                        borderTop: '0.5px solid var(--light-border)', 
                        paddingTop: '16px', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        fontSize: '11px',
                        color: 'var(--text-charcoal)'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} /> {t(j.location, j.location)}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} /> {j.date_posted}
                        </span>
                      </div>
                      
                      <a 
                        href={j.apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-gold-fill"
                        style={{ fontSize: '11px', padding: '6px 14px', minHeight: '32px', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                      >
                        <span>{t('Bewerben', 'Bewerben')}</span>
                        <ArrowRight size={12} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Native Sponsored Banner */}
            <AdSlot position="native" />
          </div>

        </div>

      </div>

      <style>{`
        .student-card:hover {
          border-color: var(--primary-red) !important;
          box-shadow: 0 4px 12px rgba(191,155,48,0.08);
        }
        .student-card:hover .arrow-icon {
          transform: translateX(4px);
        }
        .student-card .arrow-icon {
          transition: transform 0.2s ease;
        }
        @media (max-width: 768px) {
          .careers-layout-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </div>
  );
}
