import { idx } from '../board';
import { parsePieceId } from '../board';
import { Faction, GameState, Move, PieceKind } from '../types';

/** Two independent 32-bit XOR lanes combined into a string key, giving an
 * effective ~64-bit keyspace - a single 32-bit lane has too high a collision
 * probability at the node counts a deep alpha-beta search can visit. */
export interface ZobristKey {
  a: number;
  b: number;
}

const PIECE_KINDS: PieceKind[] = ['king', 'advisor', 'elephant', 'horse', 'chariot', 'cannon', 'soldier'];
const FACTIONS: Faction[] = ['red', 'black'];
const NUM_SQUARES = 90; // BOARD_WIDTH(9) * BOARD_HEIGHT(10), mirrors engine/board.ts's idx()

function randomLane(): number {
  return (Math.random() * 0x100000000) | 0;
}

function factionIndex(faction: Faction): number {
  return faction === 'red' ? 0 : 1;
}

function kindIndex(kind: PieceKind): number {
  return PIECE_KINDS.indexOf(kind);
}

// pieceKeys[squareIndex][factionIndex][kindIndex]
const pieceKeys: ZobristKey[][][] = [];
for (let sq = 0; sq < NUM_SQUARES; sq++) {
  pieceKeys.push(FACTIONS.map(() => PIECE_KINDS.map(() => ({ a: randomLane(), b: randomLane() }))));
}

const sideToMoveKey: ZobristKey = { a: randomLane(), b: randomLane() };

export function pieceKeyAt(squareIndex: number, faction: Faction, kind: PieceKind): ZobristKey {
  return pieceKeys[squareIndex][factionIndex(faction)][kindIndex(kind)];
}

export function xor(k1: ZobristKey, k2: ZobristKey): ZobristKey {
  return { a: (k1.a ^ k2.a) | 0, b: (k1.b ^ k2.b) | 0 };
}

export function keyToString(k: ZobristKey): string {
  return `${k.a}:${k.b}`;
}

/** Computed once per findBestMove() call from the root state; thereafter
 * maintained incrementally via hashAfterMove(). */
export function computeInitialHash(state: GameState): ZobristKey {
  let h: ZobristKey = { a: 0, b: 0 };
  for (const piece of state.pieces.values()) {
    h = xor(h, pieceKeyAt(idx(piece.square), piece.faction, piece.kind));
  }
  // Fixed convention: the side-to-move key is XORed in when it is red's turn.
  if (state.turn === 'red') h = xor(h, sideToMoveKey);
  return h;
}

/** Must be called AFTER applyMove(state, move) - move.capturedId is only
 * populated as a side effect of that call. Needs no explicit "undo": since
 * the hash is threaded as a plain recursion parameter (not mutated in
 * place), each stack frame keeps its own value and unwinds for free
 * alongside undoMove(). */
export function hashAfterMove(hash: ZobristKey, move: Move): ZobristKey {
  const { faction, kind } = parsePieceId(move.pieceId);
  let h = xor(hash, pieceKeyAt(idx(move.from), faction, kind));
  h = xor(h, pieceKeyAt(idx(move.to), faction, kind));
  if (move.capturedId) {
    const captured = parsePieceId(move.capturedId);
    h = xor(h, pieceKeyAt(idx(move.to), captured.faction, captured.kind));
  }
  return xor(h, sideToMoveKey);
}
