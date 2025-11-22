
import React, { useState, useEffect, Suspense, lazy } from 'react';
import BottomNav, { Tab } from './components/BottomNav';
import OnboardingView from './components/OnboardingView';
import Logo from './components/icons/Logo';
import LanguageToggle from './components/LanguageToggle';
import { useLanguage } from './contexts/LanguageContext';
import { Message, UserProgress } from './types';
import SunIcon from './components/icons/SunIcon';
import MoonIcon from './components/icons/MoonIcon';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load the main view components for better performance
const ChatView = lazy(() => import('./components/ChatView'));
const QuizView = lazy(() => import('./components/QuizView'));
const ProgressView = lazy(() => import('./components/ProgressView'));
const PrayerTimesView = lazy(() => import('./components/PrayerTimesView'));
const VideosView = lazy(() => import('./components/VideosView'));


const AppContent: React.FC = () => {
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('deenBuddyTheme');
        if (savedTheme) return savedTheme;
        
        if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    });

    const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('deenBuddyOnboardingComplete'));
    const [activeTab, setActiveTab] = useState<Tab>('chat');
    const { t } = useLanguage();

    // Initialize messages from local storage or default
    const [messages, setMessages] = useState<Message[]>(() => {
        const savedMessages = localStorage.getItem('deenBuddyMessages');
        // If we have saved messages, parse them
        if (savedMessages) {
            try {
                return JSON.parse(savedMessages);
            } catch (e) {
                console.error("Failed to parse saved messages", e);
            }
        }
        // Default initial message if nothing saved
        return [];
    });

    const [userProgress, setUserProgress] = useState<UserProgress>(() => {
        const savedProgress = localStorage.getItem('deenBuddyUserProgress');
        return savedProgress ? JSON.parse(savedProgress) : {
            xp: 0,
            streak: 1,
            badges: [],
            quizHistory: [],
        };
    });

    // Set initial message if array is empty (first time load)
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{ id: 'initial-bot-message', text: t('initialBotMessage'), sender: 'bot' }]);
        }
    }, [t, messages.length]);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('deenBuddyTheme', theme);
    }, [theme]);

    // Persist messages whenever they change
    useEffect(() => {
        localStorage.setItem('deenBuddyMessages', JSON.stringify(messages));
    }, [messages]);

    useEffect(() => {
        localStorage.setItem('deenBuddyUserProgress', JSON.stringify(userProgress));
    }, [userProgress]);

    const handleOnboardingComplete = () => {
        localStorage.setItem('deenBuddyOnboardingComplete', 'true');
        setShowOnboarding(false);
    };

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };
    
    if (showOnboarding) {
        return <OnboardingView onComplete={handleOnboardingComplete} />;
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'chat':
                return <ChatView messages={messages} setMessages={setMessages} userProgress={userProgress} setUserProgress={setUserProgress} />;
            case 'quiz':
                return <QuizView userProgress={userProgress} setUserProgress={setUserProgress} />;
            case 'progress':
                return <ProgressView userProgress={userProgress} />;
            case 'prayer':
                return <PrayerTimesView />;
            case 'videos':
                 return <VideosView />;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-screen bg-brand-secondary dark:bg-brand-navy text-slate-800 dark:text-slate-200 font-sans">
            <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                    <Logo className="h-8 w-8 text-brand-primary" />
                    <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Deenly</h1>
                </div>
                <div className="flex items-center gap-2">
                    <LanguageToggle />
                    <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300">
                        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                    </button>
                </div>
            </header>

            <main className="flex-grow p-4 overflow-y-auto pb-20">
                <Suspense fallback={<LoadingSpinner />}>
                    {renderContent()}
                </Suspense>
            </main>

            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
    );
};

export default AppContent;
