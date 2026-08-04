import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function CookieBanner() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('privatesector_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('privatesector_cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1A1A1A',
        borderTop: '2px solid var(--primary-red)',
        padding: '16px 24px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ flex: '1 1 300px' }}>
        <p style={{ color: '#FFFFFF', fontSize: '13px', margin: 0, fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>
          {t('cookie_text', 'We use cookies to optimize your experience on privatesector.vitalswiss.ch. By using the website, you agree to our policies.')}
        </p>
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button 
          onClick={handleAccept}
          className="btn btn-gold-fill"
          style={{
            fontSize: '12px',
            padding: '8px 16px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          {t('cookie_accept', 'Accept')}
        </button>
      </div>
    </div>
  );
}
