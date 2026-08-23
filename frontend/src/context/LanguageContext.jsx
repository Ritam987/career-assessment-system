import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getStoredLanguage, supportedLanguages, translate } from '../services/multilanguage';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(getStoredLanguage);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('careerCompassLanguage', language);
      document.documentElement.lang = language;
    }
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      languages: supportedLanguages,
      t: (key) => translate(key, language),
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  return context;
};
