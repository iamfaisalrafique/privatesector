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
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(213, 43, 30, 0.25)',
          color: '#374151',
          padding: '6px 12px',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          fontFamily: 'Inter, sans-serif',
          transition: 'all 150ms ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--primary-red)';
          e.currentTarget.style.backgroundColor = '#FFF5F5';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(213, 43, 30, 0.25)';
          e.currentTarget.style.backgroundColor = '#FFFFFF';
        }}
      >
        <span>{activeLangObj.flag}</span>
        <span style={{ fontWeight: 600 }}>{activeLangObj.code.toUpperCase()}</span>
        <span style={{ fontSize: '9px', opacity: 0.7, color: 'var(--primary-red)' }}>▼</span>
      </button>

      {isOpen && (
        <div 
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            backgroundColor: '#FFFFFF',
            border: '1px solid rgba(213, 43, 30, 0.15)',
            borderRadius: '6px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
            padding: '10px',
            zIndex: 1000,
            width: '280px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6px'
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
                  borderRadius: '4px',
                  backgroundColor: isActive ? '#FFF5F5' : 'transparent',
                  color: isActive ? 'var(--primary-red)' : '#374151',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '12px',
                  width: '100%',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'background-color 150ms ease'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = '#F9FAFB';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
                className="lang-option-btn"
              >
                <span>{lang.flag}</span>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <span style={{ fontWeight: isActive ? 600 : 400 }}>{lang.native}</span>
                  <span style={{ fontSize: '10px', color: '#6B7280', display: 'block' }}>{lang.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
