
import React, { useState } from 'react';
import { Quiz, UserProgress, QuizAttempt, Badge } from '../types';
import { generateQuiz } from '../services/geminiService';
import { XP_PER_QUIZ_CORRECT_ANSWER } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

interface QuizViewProps {
  userProgress: UserProgress;
  setUserProgress: React.Dispatch<React.SetStateAction<UserProgress>>;
}

const QuizView: React.FC<QuizViewProps> = ({ userProgress, setUserProgress }) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const { t } = useLanguage();

  const suggestedTopics = [
    'topicPillars',
    'topicProphet',
    'topicRamadan',
    'topicWudu',
    'topicAngels'
  ];

  const handleStartQuiz = async (topicOverride?: string) => {
    const selectedTopic = topicOverride || topic;
    
    if (!selectedTopic.trim()) {
      setError(t('quizTopicError'));
      return;
    }
    
    // If it was an override, ensure the text input reflects it
    if (topicOverride) {
        setTopic(topicOverride);
    }

    setIsLoading(true);
    setError(null);
    setQuiz(null);
    setShowResults(false);
    setUserAnswers([]);
    setCurrentQuestionIndex(0);

    const generatedQuiz = await generateQuiz(selectedTopic);
    if (generatedQuiz) {
      setQuiz(generatedQuiz);
    } else {
      setError(t('quizGenerationError'));
    }
    setIsLoading(false);
  };

  const calculateResults = (finalAnswers: string[]) => {
    if (!quiz) return;
    let correctCount = 0;
    quiz.questions.forEach((q, index) => {
      if (finalAnswers[index] === q.correctAnswer) {
        correctCount++;
      }
    });

    const score = (correctCount / quiz.questions.length) * 100;
    const newXp = userProgress.xp + (correctCount * XP_PER_QUIZ_CORRECT_ANSWER);

    const newAttempt: QuizAttempt = {
        quizTopic: quiz.topic,
        score: score,
        date: new Date().toISOString(),
    };
    
    const newBadges = [...userProgress.badges];
    if (!newBadges.includes(Badge.Explorer)) {
      newBadges.push(Badge.Explorer);
    }
    if (score === 100 && !newBadges.includes(Badge.QuizWhiz)) {
      newBadges.push(Badge.QuizWhiz);
    }

    const updatedQuizHistory = [...userProgress.quizHistory, newAttempt];
    if (updatedQuizHistory.length >= 5 && !newBadges.includes(Badge.WiseOwl)) {
        newBadges.push(Badge.WiseOwl);
    }

    setUserProgress(prev => ({
        ...prev,
        xp: newXp,
        quizHistory: updatedQuizHistory,
        badges: newBadges
    }));
  };

  const handleAnswer = (answer: string) => {
    const newAnswers = [...userAnswers, answer];
    setUserAnswers(newAnswers);

    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowResults(true);
      calculateResults(newAnswers);
    }
  };

  const resetQuiz = () => {
    setQuiz(null);
    setTopic('');
    setError(null);
    setShowResults(false);
  }

  const renderResults = () => {
    if (!quiz) return null;
    let correctCount = 0;
    quiz.questions.forEach((q, index) => {
      if (userAnswers[index] === q.correctAnswer) {
        correctCount++;
      }
    });

    return (
      <div>
        <h2 className="text-3xl font-bold text-center mb-4">{t('quizResultsTitle')}</h2>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md text-center mb-6">
            <p className="text-lg text-slate-600 dark:text-slate-300">{t('youScored')}</p>
            <p className="text-6xl font-bold text-brand-primary my-2">{correctCount} <span className="text-4xl text-slate-400">/ {quiz.questions.length}</span></p>
            <p className="text-lg font-semibold">{t('xpGained')}: {correctCount * XP_PER_QUIZ_CORRECT_ANSWER}</p>
        </div>
        
        <div className="space-y-4">
            {quiz.questions.map((q, index) => (
                <div key={index} className={`p-4 rounded-lg ${userAnswers[index] === q.correctAnswer ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                    <p className="font-semibold">{index + 1}. {q.question}</p>
                    <p className="text-sm mt-1">{t('yourAnswer')}: <span className="font-medium">{userAnswers[index]}</span></p>
                    {userAnswers[index] !== q.correctAnswer && <p className="text-sm">{t('correctAnswer')}: <span className="font-medium">{q.correctAnswer}</span></p>}
                    <p className="text-xs mt-2 text-slate-500 dark:text-slate-400 italic">{t('explanation')}: {q.explanation}</p>
                </div>
            ))}
        </div>
        
        <div className="text-center mt-8">
            <button onClick={resetQuiz} className="bg-brand-primary text-white font-bold py-2 px-6 rounded-full hover:bg-brand-dark transition-colors">
                {t('tryAnotherQuiz')}
            </button>
        </div>
      </div>
    );
  };
  
  const renderQuiz = () => {
    if (!quiz) return null;
    const currentQuestion = quiz.questions[currentQuestionIndex];
    
    return (
        <div>
            <div className="text-center mb-4">
                <h3 className="text-xl font-semibold text-slate-500">{quiz.topic}</h3>
                <p className="text-sm text-slate-400">{t('question')} {currentQuestionIndex + 1} {t('of')} {quiz.questions.length}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <p className="text-lg font-semibold mb-6">{currentQuestion.question}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQuestion.options.map(option => (
                        <button key={option} onClick={() => handleAnswer(option)} className="w-full text-left p-4 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-brand-primary hover:text-white dark:hover:bg-brand-primary transition-colors">
                            {option}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
  };

  if (showResults) {
    return renderResults();
  }

  if (isLoading) {
    return <div className="text-center text-slate-500">{t('generatingQuiz')}...</div>;
  }
  
  return (
    <div>
      {!quiz ? (
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">{t('quizTitle')}</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{t('quizDescription')}</p>
          <div className="max-w-md mx-auto">
            <input 
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleStartQuiz()}
                placeholder={t('quizPlaceholder')}
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-full bg-slate-100 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
            <button onClick={() => handleStartQuiz()} disabled={isLoading} className="mt-4 bg-brand-primary text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-brand-dark transition-colors shadow-lg disabled:bg-slate-400">
                {t('startQuiz')}
            </button>
            
            <div className="mt-8">
              <p className="text-sm text-slate-400 mb-3">{t('suggestedTopics')}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestedTopics.map((key) => {
                   const translatedTopic = t(key as any); // Using as any to bypass strict key check for dynamic access if needed, though we updated translations.ts
                   return (
                    <button
                      key={key}
                      onClick={() => handleStartQuiz(translatedTopic)}
                      className="bg-white dark:bg-slate-800 hover:bg-brand-light dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-full text-sm transition-colors"
                    >
                      {translatedTopic}
                    </button>
                   );
                })}
              </div>
            </div>

            {error && <p className="text-red-500 mt-4">{error}</p>}
          </div>
        </div>
      ) : renderQuiz()}
    </div>
  );
};

export default QuizView;
