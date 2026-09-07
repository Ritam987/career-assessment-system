/**
 * ============================================================================
 * MULTILINGUAL i18n CONTEXT PROVIDER (LanguageContext.jsx)
 * ============================================================================
 * Purpose: Manages global multi-language translation state across English (EN),
 * Bengali (BN), and Hindi (HI). Automatically syncs the selected language
 * code to localStorage and sets the HTML document lang attribute.
 * Exports the `t(key)` helper function for component template translations.
 * ============================================================================
 */

// 1. Core React Imports
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

// 2. Multi-language Helper Functions & Dictionaries Import
import { getStoredLanguage, supportedLanguages, translate } from '../services/multilanguage';

// Create React Context object for Language
const LanguageContext = createContext(null);

/**
 * LanguageProvider Wrapper Component
 * Provides current active language code, setter function, supported languages list,
 * and translation lookup function `t(key)` to child components.
 */
export const LanguageProvider = ({ children }) => {
  // Initialize language state from saved localStorage choice or default to 'en'
  const [language, setLanguage] = useState(getStoredLanguage);

  // Sync active language choice to localStorage & update DOM html lang attribute
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('careerCompassLanguage', language);
      document.documentElement.lang = language;
    }
  }, [language]);

  // Memoize context value payload object to prevent unnecessary component re-renders
  const value = useMemo(
    () => ({
      language,
      setLanguage,
      languages: supportedLanguages,
      t: (key) => translate(key, language), // Translation lookup function
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

/**
 * Custom Hook to consume LanguageContext in UI components
 */
export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage hook must be used within a LanguageProvider');
  }

  return context;
};
