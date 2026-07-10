import { getPieceAt, idx } from './board';
import { applyMove, undoMove } from './apply';
import { getPseudoLegalMoves } from './pieceRules';
import { EnginePiece, Faction, GameState, Move, Square } from './types';

function otherFaction(faction: Faction): Faction {
  return faction === 'red' ? 'black' : 'red';
}

function findKing(state: GameState, faction: Faction): EnginePiece | undefined {
  for (const piece of state.pieces.values()) {
    if (piece.kind === 'king' && piece.faction === faction) return piece;
  }
  return undefined;
}

/** 王不見王: true if both kings share a column with no piece between them. */
export function kingsFaceOff(state: GameState): boolean {
  const black = findKing(state, 'black');
  const red = findKing(state, 'red');
  if (!black || !red || black.square.x !== red.square.x) return false;

  const x = black.square.x;
  const [minY, maxY] = black.square.y < red.square.y ? [black.square.y, red.square.y] : [red.square.y, black.square.y];
  for (let y = minY + 1; y < maxY; y++) {
    if (getPieceAt(state, { x, y })) return false;
  }
  return true;
}

export function isInCheck(state: GameState, faction: Faction): boolean {
  const king = findKing(state, faction);
  if (!king) return false;
  const attacker = otherFaction(faction);
  for (const piece of state.pieces.values()) {
    if (piece.faction !== attacker) continue;
    const moves = getPseudoLegalMoves(state, piece);
    if (moves.some((sq) => sq.x === king.square.x && sq.y === king.square.y)) return true;
  }
  return false;
}

/** Legal destinations for a single piece: pseudo-legal moves minus any that
 * leave the mover's own king in check or create a flying-general face-off. */
export function getLegalMoves(state: GameState, pieceId: string): Square[] {
  const piece = state.pieces.get(pieceId);
  if (!piece) return [];
  const pseudo = getPseudoLegalMoves(state, piece);

  return pseudo.filter((to) => {
    const move: Move = { pieceId, from: { ...piece.square }, to: { ...to } };
    applyMove(state, move);
    const illegal = isInCheck(state, piece.faction) || kingsFaceOff(state);
    undoMove(state, move);
    return !illegal;
  });
}

export function getAllLegalMoves(state: GameState, faction: Faction): Move[] {
  const moves: Move[] = [];
  for (const piece of state.pieces.values()) {
    if (piece.faction !== faction) continue;
    for (const to of getLegalMoves(state, piece.id)) {
      const capturedId = state.board[idx(to)] ?? undefined;
      moves.push({ pieceId: piece.id, from: { ...piece.square }, to: { ...to }, capturedId });
    }
  }
  return moves;
}

export function isCheckmate(state: GameState, faction: Faction): boolean {
  return isInCheck(state, faction) && getAllLegalMoves(state, faction).length === 0;
}

export function isStalemate(state: GameState, faction: Faction): boolean {
  return !isInCheck(state, faction) && getAllLegalMoves(state, faction).length === 0;
}
