import { getPieceAt, inBounds } from './board';
import { EnginePiece, Faction, GameState, PieceKind, Square } from './types';

const PALACE_X = [3, 4, 5];
const PALACE_Y: Record<Faction, number[]> = {
  black: [0, 1, 2],
  red: [7, 8, 9],
};
const HOME_HALF_Y: Record<Faction, [number, number]> = {
  black: [0, 4],
  red: [5, 9],
};

function inPalace(faction: Faction, square: Square): boolean {
  return PALACE_X.includes(square.x) && PALACE_Y[faction].includes(square.y);
}

function inHomeHalf(faction: Faction, square: Square): boolean {
  const [min, max] = HOME_HALF_Y[faction];
  return square.y >= min && square.y <= max;
}

function step(square: Square, dx: number, dy: number): Square {
  return { x: square.x + dx, y: square.y + dy };
}

/** Squares along a ray until (and including, if enemy) the first obstacle. */
function slideMoves(state: GameState, piece: EnginePiece, directions: [number, number][]): Square[] {
  const moves: Square[] = [];
  for (const [dx, dy] of directions) {
    let cursor = step(piece.square, dx, dy);
    while (inBounds(cursor)) {
      const occupant = getPieceAt(state, cursor);
      if (!occupant) {
        moves.push(cursor);
      } else {
        if (occupant.faction !== piece.faction) moves.push(cursor);
        break;
      }
      cursor = step(cursor, dx, dy);
    }
  }
  return moves;
}

function singleSteps(state: GameState, piece: EnginePiece, offsets: [number, number][], filter?: (s: Square) => boolean): Square[] {
  const moves: Square[] = [];
  for (const [dx, dy] of offsets) {
    const target = step(piece.square, dx, dy);
    if (!inBounds(target)) continue;
    if (filter && !filter(target)) continue;
    const occupant = getPieceAt(state, target);
    if (!occupant || occupant.faction !== piece.faction) moves.push(target);
  }
  return moves;
}

function kingMoves(state: GameState, piece: EnginePiece): Square[] {
  return singleSteps(
    state,
    piece,
    [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ],
    (s) => inPalace(piece.faction, s)
  );
}

function advisorMoves(state: GameState, piece: EnginePiece): Square[] {
  return singleSteps(
    state,
    piece,
    [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ],
    (s) => inPalace(piece.faction, s)
  );
}

function elephantMoves(state: GameState, piece: EnginePiece): Square[] {
  const offsets: [number, number][] = [
    [-2, -2],
    [-2, 2],
    [2, -2],
    [2, 2],
  ];
  const moves: Square[] = [];
  for (const [dx, dy] of offsets) {
    const target = step(piece.square, dx, dy);
    if (!inBounds(target) || !inHomeHalf(piece.faction, target)) continue;
    const eye = step(piece.square, dx / 2, dy / 2);
    if (getPieceAt(state, eye)) continue; // 塞象眼
    const occupant = getPieceAt(state, target);
    if (!occupant || occupant.faction !== piece.faction) moves.push(target);
  }
  return moves;
}

function horseMoves(state: GameState, piece: EnginePiece): Square[] {
  // Each L-move pairs with an orthogonal "leg" square that can block it (蹩馬腿).
  const candidates: { target: [number, number]; leg: [number, number] }[] = [
    { target: [-2, -1], leg: [-1, 0] },
    { target: [-2, 1], leg: [-1, 0] },
    { target: [2, -1], leg: [1, 0] },
    { target: [2, 1], leg: [1, 0] },
    { target: [-1, -2], leg: [0, -1] },
    { target: [1, -2], leg: [0, -1] },
    { target: [-1, 2], leg: [0, 1] },
    { target: [1, 2], leg: [0, 1] },
  ];
  const moves: Square[] = [];
  for (const { target, leg } of candidates) {
    const legSquare = step(piece.square, leg[0], leg[1]);
    if (inBounds(legSquare) && getPieceAt(state, legSquare)) continue;
    const dest = step(piece.square, target[0], target[1]);
    if (!inBounds(dest)) continue;
    const occupant = getPieceAt(state, dest);
    if (!occupant || occupant.faction !== piece.faction) moves.push(dest);
  }
  return moves;
}

const ORTHOGONAL_DIRECTIONS: [number, number][] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

function chariotMoves(state: GameState, piece: EnginePiece): Square[] {
  return slideMoves(state, piece, ORTHOGONAL_DIRECTIONS);
}

function cannonMoves(state: GameState, piece: EnginePiece): Square[] {
  const moves: Square[] = [];
  for (const [dx, dy] of ORTHOGONAL_DIRECTIONS) {
    let cursor = step(piece.square, dx, dy);
    // Phase 1: slide over empty squares (non-capturing moves).
    while (inBounds(cursor) && !getPieceAt(state, cursor)) {
      moves.push(cursor);
      cursor = step(cursor, dx, dy);
    }
    if (!inBounds(cursor)) continue;
    // cursor now sits on the "screen" piece - jump over it.
    cursor = step(cursor, dx, dy);
    while (inBounds(cursor) && !getPieceAt(state, cursor)) {
      cursor = step(cursor, dx, dy);
    }
    if (inBounds(cursor)) {
      const occupant = getPieceAt(state, cursor);
      if (occupant && occupant.faction !== piece.faction) moves.push(cursor);
    }
  }
  return moves;
}

function soldierMoves(state: GameState, piece: EnginePiece): Square[] {
  const forwardDy = piece.faction === 'black' ? 1 : -1;
  const crossedRiver = piece.faction === 'black' ? piece.square.y >= 5 : piece.square.y <= 4;
  const offsets: [number, number][] = [[0, forwardDy]];
  if (crossedRiver) {
    offsets.push([-1, 0], [1, 0]);
  }
  return singleSteps(state, piece, offsets);
}

const PIECE_RULES: Record<PieceKind, (state: GameState, piece: EnginePiece) => Square[]> = {
  king: kingMoves,
  advisor: advisorMoves,
  elephant: elephantMoves,
  horse: horseMoves,
  chariot: chariotMoves,
  cannon: cannonMoves,
  soldier: soldierMoves,
};

/** Pseudo-legal destinations: obeys each piece's movement pattern and excludes
 * own-faction captures, but does NOT check whether the mover's own king ends up
 * in check or facing the enemy king (see engine/rules.ts for that layer). */
export function getPseudoLegalMoves(state: GameState, piece: EnginePiece): Square[] {
  return PIECE_RULES[piece.kind](state, piece);
}
