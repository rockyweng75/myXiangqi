import { describe, expect, it } from 'vitest';
import { createInitialState, getPieceAt } from '../board';

describe('createInitialState', () => {
  it('creates 32 pieces with unique ids', () => {
    const state = createInitialState();
    expect(state.pieces.size).toBe(32);
    const ids = new Set(state.pieces.keys());
    expect(ids.size).toBe(32);
  });

  it('places 16 pieces per faction', () => {
    const state = createInitialState();
    const black = [...state.pieces.values()].filter((p) => p.faction === 'black');
    const red = [...state.pieces.values()].filter((p) => p.faction === 'red');
    expect(black).toHaveLength(16);
    expect(red).toHaveLength(16);
  });

  it('places kings at the expected palace centers', () => {
    const state = createInitialState();
    expect(getPieceAt(state, { x: 4, y: 0 })?.kind).toBe('king');
    expect(getPieceAt(state, { x: 4, y: 0 })?.faction).toBe('black');
    expect(getPieceAt(state, { x: 4, y: 9 })?.kind).toBe('king');
    expect(getPieceAt(state, { x: 4, y: 9 })?.faction).toBe('red');
  });

  it('places soldiers at rows 3 and 6', () => {
    const state = createInitialState();
    [0, 2, 4, 6, 8].forEach((x) => {
      expect(getPieceAt(state, { x, y: 3 })?.kind).toBe('soldier');
      expect(getPieceAt(state, { x, y: 6 })?.kind).toBe('soldier');
    });
  });

  it('black moves first', () => {
    const state = createInitialState();
    expect(state.turn).toBe('black');
  });
});
