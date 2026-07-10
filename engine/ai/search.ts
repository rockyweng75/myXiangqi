import { applyMove, undoMove } from '../apply';
import { getAllLegalMoves } from '../rules';
import { Faction, GameState, Move } from '../types';
import { evaluate, PIECE_VALUES } from './evaluate';
import { TTEntry, TTFlag, TranspositionTable } from './transpositionTable';
import { ZobristKey, computeInitialHash, hashAfterMove, keyToString } from './zobrist';

const MATE_SCORE = 1_000_000;

/** Thrown once the search deadline has passed, to unwind out of an
 * in-progress depth iteration rather than let it run arbitrarily long past
 * the time budget (iterative deepening alone only checks time *between*
 * whole depths, which is too coarse - a single deep iteration can itself
 * take far longer than the entire budget). */
class SearchAborted extends Error {}

function otherFaction(faction: Faction): Faction {
  return faction === 'red' ? 'black' : 'red';
}

function orderMoves(state: GameState, moves: Move[]): Move[] {
  // Captures first, biggest-victim/cheapest-attacker first (MVV-LVA-ish).
  return [...moves].sort((a, b) => {
    const scoreA = a.capturedId ? PIECE_VALUES[state.pieces.get(a.capturedId)!.kind] : -1;
    const scoreB = b.capturedId ? PIECE_VALUES[state.pieces.get(b.capturedId)!.kind] : -1;
    return scoreB - scoreA;
  });
}

/** Layers a transposition-table move hint on top of the MVV-LVA order: if the
 * TT remembers a best move for this position, search it first (regardless of
 * whether its stored depth/score were usable), further tightening alpha-beta. */
function orderMovesWithTTHint(state: GameState, moves: Move[], ttMove: Move | null): Move[] {
  const ordered = orderMoves(state, moves);
  if (!ttMove) return ordered;
  const i = ordered.findIndex((m) => m.pieceId === ttMove.pieceId && m.to.x === ttMove.to.x && m.to.y === ttMove.to.y);
  if (i <= 0) return ordered;
  const [hit] = ordered.splice(i, 1);
  ordered.unshift(hit);
  return ordered;
}

/** Mate scores are ply-relative ("distance to mate from the current node"),
 * so a raw score cached at one ply is wrong when read back at another ply
 * (iterative deepening, or a different move order transposing into the same
 * position). Store as if found at ply 0, re-add the local ply on read. */
function storeMateScoreForTT(score: number, ply: number): number {
  if (score >= MATE_SCORE - 1000) return score + ply;
  if (score <= -MATE_SCORE + 1000) return score - ply;
  return score;
}

function adjustMateScoreFromTT(score: number, ply: number): number {
  if (score >= MATE_SCORE - 1000) return score - ply;
  if (score <= -MATE_SCORE + 1000) return score + ply;
  return score;
}

function negamax(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  faction: Faction,
  ply: number,
  hash: ZobristKey,
  tt: TranspositionTable,
  deadline: number
): number {
  if (Date.now() >= deadline) throw new SearchAborted();

  const key = keyToString(hash);
  const originalAlpha = alpha; // used to classify the stored bound below - must not use the (possibly tightened) alpha

  const entry = tt.get(key);
  if (entry && entry.depth >= depth) {
    const score = adjustMateScoreFromTT(entry.score, ply);
    if (entry.flag === 'exact') return score;
    if (entry.flag === 'lower' && score > alpha) alpha = score;
    else if (entry.flag === 'upper' && score < beta) beta = score;
    if (alpha >= beta) return score;
  }

  const moves = getAllLegalMoves(state, faction);
  if (moves.length === 0) {
    // No legal moves is an immediate loss in Xiangqi, whether check or stalemate.
    return -MATE_SCORE + ply;
  }
  if (depth === 0) {
    return evaluate(state, faction);
  }

  let best = -Infinity;
  let bestMove: Move | null = null;
  for (const move of orderMovesWithTTHint(state, moves, entry?.bestMove ?? null)) {
    applyMove(state, move);
    const nextHash = hashAfterMove(hash, move);
    let score: number;
    try {
      score = -negamax(state, depth - 1, -beta, -alpha, otherFaction(faction), ply + 1, nextHash, tt, deadline);
    } finally {
      // Must undo even when the recursive call threw (SearchAborted unwinding
      // through this frame) - state is shared/mutated in place across the
      // whole search, so a skipped undo here would corrupt every ancestor.
      undoMove(state, move);
    }

    if (score > best) {
      best = score;
      bestMove = move;
    }
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }

  const flag: TTFlag = best <= originalAlpha ? 'upper' : best >= beta ? 'lower' : 'exact';
  const entryToStore: TTEntry = { depth, score: storeMateScoreForTT(best, ply), flag, bestMove };
  tt.set(key, entryToStore);

  return best;
}

