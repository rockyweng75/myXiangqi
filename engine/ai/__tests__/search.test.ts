import { describe, expect, it } from 'vitest';
import { applyMove } from '../../apply';
import { createInitialState } from '../../board';
import { getAllLegalMoves } from '../../rules';
import { findBestMove } from '../search';
import { buildState } from '../../__tests__/testUtils';

describe('findBestMove', () => {
  it('always returns a legal move from the initial position', () => {
    const state = createInitialState();
    const result = findBestMove(state, 'black', { maxDepth: 2, timeBudgetMs: 2000 });
    expect(result).not.toBeNull();
    const legal = getAllLegalMoves(state, 'black');
    expect(legal.some((m) => m.pieceId === result!.move.pieceId && m.to.x === result!.move.to.x && m.to.y === result!.move.to.y)).toBe(
      true
    );
  });

  it('takes a free hanging chariot over a quiet move', () => {
    const state = buildState(
      [
        { kind: 'king', faction: 'black', x: 4, y: 0 },
        { kind: 'chariot', faction: 'black', x: 0, y: 5 },
        { kind: 'chariot', faction: 'red', x: 0, y: 6 }, // undefended, directly capturable
        { kind: 'king', faction: 'red', x: 5, y: 9 },
      ],
      'black'
    );
    const result = findBestMove(state, 'black', { maxDepth: 3, timeBudgetMs: 2000 });
    expect(result).not.toBeNull();
    expect(result!.move.capturedId).toBe('red-chariot-0');
  });

  it('finds a move that forces checkmate (score reflects a forced mate, and black has no reply)', () => {
    // Black king cornered; red chariot one step from delivering the same
    // column check validated as checkmate in rules.test.ts, with a second
    // chariot already denying the other escape square.
    const state = buildState(
      [
        { kind: 'king', faction: 'black', x: 3, y: 0 },
        { kind: 'chariot', faction: 'red', x: 7, y: 0 },
        { kind: 'chariot', faction: 'red', x: 3, y: 8 },
        { kind: 'king', faction: 'red', x: 5, y: 9 },
      ],
      'red'
    );
    const result = findBestMove(state, 'red', { maxDepth: 2, timeBudgetMs: 2000 });
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThan(900_000);

    applyMove(state, result!.move);
    expect(getAllLegalMoves(state, 'black')).toHaveLength(0);
  });

  it('every move returned across several positions passes getLegalMoves', () => {
    const state = createInitialState();
    let faction: 'black' | 'red' = 'black';
    for (let i = 0; i < 6; i++) {
      const result = findBestMove(state, faction, { maxDepth: 2, timeBudgetMs: 1000 });
      expect(result).not.toBeNull();
      const legal = getAllLegalMoves(state, faction);
      expect(legal.some((m) => m.pieceId === result!.move.pieceId && m.to.x === result!.move.to.x && m.to.y === result!.move.to.y)).toBe(
        true
      );
      applyMove(state, result!.move);
      faction = faction === 'black' ? 'red' : 'black';
    }
  });

  // Deeper-depth re-runs of the fixtures above: these exercise the
  // transposition table (iterative deepening re-search + within-tree
  // transpositions) far more than the shallow depths above do, so a TT
  // correctness bug (bad bound classification, mate-score/ply mismatch,
  // stale hit) is far more likely to surface here even though the shallow
  // versions above still pass.
  it('still takes the hanging chariot at a depth deep enough to exercise the TT', () => {
    const state = buildState(
      [
        { kind: 'king', faction: 'black', x: 4, y: 0 },
        { kind: 'chariot', faction: 'black', x: 0, y: 5 },
        { kind: 'chariot', faction: 'red', x: 0, y: 6 },
        { kind: 'king', faction: 'red', x: 5, y: 9 },
      ],
      'black'
    );
    const result = findBestMove(state, 'black', { maxDepth: 4, timeBudgetMs: 3000 });
    expect(result).not.toBeNull();
    expect(result!.move.capturedId).toBe('red-chariot-0');
  });

  it('still finds the forced mate at a depth deep enough to exercise the TT', () => {
    const state = buildState(
      [
        { kind: 'king', faction: 'black', x: 3, y: 0 },
        { kind: 'chariot', faction: 'red', x: 7, y: 0 },
        { kind: 'chariot', faction: 'red', x: 3, y: 8 },
        { kind: 'king', faction: 'red', x: 5, y: 9 },
      ],
      'red'
    );
    const result = findBestMove(state, 'red', { maxDepth: 4, timeBudgetMs: 3000 });
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThan(900_000);

    applyMove(state, result!.move);
    expect(getAllLegalMoves(state, 'black')).toHaveLength(0);
  });

  it('randomMargin lets an injected random() pick different near-best moves', () => {
    // Black king boxed in a face-off with the red king down column 4: any
    // king move that stays on column 4 is illegal (kingsFaceOff), leaving
    // exactly the two sideways moves as legal - both evaluation-tied (no
    // capture, no positional bonus applies to king moves).
    const state = buildState(
      [
        { kind: 'king', faction: 'black', x: 4, y: 1 },
        { kind: 'king', faction: 'red', x: 4, y: 8 },
      ],
      'black'
    );
    const options = { maxDepth: 2, timeBudgetMs: 1000, randomMargin: 40 };

    const resultLow = findBestMove(state, 'black', { ...options, random: () => 0 });
    const resultHigh = findBestMove(state, 'black', { ...options, random: () => 0.999999 });

    expect(resultLow).not.toBeNull();
    expect(resultHigh).not.toBeNull();

    const legal = getAllLegalMoves(state, 'black');
    for (const result of [resultLow, resultHigh]) {
      expect(legal.some((m) => m.pieceId === result!.move.pieceId && m.to.x === result!.move.to.x && m.to.y === result!.move.to.y)).toBe(
        true
      );
    }
    expect(resultLow!.move.to).not.toEqual(resultHigh!.move.to);
  });
});
