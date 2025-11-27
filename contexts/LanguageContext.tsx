import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Language } from '../types';
import { translations, TranslationKey } from '../translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, vars?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('deenieLanguage') as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('deenieLanguage', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: TranslationKey, vars: Record<string, string> = {}): string => {
    let text = translations[language][key] || translations['en'][key] || key;
    Object.keys(vars).forEach(varKey => {
        const regex = new RegExp(`{{${varKey}}}`, 'g');
        text = text.replace(regex, vars[varKey]);
    });
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};