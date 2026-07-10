import { BOARD_HEIGHT, BOARD_WIDTH, idx } from '../board';
import { EnginePiece, Faction, GameState, PieceId, PieceKind } from '../types';

export interface PieceSpec {
  kind: PieceKind;
  faction: Faction;
  x: number;
  y: number;
}

/** Builds a minimal GameState from an explicit piece list, for focused rule tests. */
export function buildState(specs: PieceSpec[], turn: Faction = 'black'): GameState {
  const board: (PieceId | null)[] = new Array(BOARD_WIDTH * BOARD_HEIGHT).fill(null);
  const pieces = new Map<PieceId, EnginePiece>();
  const counters = new Map<string, number>();

  specs.forEach((spec) => {
    const key = `${spec.faction}-${spec.kind}`;
    const n = counters.get(key) ?? 0;
    counters.set(key, n + 1);
    const id: PieceId = `${key}-${n}`;
    const piece: EnginePiece = { id, kind: spec.kind, faction: spec.faction, square: { x: spec.x, y: spec.y } };
    pieces.set(id, piece);
    board[idx(piece.square)] = id;
  });

  return { board, pieces, turn, history: [] };
}

export function squareSet(squares: { x: number; y: number }[]): string[] {
  return squares.map((s) => `${s.x},${s.y}`).sort();
}
