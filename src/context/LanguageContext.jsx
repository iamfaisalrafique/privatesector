import React, { createContext, useState, useEffect, useContext } from 'react';

const LanguageContext = createContext();

export const LANGUAGES = [
  { code: 'de', label: 'Deutsch', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', label: 'Français', native: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'ar', label: 'العربية', native: 'العربية', flag: '🇸🇦', rtl: true }
];

const getPathnameLanguage = () => {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname || '';
  const parts = path.split('/').filter(Boolean);
  const exists = LANGUAGES.some(l => l.code === parts[0]);
  return exists ? parts[0] : null;
};

export const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState(() => {
    const pathLang = getPathnameLanguage();
    if (pathLang) return pathLang;
    const saved = localStorage.getItem('privatesector_lang');
    if (saved) return saved;
    return 'en';
  });

  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchTranslations = async (langCode) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/translations?lang=${langCode}`);
      if (res.ok) {
        const data = await res.json();
        setTranslations(data || {});
      }
    } catch (error) {
      console.error('Error loading translations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTranslations(currentLang);
    
    const activeLanguage = LANGUAGES.find(l => l.code === currentLang);
    const isRtl = activeLanguage?.rtl || false;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
    
    localStorage.setItem('privatesector_lang', currentLang);
  }, [currentLang]);

  const switchLanguage = (langCode) => {
    if (langCode === currentLang) return;
    setCurrentLang(langCode);
    
    const path = window.location.pathname || '';
    const queryStr = window.location.search || '';
    const parts = path.split('/').filter(Boolean);
    
    let pathPart = path;
    if (parts.length > 0 && LANGUAGES.some(l => l.code === parts[0])) {
      pathPart = '/' + parts.slice(1).join('/');
    }
    
    const targetPath = langCode === 'en'
      ? (pathPart === '' ? '/' : pathPart)
      : `/${langCode}${pathPart === '/' ? '' : pathPart}`;

    window.history.pushState(null, '', `${targetPath}${queryStr}`);
    window.dispatchEvent(new Event('popstate'));
  };

  const t = (key, defaultText = '') => {
    if (translations && translations[key] !== undefined && translations[key] !== null) {
      return translations[key];
    }
    return defaultText;
  };

  const activeLanguage = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[2];

  return (
    <LanguageContext.Provider value={{
      currentLang,
      switchLanguage,
      t,
      isRtl: activeLanguage.rtl || false,
      loading
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      currentLang: 'en',
      switchLanguage: () => {},
      t: (key, defaultText = '') => defaultText,
      isRtl: false,
      loading: false
    };
  }
  return context;
};
