import { SearchOptions } from './search';

export type Difficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTY_PRESETS: Record<Difficulty, SearchOptions> = {
  easy: { maxDepth: 2, timeBudgetMs: 800, randomMargin: 80 },
  medium: { maxDepth: 6, timeBudgetMs: 1500, randomMargin: 40 },
  hard: { maxDepth: 9, timeBudgetMs: 4000, randomMargin: 15 },
};
