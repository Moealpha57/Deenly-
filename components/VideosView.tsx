
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import VideoIcon from './icons/VideoIcon';

const VideosView: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4 text-slate-500 dark:text-slate-400">
      <VideoIcon isActive={false} className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-6" />
      <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-2">{t('comingSoon')}</h2>
      <p className="max-w-xs">
        {t('comingSoonVideosDesc')}
      </p>
    </div>
  );
};

export default React.memo(VideosView);