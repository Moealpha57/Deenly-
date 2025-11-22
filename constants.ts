import { Badge } from './types';
// FIX: Import TranslationKey to enforce type safety for translation keys.
import { TranslationKey } from './translations';

export const XP_PER_QUESTION = 10;
export const XP_PER_QUIZ_CORRECT_ANSWER = 25;

// FIX: Specify that nameKey and descKey are of type TranslationKey to fix type errors in components that use this data.
export const BADGE_DESCRIPTIONS: Record<Badge, { nameKey: TranslationKey, descKey: TranslationKey }> = {
  [Badge.Beginner]: {
    nameKey: 'badgeBeginnerName',
    descKey: 'badgeBeginnerDesc',
  },
  [Badge.Explorer]: {
    nameKey: 'badgeExplorerName',
    descKey: 'badgeExplorerDesc',
  },
  [Badge.QuizWhiz]: {
    nameKey: 'badgeQuizWhizName',
    descKey: 'badgeQuizWhizDesc',
  },
  [Badge.WiseOwl]: {
    nameKey: 'badgeWiseOwlName',
    descKey: 'badgeWiseOwlDesc',
  },
};

// FIX: Specify that the 'key' property is of type TranslationKey to resolve type errors when using these titles.
export const TITLES: { xp: number, key: TranslationKey }[] = [
  { xp: 0, key: 'titleNewSeeker' },
  { xp: 100, key: 'titleApprentice' },
  { xp: 500, key: 'titleStudent' },
  { xp: 1500, key: 'titleKnowledgeable' },
  { xp: 3000, key: 'titleScholar' },
];