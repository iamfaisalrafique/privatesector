import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Check, Shield, Globe, Lock } from 'lucide-react';

export default function Auth({ mode = 'login', navigate }) {
  const { t, isRtl, language, setLanguage } = useLanguage();
  const [authMode, setAuthMode] = useState(mode); // login or register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [preferredLang, setPreferredLang] = useState(language);

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    alert(
      authMode === 'login' 
        ? `${t('Erfolgreich angemeldet als', 'Erfolgreich angemeldet als')} ${email}!` 
        : `${t('Konto erfolgreich registriert für', 'Konto erfolgreich registriert für')} ${name} (${email}) ${t('mit Sprache', 'mit Sprache')} ${preferredLang}!`
    );
    navigate('/');
  };

  const languagesList = [
    { code: 'de', label: 'Deutsch', native: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', label: 'Français', native: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
    { code: 'it', label: 'Italiano', native: 'Italiano', flag: '🇮🇹' },
    { code: 'rm', label: 'Rumantsch', native: 'Rumantsch', flag: '🇨🇭' },
    { code: 'es', label: 'Español', native: 'Español', flag: '🇪🇸' },
    { code: 'pt', label: 'Português', native: 'Português', flag: '🇵🇹' },
    { code: 'ar', label: 'العربية', native: 'العربية', flag: '🇸🇦' },
    { code: 'zh', label: 'Chinese', native: '中文', flag: '🇨🇳' },
    { code: 'ru', label: 'Russian', native: 'Русский', flag: '🇷🇺' },
    { code: 'ja', label: 'Japanese', native: '日本語', flag: '🇯🇵' },
    { code: 'tr', label: 'Turkish', native: 'Türkçe', flag: '🇹🇷' },
    { code: 'nl', label: 'Dutch', native: 'Nederlands', flag: '🇳🇱' },
    { code: 'pl', label: 'Polish', native: 'Polski', flag: '🇵🇱' },
    { code: 'ko', label: 'Korean', native: '한국어', flag: '🇰🇷' },
    { code: 'sv', label: 'Swedish', native: 'Svenska', flag: '🇸🇪' },
    { code: 'da', label: 'Danish', native: 'Dansk', flag: '🇩🇰' },
    { code: 'fi', label: 'Finnish', native: 'Suomi', flag: '🇫🇮' }
  ];

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)', backgroundColor: 'var(--bg-ivory)' }} className="auth-split-screen">
      
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
        {/* Brand Logo */}
        <div 
          onClick={() => navigate('/')} 
          style={{ 
            cursor: 'pointer', 
            fontFamily: '"Playfair Display", Georgia, serif', 
            fontSize: '24px', 
            fontWeight: 700, 
            letterSpacing: '-0.02em',
            display: 'inline-flex',
            alignItems: 'baseline'
          }}
        >
          <span style={{ color: 'var(--primary-red)' }}>privatesector</span>
          <span style={{ color: '#8B0000', fontSize: '18px', fontWeight: 800 }}>.ch</span>
        </div>

        {/* Value Proposition */}
        <div style={{ maxWidth: '440px', margin: '40px 0' }}>
          <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '36px', fontWeight: 700, lineHeight: 1.3, marginBottom: '24px', color: '#FFFDF7' }}>
            {t('Schweizer Wirtschaftsdaten,', 'Schweizer Wirtschaftsdaten,')} <span style={{ color: 'var(--primary-red)', fontStyle: 'italic' }}>{t('vollständig verifiziert.', 'vollständig verifiziert.')}</span>
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(191, 155, 48, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check size={14} style={{ color: 'var(--primary-red)' }} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '14px', color: '#FFFDF7' }}>{t('Verifizierte B2B-Firmendossiers', 'Verifizierte B2B-Firmendossiers')}</strong>
                <span style={{ fontSize: '12px', color: '#888888' }}>{t('Metriken, Kantons- und Registerdaten direkt aus offiziellen Quellen.', 'Metriken, Kantons- und Registerdaten direkt aus offiziellen Quellen.')}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(191, 155, 48, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Shield size={14} style={{ color: 'var(--primary-red)' }} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '14px', color: '#FFFDF7' }}>{t('Präzise Analysen & Marktberichte', 'Präzise Analysen & Marktberichte')}</strong>
                <span style={{ fontSize: '12px', color: '#888888' }}>{t('Unabhängiger Wirtschaftsjournalismus mit exklusiven CEO-Interviews.', 'Unabhängiger Wirtschaftsjournalismus mit exklusiven CEO-Interviews.')}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(191, 155, 48, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
        <div style={{ width: '100%', maxWidth: '380px' }}>
          
          <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '32px', fontWeight: 700, color: 'var(--text-ink)', marginBottom: '8px', textAlign: 'center' }}>
            {authMode === 'login' ? t('Anmelden', 'Anmelden') : t('Konto erstellen', 'Konto erstellen')}
          </h2>
          
          <p style={{ fontSize: '13px', color: 'var(--text-charcoal)', marginBottom: '32px', textAlign: 'center' }}>
            {authMode === 'login' ? t('Willkommen zurück im Schweizer B2B Portal', 'Willkommen zurück im Schweizer B2B Portal') : t('Erhalten Sie unbegrenzten Zugriff auf Firmendaten', 'Erhalten Sie unbegrenzten Zugriff auf Firmendaten')}
          </p>

          {/* Social Logins */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            <button 
              onClick={() => alert('LinkedIn Social Login wird geladen...')}
              className="btn btn-gold-outline"
              style={{ width: '100%', display: 'flex', gap: '12px', color: 'var(--text-ink)', border: '0.5px solid var(--light-border)', backgroundColor: '#FFFFFF', minHeight: '44px' }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ color: '#0077B5' }}><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              <span>{t('Mit LinkedIn anmelden', 'Mit LinkedIn anmelden')}</span>
            </button>

            <button 
              onClick={() => alert('Google Social Login wird geladen...')}
              className="btn btn-gold-outline"
              style={{ width: '100%', display: 'flex', gap: '12px', color: 'var(--text-ink)', border: '0.5px solid var(--light-border)', backgroundColor: '#FFFFFF', minHeight: '44px' }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ color: '#EA4335' }}><path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.466 0-6.277-2.85-6.277-6.36s2.81-6.36 6.277-6.36c1.554 0 2.969.57 4.072 1.505l3.056-3.082C18.96 2.265 15.82 1 12.24 1 6.033 1 1 6.06 1 12.3s5.033 11.3 11.24 11.3c5.962 0 10.635-4.22 10.635-10.82 0-.665-.06-1.165-.18-1.495H12.24z"/></svg>
              <span>{t('Mit Google anmelden', 'Mit Google anmelden')}</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0', width: '100%' }}>
            <div style={{ flex: 1, height: '0.5px', backgroundColor: 'var(--light-border)' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-charcoal)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('oder mit E-Mail', 'oder mit E-Mail')}</span>
            <div style={{ flex: 1, height: '0.5px', backgroundColor: 'var(--light-border)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {authMode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-ink)' }}>{t('Name', 'Name')}</label>
                <input 
                  type="text" 
                  required 
                  placeholder={t('Ihr vollständiger Name', 'Ihr vollständiger Name')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field" 
                  style={{ border: '0.5px solid var(--light-border)', borderRadius: '4px' }}
                />
              </div>
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
                style={{ border: '0.5px solid var(--light-border)', borderRadius: '4px' }}
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
                style={{ border: '0.5px solid var(--light-border)', borderRadius: '4px' }}
              />
            </div>

            {/* Language Preference Selector (Onboarding) */}
            {authMode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-ink)' }}>{t('Bevorzugte Sprache', 'Bevorzugte Sprache')}</label>
                <select
                  value={preferredLang}
                  onChange={(e) => setPreferredLang(e.target.value)}
                  className="input-field"
                  style={{ border: '0.5px solid var(--light-border)', borderRadius: '4px', backgroundColor: '#FFFFFF' }}
                >
                  {languagesList.map(l => (
                    <option key={l.code} value={l.code}>
                      {l.flag} {l.native}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-gold-fill" 
              style={{ width: '100%', height: '48px', fontSize: '14px', marginTop: '12px' }}
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
                  style={{ background: 'none', border: 'none', color: 'var(--primary-gold)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {t('Jetzt registrieren', 'Jetzt registrieren')}
                </button>
              </span>
            ) : (
              <span style={{ color: 'var(--text-charcoal)' }}>
                {t('Bereits registriert?', 'Bereits registriert?')}{' '}
                <button 
                  onClick={() => setAuthMode('login')} 
                  style={{ background: 'none', border: 'none', color: 'var(--primary-gold)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
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
