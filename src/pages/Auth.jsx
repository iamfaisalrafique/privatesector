import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Check, Shield, Lock } from 'lucide-react';

export default function Auth({ mode = 'login', navigate, onLoginSuccess }) {
  const { t, isRtl, language } = useLanguage();
  const [authMode, setAuthMode] = useState(mode); // login or register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student'); // student or company
  
  // Extra fields for Student signup
  const [university, setUniversity] = useState('');
  const [studyField, setStudyField] = useState('');
  
  // Extra fields for Company signup
  const [canton, setCanton] = useState('ZH');
  const [industry, setIndustry] = useState('Consumer Goods');
  const [sizeClass, setSizeClass] = useState('Medium');

  const cantonList = ['ZH', 'BE', 'LU', 'UR', 'SZ', 'OW', 'NW', 'GL', 'ZG', 'FR', 'SO', 'BS', 'BL', 'SH', 'AR', 'AI', 'SG', 'GR', 'AG', 'TG', 'TI', 'VD', 'VS', 'NE', 'GE', 'JU'];
  const industriesList = ['Consumer Goods', 'Financial Services', 'Technology', 'Healthcare', 'Consulting', 'Services', 'Retail', 'Logistics', 'Manufacturing'];

  const handleAuthSubmit = async (e) => {
    e.preventDefault();

    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/signup';
    
    // Prepare payload
    const payload = {
      email,
      password,
      role: authMode === 'login' ? undefined : role,
      name: authMode === 'login' ? undefined : name,
      extraData: authMode === 'login' ? undefined : {
        university: role === 'student' ? university : undefined,
        study_field: role === 'student' ? studyField : undefined,
        canton: role === 'company' ? canton : undefined,
        industry: role === 'company' ? industry : undefined,
        size_class: role === 'company' ? sizeClass : undefined
      }
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.error || 'Authentication failed');
        return;
      }

      if (data.success && data.user) {
        localStorage.setItem('userSession', JSON.stringify(data.user));
        if (onLoginSuccess) {
          onLoginSuccess(data.user);
        }
        alert(authMode === 'login' ? 'Successfully logged in!' : 'Successfully registered!');
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Please try again.');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 100px)', backgroundColor: 'var(--bg-ivory)' }} className="auth-split-screen">
      
      {/* Left 50% Panel - Dark #0A0A0A */}
      <div 
        style={{ 
          flex: 1, 
          backgroundColor: '#0A0A0A', 
          color: '#FFFDF7', 
          padding: '64px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative'
        }}
        className="auth-left-col"
      >
        {/* Value Proposition */}
        <div style={{ maxWidth: '440px', margin: '40px 0' }}>
          <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '36px', fontWeight: 700, lineHeight: 1.3, marginBottom: '24px', color: '#FFFDF7' }}>
            {t('Schweizer Wirtschaftsdaten,', 'Schweizer Wirtschaftsdaten,')} <span style={{ color: 'var(--primary-red)', fontStyle: 'italic' }}>{t('vollständig verifiziert.', 'vollständig verifiziert.')}</span>
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(213, 43, 30, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check size={14} style={{ color: 'var(--primary-red)' }} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '14px', color: '#FFFDF7' }}>{t('Verifizierte B2B-Firmendossiers', 'Verifizierte B2B-Firmendossiers')}</strong>
                <span style={{ fontSize: '12px', color: '#888888' }}>{t('Metriken, Kantons- und Registerdaten direkt aus offiziellen Quellen.', 'Metriken, Kantons- und Registerdaten direkt aus offiziellen Quellen.')}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(213, 43, 30, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Shield size={14} style={{ color: 'var(--primary-red)' }} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '14px', color: '#FFFDF7' }}>{t('Präzise Analysen & Marktberichte', 'Präzise Analysen & Marktberichte')}</strong>
                <span style={{ fontSize: '12px', color: '#888888' }}>{t('Unabhängiger Wirtschaftsjournalismus mit exklusiven CEO-Interviews.', 'Unabhängiger Wirtschaftsjournalismus mit exklusiven CEO-Interviews.')}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(213, 43, 30, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Lock size={14} style={{ color: 'var(--primary-red)' }} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '14px', color: '#FFFDF7' }}>{t('100% DSGVO / GDPR Konformität', '100% DSGVO / GDPR Konformität')}</strong>
                <span style={{ fontSize: '12px', color: '#888888' }}>{t('Ihre Präferenzen und Daten werden vollständig verschlüsselt in der Schweiz gehostet.', 'Ihre Präferenzen und Daten werden vollständig verschlüsselt in der Schweiz gehostet.')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#888888', borderTop: '0.5px solid #2A2A2A', paddingTop: '16px' }}>
          <span>{t('Swiss-made', 'Swiss-made')}</span>
          <span>·</span>
          <span>{t('GDPR-compliant', 'GDPR-compliant')}</span>
          <span>·</span>
          <span>{t('18 languages supported', '18 languages supported')}</span>
        </div>
      </div>

      {/* Right 50% Panel - Ivory #FFFDF7 */}
      <div 
        style={{ 
          flex: 1, 
          padding: '64px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
        className="auth-right-col"
      >
        <div style={{ width: '100%', maxWidth: '400px' }}>
          
          <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '32px', fontWeight: 700, color: 'var(--text-ink)', marginBottom: '8px', textAlign: 'center' }}>
            {authMode === 'login' ? t('Anmelden', 'Anmelden') : t('Konto erstellen', 'Konto erstellen')}
          </h2>
          
          <p style={{ fontSize: '13px', color: 'var(--text-charcoal)', marginBottom: '24px', textAlign: 'center' }}>
            {authMode === 'login' ? t('Willkommen zurück im Schweizer B2B Portal', 'Willkommen zurück im Schweizer B2B Portal') : t('Erhalten Sie unbegrenzten Zugriff auf Firmendaten', 'Erhalten Sie unbegrenzten Zugriff auf Firmendaten')}
          </p>

          {/* Form */}
          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {authMode === 'register' && (
              <>
                {/* Role Tabs */}
                <div style={{ display: 'flex', gap: '8px', backgroundColor: '#F3F4F6', padding: '4px', borderRadius: '6px', marginBottom: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      backgroundColor: role === 'student' ? '#FFFFFF' : 'transparent',
                      color: role === 'student' ? 'var(--primary-red)' : '#4B5563',
                      boxShadow: role === 'student' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 150ms ease'
                    }}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('company')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      backgroundColor: role === 'company' ? '#FFFFFF' : 'transparent',
                      color: role === 'company' ? 'var(--primary-red)' : '#4B5563',
                      boxShadow: role === 'company' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 150ms ease'
                    }}
                  >
                    Company
                  </button>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-ink)' }}>
                    {role === 'student' ? 'Student Full Name' : 'Company Brand Name'}
                  </label>
                  <input 
                    type="text" 
                    required 
                    placeholder={role === 'student' ? 'e.g. Lukas Keller' : 'e.g. Acme Corporation'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field" 
                    style={{ border: '0.5px solid var(--light-border)', borderRadius: '4px', width: '100%', padding: '10px', boxSizing: 'border-box' }}
                  />
                </div>
              </>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-ink)' }}>{t('E-Mail-Adresse', 'E-Mail-Adresse')}</label>
              <input 
                type="email" 
                required 
                placeholder="name@firma.ch"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field" 
                style={{ border: '0.5px solid var(--light-border)', borderRadius: '4px', width: '100%', padding: '10px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-ink)' }}>{t('Passwort', 'Passwort')}</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field" 
                style={{ border: '0.5px solid var(--light-border)', borderRadius: '4px', width: '100%', padding: '10px', boxSizing: 'border-box' }}
              />
            </div>

            {/* Extra Role Fields */}
            {authMode === 'register' && role === 'student' && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-ink)' }}>University</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. ETH Zürich"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    style={{ border: '0.5px solid var(--light-border)', borderRadius: '4px', width: '100%', padding: '10px', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-ink)' }}>Study Field</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Computer Science"
                    value={studyField}
                    onChange={(e) => setStudyField(e.target.value)}
                    style={{ border: '0.5px solid var(--light-border)', borderRadius: '4px', width: '100%', padding: '10px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            )}

            {authMode === 'register' && role === 'company' && (
              <>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-ink)' }}>Canton</label>
                    <select
                      value={canton}
                      onChange={(e) => setCanton(e.target.value)}
                      style={{ border: '0.5px solid var(--light-border)', borderRadius: '4px', width: '100%', padding: '10px', boxSizing: 'border-box', backgroundColor: '#FFFFFF' }}
                    >
                      {cantonList.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-ink)' }}>Industry</label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      style={{ border: '0.5px solid var(--light-border)', borderRadius: '4px', width: '100%', padding: '10px', boxSizing: 'border-box', backgroundColor: '#FFFFFF' }}
                    >
                      {industriesList.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-ink)' }}>Company Size</label>
                  <select
                    value={sizeClass}
                    onChange={(e) => setSizeClass(e.target.value)}
                    style={{ border: '0.5px solid var(--light-border)', borderRadius: '4px', width: '100%', padding: '10px', boxSizing: 'border-box', backgroundColor: '#FFFFFF' }}
                  >
                    <option value="Micro">Micro (1-9 employees)</option>
                    <option value="Small">Small (10-49 employees)</option>
                    <option value="Medium">Medium (50-249 employees)</option>
                    <option value="Large">Large (250+ employees)</option>
                  </select>
                </div>
              </>
            )}

            <button 
              type="submit" 
              className="btn btn-gold-fill" 
              style={{ width: '100%', height: '48px', fontSize: '14px', marginTop: '12px', cursor: 'pointer', backgroundColor: 'var(--primary-red)', color: '#FFFFFF', border: 'none', borderRadius: '4px', fontWeight: 600 }}
            >
              {authMode === 'login' ? t('Anmelden', 'Anmelden') : t('Konto erstellen', 'Konto erstellen')}
            </button>
          </form>

          {/* Toggle auth mode links */}
          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px' }}>
            {authMode === 'login' ? (
              <span style={{ color: 'var(--text-charcoal)' }}>
                {t('Noch kein Konto?', 'Noch kein Konto?')}{' '}
                <button 
                  onClick={() => setAuthMode('register')} 
                  style={{ background: 'none', border: 'none', color: 'var(--primary-red)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {t('Jetzt registrieren', 'Jetzt registrieren')}
                </button>
              </span>
            ) : (
              <span style={{ color: 'var(--text-charcoal)' }}>
                {t('Bereits registriert?', 'Bereits registriert?')}{' '}
                <button 
                  onClick={() => setAuthMode('login')} 
                  style={{ background: 'none', border: 'none', color: 'var(--primary-red)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {t('Hier anmelden', 'Hier anmelden')}
                </button>
              </span>
            )}
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .auth-split-screen {
            flex-direction: column !important;
          }
          .auth-left-col {
            padding: 32px !important;
            flex: none !important;
          }
          .auth-right-col {
            padding: 32px !important;
            flex: none !important;
          }
        }
      `}</style>
    </div>
  );
}
