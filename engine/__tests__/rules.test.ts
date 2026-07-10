import { describe, expect, it } from 'vitest';
import { getAllLegalMoves, getLegalMoves, isCheckmate, isInCheck, isStalemate, kingsFaceOff } from '../rules';
import { buildState } from './testUtils';

describe('kingsFaceOff', () => {
  it('is true when both kings share a column with nothing between them', () => {
    const state = buildState([
      { kind: 'king', faction: 'black', x: 4, y: 0 },
      { kind: 'king', faction: 'red', x: 4, y: 9 },
    ]);
    expect(kingsFaceOff(state)).toBe(true);
  });

  it('is false when a piece blocks the column', () => {
    const state = buildState([
      { kind: 'king', faction: 'black', x: 4, y: 0 },
      { kind: 'king', faction: 'red', x: 4, y: 9 },
      { kind: 'soldier', faction: 'black', x: 4, y: 5 },
    ]);
    expect(kingsFaceOff(state)).toBe(false);
  });

  it('getLegalMoves rejects a move that would expose a flying-general face-off', () => {
    // Removing the blocking soldier from the column would face the kings off.
    const state = buildState([
      { kind: 'king', faction: 'black', x: 4, y: 0 },
      { kind: 'king', faction: 'red', x: 4, y: 9 },
      { kind: 'soldier', faction: 'black', x: 4, y: 5 },
    ]);
    const soldier = state.pieces.get('black-soldier-0')!;
    const moves = getLegalMoves(state, soldier.id);
    // Forward move keeps it on the column (still blocks) - legal.
    expect(moves.some((m) => m.x === 4 && m.y === 6)).toBe(true);
    // Sideways move would vacate the column and expose the kings - illegal.
    expect(moves.some((m) => m.x === 3 && m.y === 5)).toBe(false);
  });
});

describe('isInCheck', () => {
  it('detects a chariot delivering check along a file', () => {
    const state = buildState([
      { kind: 'king', faction: 'black', x: 4, y: 0 },
      { kind: 'king', faction: 'red', x: 3, y: 9 },
      { kind: 'chariot', faction: 'red', x: 4, y: 5 },
    ]);
    expect(isInCheck(state, 'black')).toBe(true);
  });

  it('is false when no enemy piece attacks the king', () => {
    const state = buildState([
      { kind: 'king', faction: 'black', x: 4, y: 0 },
      { kind: 'king', faction: 'red', x: 3, y: 9 },
    ]);
    expect(isInCheck(state, 'black')).toBe(false);
  });
});

describe('getLegalMoves - self-check prevention', () => {
  it('a pinned piece cannot move if doing so exposes its own king to check', () => {
    const state = buildState([
      { kind: 'king', faction: 'black', x: 4, y: 0 },
      { kind: 'advisor', faction: 'black', x: 4, y: 1 },
      { kind: 'chariot', faction: 'red', x: 4, y: 5 },
    ]);
    const advisor = state.pieces.get('black-advisor-0')!;
    // Advisor sits on the same file between king and chariot; any move off
    // that file exposes check, so it should have zero legal moves.
    expect(getLegalMoves(state, advisor.id)).toHaveLength(0);
  });
});

describe('isCheckmate / isStalemate', () => {
  it('detects checkmate with no escape', () => {
    // Black king cornered at (3,0): one chariot checks it along column 3 (and
    // denies the (3,1) escape square by keeping it on the same file), a second
    // chariot sweeps row 0 and denies the only other escape square (4,0).
    const state = buildState(
      [
        { kind: 'king', faction: 'black', x: 3, y: 0 },
        { kind: 'chariot', faction: 'red', x: 3, y: 5 },
        { kind: 'chariot', faction: 'red', x: 7, y: 0 },
        { kind: 'king', faction: 'red', x: 5, y: 9 },
      ],
      'black'
    );
    expect(isInCheck(state, 'black')).toBe(true);
    expect(isCheckmate(state, 'black')).toBe(true);
    expect(getAllLegalMoves(state, 'black')).toHaveLength(0);
  });

  it('is not checkmate when the king can escape', () => {
    const state = buildState(
      [
        { kind: 'king', faction: 'black', x: 4, y: 0 },
        { kind: 'chariot', faction: 'red', x: 4, y: 5 },
        { kind: 'king', faction: 'red', x: 5, y: 9 },
      ],
      'black'
    );
    expect(isInCheck(state, 'black')).toBe(true);
    expect(isCheckmate(state, 'black')).toBe(false);
  });

  it('detects stalemate (no check, but no legal moves)', () => {
    // Black king cornered with its only square covered, but not currently in check.
    const state = buildState(
      [
        { kind: 'king', faction: 'black', x: 3, y: 0 },
        { kind: 'chariot', faction: 'red', x: 4, y: 1 },
        { kind: 'chariot', faction: 'red', x: 5, y: 5 },
        { kind: 'king', faction: 'red', x: 5, y: 9 },
      ],
      'black'
    );
    expect(isInCheck(state, 'black')).toBe(false);
    expect(isStalemate(state, 'black')).toBe(true);
  });
});