export interface SearchOptions {
  maxDepth: number;
  timeBudgetMs: number;
  /** If set, randomly pick among root moves within this score margin of the
   * best move found at the final completed depth (used for "easy" difficulty). */
  randomMargin?: number;
  random?: () => number;
}

export interface SearchResult {
  move: Move;
  depthReached: number;
  score: number;
}

/** Iterative-deepening negamax; returns the best move found within the time budget. */
export function findBestMove(state: GameState, faction: Faction, options: SearchOptions): SearchResult | null {
  const rootMoves = getAllLegalMoves(state, faction);
  if (rootMoves.length === 0) return null;

  const tt: TranspositionTable = new Map();
  const rootHash = computeInitialHash(state);

  const start = Date.now();
  const deadline = start + options.timeBudgetMs;
  let best: SearchResult = { move: rootMoves[0], depthReached: 0, score: -Infinity };
  let lastDepthScores: { move: Move; score: number }[] = [];

  for (let depth = 1; depth <= options.maxDepth; depth++) {
    let bestMoveThisDepth: Move | null = null;
    let bestScoreThisDepth = -Infinity;
    let alpha = -Infinity;
    const beta = Infinity;
    const scoresThisDepth: { move: Move; score: number }[] = [];
    let aborted = false;

    try {
      const rootEntry = tt.get(keyToString(rootHash));
      for (const move of orderMovesWithTTHint(state, rootMoves, rootEntry?.bestMove ?? null)) {
        applyMove(state, move);
        const nextHash = hashAfterMove(rootHash, move);
        let score: number;
        try {
          score = -negamax(state, depth - 1, -beta, -alpha, otherFaction(faction), 1, nextHash, tt, deadline);
        } finally {
          undoMove(state, move);
        }

        scoresThisDepth.push({ move, score });
        if (score > bestScoreThisDepth) {
          bestScoreThisDepth = score;
          bestMoveThisDepth = move;
        }
        if (bestScoreThisDepth > alpha) alpha = bestScoreThisDepth;
      }
    } catch (err) {
      if (!(err instanceof SearchAborted)) throw err;
      aborted = true; // this depth is incomplete - discard it, keep the last fully-completed depth's result
    }

    if (!aborted && bestMoveThisDepth) {
      best = { move: bestMoveThisDepth, depthReached: depth, score: bestScoreThisDepth };
      lastDepthScores = scoresThisDepth;
    }

    if (aborted) break;
    if (Date.now() - start >= options.timeBudgetMs) break;
    if (bestScoreThisDepth >= MATE_SCORE - 1000) break; // forced mate found
  }

  if (options.randomMargin !== undefined && lastDepthScores.length > 0) {
    const candidates = lastDepthScores.filter((s) => s.score >= best.score - options.randomMargin!);
    const random = options.random ?? Math.random;
    const pick = candidates[Math.floor(random() * candidates.length)];
    return { move: pick.move, depthReached: best.depthReached, score: pick.score };
  }

  return best;
}
