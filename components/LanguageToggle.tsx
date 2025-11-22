import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ar' : 'en';
    setLanguage(newLanguage);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-bold text-sm text-slate-600 dark:text-slate-300"
      aria-label="Toggle language"
    >
      {language === 'en' ? 'ع' : 'EN'}
    </button>
  );
};

export default LanguageToggle;
