import React, { useState, useEffect } from 'react';

export default function CookieBanner() {
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
        borderTop: '2px solid #BF9B30',
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
          Wir verwenden Cookies, um Ihre Erfahrung auf privatesector.vitalswiss.ch zu optimieren. Mit der Nutzung der Website stimmen Sie unseren Richtlinien zu. 
          <span style={{ color: '#A09885', display: 'block', fontSize: '11px', marginTop: '4px' }}>
            We use cookies to optimize your experience. By using our website, you agree to our policies.
          </span>
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
          Einverstanden / Accept
        </button>
      </div>
    </div>
  );
}
