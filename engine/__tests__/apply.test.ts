import { describe, expect, it } from 'vitest';
import { applyMove, cloneState, undoMove } from '../apply';
import { createInitialState, getPieceAt, idx } from '../board';
import { GameState, Move } from '../types';

function snapshot(state: GameState) {
  return {
    board: [...state.board],
    turn: state.turn,
    pieceCount: state.pieces.size,
  };
}

describe('applyMove/undoMove', () => {
  it('round-trips a non-capturing move', () => {
    const state = createInitialState();
    const before = snapshot(state);
    const cannon = getPieceAt(state, { x: 1, y: 2 })!;
    const move: Move = { pieceId: cannon.id, from: { x: 1, y: 2 }, to: { x: 1, y: 5 } };

    applyMove(state, move);
    expect(getPieceAt(state, { x: 1, y: 5 })?.id).toBe(cannon.id);
    expect(state.turn).toBe('red');

    undoMove(state, move);
    expect(snapshot(state)).toEqual(before);
    expect(getPieceAt(state, { x: 1, y: 2 })?.id).toBe(cannon.id);
  });

  it('round-trips a capturing move, restoring the captured piece', () => {
    const state = createInitialState();
    // Remove the black soldier occupying (0,3), then relocate the real red
    // soldier there so a black chariot can capture a genuine opposite-faction piece.
    const blackSoldier = getPieceAt(state, { x: 0, y: 3 })!;
    state.board[idx({ x: 0, y: 3 })] = null;
    state.pieces.delete(blackSoldier.id);

    const target = getPieceAt(state, { x: 0, y: 6 })!;
    state.board[idx({ x: 0, y: 6 })] = null;
    target.square = { x: 0, y: 3 };
    state.board[idx({ x: 0, y: 3 })] = target.id;

    const chariot = getPieceAt(state, { x: 0, y: 0 })!;
    const before = snapshot(state);
    const move: Move = { pieceId: chariot.id, from: { x: 0, y: 0 }, to: { x: 0, y: 3 } };

    applyMove(state, move);
    expect(move.capturedId).toBe(target.id);
    expect(state.pieces.has(target.id)).toBe(false);
    expect(getPieceAt(state, { x: 0, y: 3 })?.id).toBe(chariot.id);

    undoMove(state, move);
    expect(state.pieces.has(target.id)).toBe(true);
    expect(getPieceAt(state, { x: 0, y: 3 })?.id).toBe(target.id);
    expect(getPieceAt(state, { x: 0, y: 0 })?.id).toBe(chariot.id);
    expect(snapshot(state)).toEqual(before);
  });

  it('cloneState produces an independent deep copy', () => {
    const state = createInitialState();
    const clone = cloneState(state);
    const cannon = getPieceAt(state, { x: 1, y: 2 })!;
    const move: Move = { pieceId: cannon.id, from: { x: 1, y: 2 }, to: { x: 1, y: 5 } };
    applyMove(state, move);

    expect(getPieceAt(clone, { x: 1, y: 2 })?.id).toBe(cannon.id);
    expect(state.board[idx({ x: 1, y: 2 })]).toBeNull();
  });
});
