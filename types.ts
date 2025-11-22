export type Language = 'en' | 'ar';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  isTyping?: boolean;
  sources?: Source[];
}

export interface Source {
  uri: string;
  title: string;
}

export enum Badge {
  Beginner = 'beginner',
  Explorer = 'explorer',
  QuizWhiz = 'quiz-whiz',
  WiseOwl = 'wise-owl',
}

export interface QuizAttempt {
  quizTopic: string;
  score: number;
  date: string;
}

export interface UserProgress {
  xp: number;
  streak: number;
  badges: Badge[];
  quizHistory: QuizAttempt[];
}

export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Quiz {
  topic: string;
  questions: Question[];
}

export interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
}