import { EnginePiece, Faction, GameState, PieceId, PieceKind, Square } from './types';

export function parsePieceId(id: PieceId): { faction: Faction; kind: PieceKind } {
  const [faction, kind] = id.split('-') as [Faction, PieceKind];
  return { faction, kind };
}

export const BOARD_WIDTH = 9;
export const BOARD_HEIGHT = 10;

export function idx(square: Square): number {
  return square.y * BOARD_WIDTH + square.x;
}

export function inBounds(square: Square): boolean {
  return square.x >= 0 && square.x < BOARD_WIDTH && square.y >= 0 && square.y < BOARD_HEIGHT;
}

export function squaresEqual(a: Square, b: Square): boolean {
  return a.x === b.x && a.y === b.y;
}

export function getPieceAt(state: GameState, square: Square): EnginePiece | undefined {
  if (!inBounds(square)) return undefined;
  const id = state.board[idx(square)];
  return id ? state.pieces.get(id) : undefined;
}

interface LayoutEntry {
  kind: PieceKind;
  x: number;
}

// y-coordinates mirrored between factions around the river (rows 4/5).
const BACK_ROW: LayoutEntry[] = [
  { kind: 'chariot', x: 0 },
  { kind: 'horse', x: 1 },
  { kind: 'elephant', x: 2 },
  { kind: 'advisor', x: 3 },
  { kind: 'king', x: 4 },
  { kind: 'advisor', x: 5 },
  { kind: 'elephant', x: 6 },
  { kind: 'horse', x: 7 },
  { kind: 'chariot', x: 8 },
];
const CANNON_COLUMNS = [1, 7];
const SOLDIER_COLUMNS = [0, 2, 4, 6, 8];

export function createInitialState(): GameState {
  const board: (PieceId | null)[] = new Array(BOARD_WIDTH * BOARD_HEIGHT).fill(null);
  const pieces = new Map<PieceId, EnginePiece>();
  const counters = new Map<string, number>();

  function place(faction: Faction, kind: PieceKind, square: Square): void {
    const key = `${faction}-${kind}`;
    const n = counters.get(key) ?? 0;
    counters.set(key, n + 1);
    const id: PieceId = `${key}-${n}`;
    const piece: EnginePiece = { id, kind, faction, square };
    pieces.set(id, piece);
    board[idx(square)] = id;
  }

  (['black', 'red'] as Faction[]).forEach((faction) => {
    const backRowY = faction === 'black' ? 0 : 9;
    const cannonSoldierY = faction === 'black' ? 2 : 7;
    const soldierY = faction === 'black' ? 3 : 6;

    BACK_ROW.forEach((entry) => place(faction, entry.kind, { x: entry.x, y: backRowY }));
    CANNON_COLUMNS.forEach((x) => place(faction, 'cannon', { x, y: cannonSoldierY }));
    SOLDIER_COLUMNS.forEach((x) => place(faction, 'soldier', { x, y: soldierY }));
  });

  return { board, pieces, turn: 'black', history: [] };
}
