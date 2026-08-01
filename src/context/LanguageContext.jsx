import React, { createContext, useState, useEffect, useContext } from 'react';

const LanguageContext = createContext();

export const LANGUAGES = [
  { code: 'de', label: 'Deutsch', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', label: 'Français', native: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'ar', label: 'العربية', native: 'العربية', flag: '🇸🇦', rtl: true }
];

const getPathnameLanguage = () => {
  const path = window.location.pathname || '';
  const parts = path.split('/').filter(Boolean);
  const exists = LANGUAGES.some(l => l.code === parts[0]);
  return exists ? parts[0] : null;
};

export const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState(() => {
    // 1. Check URL path
    const pathLang = getPathnameLanguage();
    if (pathLang) return pathLang;

    // 2. Check local storage
    const saved = localStorage.getItem('privatesector_lang');
    if (saved) return saved;

    // 3. Default to English
    return 'en';
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

  // Sync state to local storage, documents, and URL path
  useEffect(() => {
    fetchTranslations(currentLang);
    
    // Set text direction and lang attribute
    const activeLanguage = LANGUAGES.find(l => l.code === currentLang);
    const isRtl = activeLanguage?.rtl || false;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
    
    localStorage.setItem('privatesector_lang', currentLang);

    // Sync to path prefix if it differs
    const path = window.location.pathname || '';
    const queryStr = window.location.search || '';
    const parts = path.split('/').filter(Boolean);
    
    let pathPart = path;
    if (parts.length > 0 && LANGUAGES.some(l => l.code === parts[0])) {
      pathPart = '/' + parts.slice(1).join('/');
    }
    
    // For English ('en'), default URL is clean without /en prefix
    // For non-English ('de', 'fr', 'ar'), URL includes /lang prefix
    const targetPath = currentLang === 'en'
      ? (pathPart === '' ? '/' : pathPart)
      : `/${currentLang}${pathPart === '/' ? '' : pathPart}`;

    if (path !== targetPath) {
      window.history.replaceState(null, '', `${targetPath}${queryStr}`);
      // Dispatch popstate event to let routing listeners know path changed
      window.dispatchEvent(new Event('popstate'));
    }
  }, [currentLang]);

  // Handle pathname changes externally (browser Back/Forward)
  useEffect(() => {
    const handlePopState = () => {
      const pathLang = getPathnameLanguage();
      if (pathLang && pathLang !== currentLang) {
        setCurrentLang(pathLang);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
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
    <LanguageContext.Provider value={{ 
      currentLang, 
      language: currentLang,
      switchLanguage, 
      setLanguage: switchLanguage,
      t, 
      isRtl, 
      loading, 
      refreshTranslations: () => fetchTranslations(currentLang) 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
