import React from 'react';
import ChatIcon from './icons/ChatIcon';
import QuizIcon from './icons/QuizIcon';
import ProgressIcon from './icons/ProgressIcon';
import PrayerIcon from './icons/PrayerIcon';
import VideoIcon from './icons/VideoIcon';
import { useLanguage } from '../contexts/LanguageContext';

export type Tab = 'chat' | 'quiz' | 'progress' | 'prayer' | 'videos';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
      isActive ? 'text-brand-primary' : 'text-slate-500 hover:text-brand-primary dark:hover:text-brand-light'
    }`}
  >
    {icon}
    <span className={`text-xs mt-1 ${isActive ? 'font-bold' : 'font-normal'}`}>{label}</span>
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { t } = useLanguage();

  const navItems = [
    { id: 'chat', label: t('chat'), icon: <ChatIcon isActive={activeTab === 'chat'} /> },
    { id: 'quiz', label: t('quiz'), icon: <QuizIcon isActive={activeTab === 'quiz'} /> },
    { id: 'videos', label: t('videos'), icon: <VideoIcon isActive={activeTab === 'videos'} /> },
    { id: 'prayer', label: t('prayer'), icon: <PrayerIcon isActive={activeTab === 'prayer'} /> },
    { id: 'progress', label: t('progress'), icon: <ProgressIcon isActive={activeTab === 'progress'} /> },
  ];

  // Updated to include safe-area-inset-bottom for iOS devices
  return (
    <div className="fixed bottom-0 left-0 right-0 min-h-[4rem] pb-[env(safe-area-inset-bottom)] bg-white dark:bg-brand-navy border-t border-slate-200 dark:border-slate-700 shadow-[0_-2px_5px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-around items-center h-16 max-w-2xl mx-auto px-2">
        {navItems.map(item => (
          <NavItem
            key={item.id}
            label={item.label}
            icon={item.icon}
            isActive={activeTab === item.id}
            onClick={() => setActiveTab(item.id as Tab)}
          />
        ))}
      </div>
    </div>
  );
};

export default React.memo(BottomNav);