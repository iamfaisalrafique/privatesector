import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';

export default function LanguageSwitcher() {
  const { currentLang, switchLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeLangObj = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: '1px solid #E8E0C8',
          color: '#FFFFFF',
          padding: '6px 12px',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          fontFamily: 'Inter, sans-serif'
        }}
      >
        <span>{activeLangObj.flag}</span>
        <span style={{ fontWeight: 600 }}>{activeLangObj.code.toUpperCase()}</span>
        <span style={{ fontSize: '9px', opacity: 0.7 }}>▼</span>
      </button>

      {isOpen && (
        <div 
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            backgroundColor: '#FFFFFF',
            border: '1px solid #E8E0C8',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            padding: '8px',
            zIndex: 1000,
            width: '280px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4px'
          }}
        >
          {LANGUAGES.map((lang) => {
            const isActive = lang.code === currentLang;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  switchLanguage(lang.code);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 8px',
                  border: 'none',
                  borderRadius: '3px',
                  backgroundColor: isActive ? '#FAF4E5' : 'transparent',
                  color: isActive ? '#BF9B30' : '#1A1A1A',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '12px',
                  width: '100%',
                  fontFamily: 'Inter, sans-serif'
                }}
                className="lang-option-btn"
              >
                <span>{lang.flag}</span>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <span style={{ fontWeight: isActive ? 600 : 400 }}>{lang.native}</span>
                  <span style={{ fontSize: '10px', color: '#666666', display: 'block' }}>{lang.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
