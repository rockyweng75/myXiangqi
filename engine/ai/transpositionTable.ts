import { Move } from '../types';

export type TTFlag = 'exact' | 'lower' | 'upper';

export interface TTEntry {
  depth: number;
  score: number;
  flag: TTFlag;
  bestMove: Move | null;
}

export type TranspositionTable = Map<string, TTEntry>;
