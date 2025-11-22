import React from 'react';
import Logo from './icons/Logo';
import { useLanguage } from '../contexts/LanguageContext';

interface OnboardingViewProps {
  onComplete: () => void;
}

const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-brand-secondary dark:bg-brand-navy text-center p-8">
      <Logo className="w-32 h-32 mb-6 text-brand-primary" />
      <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100">{t('welcomeTitle')}</h1>
      <p className="mt-4 max-w-md text-slate-600 dark:text-slate-300">
        {t('welcomeMessage')}
      </p>
      <button
        onClick={onComplete}
        className="mt-10 bg-brand-primary text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-brand-dark transition-colors shadow-lg"
      >
        {t('getStarted')}
      </button>
    </div>
  );
};

export default OnboardingView;