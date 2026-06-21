import React, { createContext, useState, useEffect, useContext } from 'react';

const LanguageContext = createContext();

export const LANGUAGES = [
  { code: 'de', label: 'Deutsch', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', label: 'Français', native: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'ar', label: 'العربية', native: 'العربية', flag: '🇸🇦', rtl: true }
];

export const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState(() => {
    // 1. Check local storage
    const saved = localStorage.getItem('privatesector_lang');
    if (saved) return saved;

    // 2. Check browser locale
    const browserLang = navigator.language.split('-')[0];
    const exists = LANGUAGES.some(l => l.code === browserLang);
    return exists ? browserLang : 'en'; // default to English (en)
  });

  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(true);

  // Sync translation bundle from backend
  const fetchTranslations = async (langCode) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/translations?lang=${langCode}`);
      if (res.ok) {
        const data = await res.json();
        setTranslations(data);
      }
    } catch (error) {
      console.error('Error loading translations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTranslations(currentLang);
    
    // Set text direction and lang attribute
    const activeLanguage = LANGUAGES.find(l => l.code === currentLang);
    const isRtl = activeLanguage?.rtl || false;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
    
    localStorage.setItem('privatesector_lang', currentLang);
  }, [currentLang]);

  const switchLanguage = (langCode) => {
    setCurrentLang(langCode);
  };

  // Safe translation helper
  const t = (key, defaultText = '') => {
    if (translations[key] !== undefined) {
      return translations[key];
    }
    return defaultText;
  };

  const isRtl = LANGUAGES.find(l => l.code === currentLang)?.rtl || false;

  return (
    <LanguageContext.Provider value={{ currentLang, switchLanguage, t, isRtl, loading, refreshTranslations: () => fetchTranslations(currentLang) }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
