import React, { createContext, useContext } from 'react';

const LanguageContext = createContext();

export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' }
];

export const LanguageProvider = ({ children }) => {
  const t = (key, defaultText = '') => defaultText;

  return (
    <LanguageContext.Provider value={{
      currentLang: 'en',
      switchLanguage: () => {},
      t,
      isRtl: false,
      loading: false
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
