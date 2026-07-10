import { GameState, PieceKind, Faction } from '../types';

const PIECE_VALUES: Record<PieceKind, number> = {
  chariot: 900,
  cannon: 450,
  horse: 450,
  advisor: 200,
  elephant: 200,
  soldier: 100,
  king: 10000,
};

const CENTER_X = [3, 4, 5];

function positionalBonus(kind: PieceKind, faction: Faction, x: number, y: number): number {
  if (kind === 'soldier') {
    const crossedRiver = faction === 'black' ? y >= 5 : y <= 4;
    return crossedRiver ? 40 : 0;
  }
  if ((kind === 'horse' || kind === 'cannon') && CENTER_X.includes(x)) {
    return 10;
  }
  return 0;
}

/** Score of `state` from `faction`'s perspective: positive favors `faction`. */
export function evaluate(state: GameState, faction: Faction): number {
  let score = 0;
  for (const piece of state.pieces.values()) {
    const value = PIECE_VALUES[piece.kind] + positionalBonus(piece.kind, piece.faction, piece.square.x, piece.square.y);
    score += piece.faction === faction ? value : -value;
  }
  return score;
}

export { PIECE_VALUES };
