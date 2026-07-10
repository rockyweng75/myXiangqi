import { describe, expect, it } from 'vitest';
import { getPseudoLegalMoves } from '../pieceRules';
import { buildState, squareSet } from './testUtils';

describe('king', () => {
  it('only moves one step within the palace', () => {
    const state = buildState([{ kind: 'king', faction: 'black', x: 4, y: 1 }]);
    const king = state.pieces.get('black-king-0')!;
    expect(squareSet(getPseudoLegalMoves(state, king))).toEqual(
      squareSet([
        { x: 3, y: 1 },
        { x: 5, y: 1 },
        { x: 4, y: 0 },
        { x: 4, y: 2 },
      ])
    );
  });

  it('cannot step outside the palace bounds', () => {
    const state = buildState([{ kind: 'king', faction: 'black', x: 3, y: 0 }]);
    const king = state.pieces.get('black-king-0')!;
    const moves = squareSet(getPseudoLegalMoves(state, king));
    expect(moves).not.toContain('2,0'); // x<3 is outside the palace
  });

  it('never generates a "capture opposing king" move (flying-general bug fix)', () => {
    const state = buildState([
      { kind: 'king', faction: 'black', x: 4, y: 0 },
      { kind: 'king', faction: 'red', x: 4, y: 9 },
    ]);
    const black = state.pieces.get('black-king-0')!;
    const moves = getPseudoLegalMoves(state, black);
    expect(moves.some((m) => m.x === 4 && m.y === 9)).toBe(false);
  });
});

describe('advisor', () => {
  it('moves diagonally within the palace only', () => {
    const state = buildState([{ kind: 'advisor', faction: 'black', x: 3, y: 0 }]);
    const advisor = state.pieces.get('black-advisor-0')!;
    expect(squareSet(getPseudoLegalMoves(state, advisor))).toEqual(squareSet([{ x: 4, y: 1 }]));
  });
});

describe('elephant (siang) - bug fixes', () => {
  it('cannot cross the river', () => {
    const state = buildState([{ kind: 'elephant', faction: 'black', x: 2, y: 4 }]);
    const elephant = state.pieces.get('black-elephant-0')!;
    const moves = getPseudoLegalMoves(state, elephant);
    expect(moves.some((m) => m.y > 4)).toBe(false);
  });

  it('is blocked by a piece on its eye (塞象眼)', () => {
    const withoutBlocker = buildState([{ kind: 'elephant', faction: 'black', x: 2, y: 2 }]);
    const elephant = withoutBlocker.pieces.get('black-elephant-0')!;
    expect(squareSet(getPseudoLegalMoves(withoutBlocker, elephant))).toContain('0,0');
    expect(squareSet(getPseudoLegalMoves(withoutBlocker, elephant))).toContain('4,0');

    const withBlocker = buildState([
      { kind: 'elephant', faction: 'black', x: 2, y: 2 },
      { kind: 'soldier', faction: 'black', x: 1, y: 1 }, // eye for the (0,0) move
    ]);
    const blockedElephant = withBlocker.pieces.get('black-elephant-0')!;
    const moves = squareSet(getPseudoLegalMoves(withBlocker, blockedElephant));
    expect(moves).not.toContain('0,0');
    expect(moves).toContain('4,0'); // other diagonal unaffected
  });
});

describe('horse - 蹩馬腿', () => {
  it('has 8 candidate moves with a clear board', () => {
    const state = buildState([{ kind: 'horse', faction: 'black', x: 4, y: 4 }]);
    const horse = state.pieces.get('black-horse-0')!;
    expect(getPseudoLegalMoves(state, horse)).toHaveLength(8);
  });

  it('is blocked when the leg square is occupied', () => {
    const state = buildState([
      { kind: 'horse', faction: 'black', x: 4, y: 4 },
      { kind: 'soldier', faction: 'black', x: 5, y: 4 }, // blocks the right leg
    ]);
    const horse = state.pieces.get('black-horse-0')!;
    const moves = squareSet(getPseudoLegalMoves(state, horse));
    expect(moves).not.toContain('6,3');
    expect(moves).not.toContain('6,5');
    expect(moves).toContain('2,3'); // left leg still open
  });
});

describe('chariot', () => {
  it('slides until blocked and can capture the first enemy in its path', () => {
    const state = buildState([
      { kind: 'chariot', faction: 'black', x: 0, y: 0 },
      { kind: 'soldier', faction: 'red', x: 0, y: 3 },
      { kind: 'soldier', faction: 'black', x: 0, y: 5 },
    ]);
    const chariot = state.pieces.get('black-chariot-0')!;
    const moves = squareSet(getPseudoLegalMoves(state, chariot));
    expect(moves).toContain('0,1');
    expect(moves).toContain('0,2');
    expect(moves).toContain('0,3'); // capture
    expect(moves).not.toContain('0,4'); // can't pass through
    expect(moves).not.toContain('0,5'); // own piece
  });
});

describe('cannon', () => {
  it('moves like a chariot when not capturing', () => {
    const state = buildState([{ kind: 'cannon', faction: 'black', x: 1, y: 2 }]);
    const cannon = state.pieces.get('black-cannon-0')!;
    const moves = squareSet(getPseudoLegalMoves(state, cannon));
    expect(moves).toContain('1,0');
    expect(moves).toContain('1,9');
  });

  it('captures the first piece beyond the screen, and nothing further', () => {
    const state = buildState([
      { kind: 'cannon', faction: 'black', x: 0, y: 0 },
      { kind: 'soldier', faction: 'black', x: 0, y: 2 }, // screen
      { kind: 'soldier', faction: 'red', x: 0, y: 3 }, // first piece beyond screen - capturable
      { kind: 'soldier', faction: 'red', x: 0, y: 5 }, // shielded by the piece at y=3 - not capturable
    ]);
    const cannon = state.pieces.get('black-cannon-0')!;
    const moves = squareSet(getPseudoLegalMoves(state, cannon));
    expect(moves).toContain('0,1'); // empty square before the screen
    expect(moves).not.toContain('0,2'); // screen itself can't be landed on
    expect(moves).toContain('0,3'); // first piece beyond the screen is capturable
    expect(moves).not.toContain('0,5'); // shielded by the piece at y=3
  });
});

describe('soldier', () => {
  it('black moves forward only before crossing the river', () => {
    const state = buildState([{ kind: 'soldier', faction: 'black', x: 4, y: 3 }]);
    const soldier = state.pieces.get('black-soldier-0')!;
    expect(squareSet(getPseudoLegalMoves(state, soldier))).toEqual(squareSet([{ x: 4, y: 4 }]));
  });

  it('black gains sideways moves after crossing the river, never backward', () => {
    const state = buildState([{ kind: 'soldier', faction: 'black', x: 4, y: 5 }]);
    const soldier = state.pieces.get('black-soldier-0')!;
    const moves = squareSet(getPseudoLegalMoves(state, soldier));
    expect(moves).toEqual(
      squareSet([
        { x: 4, y: 6 },
        { x: 3, y: 5 },
        { x: 5, y: 5 },
      ])
    );
  });

  it('red moves forward (decreasing y) only before crossing the river', () => {
    const state = buildState([{ kind: 'soldier', faction: 'red', x: 4, y: 6 }]);
    const soldier = state.pieces.get('red-soldier-0')!;
    expect(squareSet(getPseudoLegalMoves(state, soldier))).toEqual(squareSet([{ x: 4, y: 5 }]));
  });
});
