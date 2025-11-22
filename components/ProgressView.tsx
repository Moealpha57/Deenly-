import React from 'react';
import { UserProgress, Badge } from '../types';
import { BADGE_DESCRIPTIONS, TITLES } from '../constants';
import BadgeBeginner from './icons/badges/BadgeBeginner';
import BadgeExplorer from './icons/badges/BadgeExplorer';
import BadgeQuizWhiz from './icons/badges/BadgeQuizWhiz';
import BadgeWiseOwl from './icons/badges/BadgeWiseOwl';
import XpIcon from './icons/XpIcon';
import StreakIcon from './icons/StreakIcon';
import { useLanguage } from '../contexts/LanguageContext';

interface ProgressViewProps {
  userProgress: UserProgress;
}

const BadgeIcon: React.FC<{ badge: Badge }> = ({ badge }) => {
  switch (badge) {
    case Badge.Beginner:
      return <BadgeBeginner />;
    case Badge.Explorer:
      return <BadgeExplorer />;
    case Badge.QuizWhiz:
      return <BadgeQuizWhiz />;
    case Badge.WiseOwl:
      return <BadgeWiseOwl />;
    default:
      return null;
  }
};

const ProgressView: React.FC<ProgressViewProps> = ({ userProgress }) => {
  const { t, language } = useLanguage();
  
  const getCurrentTitle = (xp: number): string => {
    // Find the highest title the user has earned
    const currentTitle = TITLES.slice().reverse().find(title => xp >= title.xp);
    return currentTitle ? t(currentTitle.key) : t('titleNewSeeker');
  };

  const userTitle = getCurrentTitle(userProgress.xp);
  
  return (
    <div>
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold">{t('yourJourney')}</h2>
        <p className="text-lg text-amber-500 font-semibold mt-1">{userTitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md text-center flex flex-col items-center justify-center">
          <XpIcon className="h-8 w-8 text-green-500 mb-1" />
          <p className="text-2xl font-bold">{userProgress.xp}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('xpEarned')}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md text-center flex flex-col items-center justify-center">
          <StreakIcon className="h-8 w-8 text-orange-500 mb-1" />
          <p className="text-2xl font-bold">{userProgress.streak}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('dayStreak')}</p>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold mb-6 text-center">{t('badges')}</h3>
        {userProgress.badges.length === 0 ? (
          <p className="text-center text-slate-500">{t('noBadges')}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(Object.keys(BADGE_DESCRIPTIONS) as Badge[]).map(badge => {
              const hasBadge = userProgress.badges.includes(badge);
              return (
                <div key={badge} className={`flex flex-col items-center text-center p-3 rounded-lg transition-opacity ${hasBadge ? 'opacity-100' : 'opacity-30'}`}>
                  <div className="w-20 h-20 mb-2">
                    <BadgeIcon badge={badge} />
                  </div>
                  <p className="font-bold text-sm">{t(BADGE_DESCRIPTIONS[badge].nameKey)}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t(BADGE_DESCRIPTIONS[badge].descKey)}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ProgressView);