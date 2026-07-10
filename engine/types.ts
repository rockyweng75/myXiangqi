export type Faction = 'red' | 'black';

export type PieceKind =
  | 'king'
  | 'advisor'
  | 'elephant'
  | 'horse'
  | 'chariot'
  | 'cannon'
  | 'soldier';

export interface Square {
  x: number; // 0-8 (columns A-I)
  y: number; // 0-9 (rows), black starts at y=0, red starts at y=9
}

export type PieceId = string;

export interface EnginePiece {
  id: PieceId;
  kind: PieceKind;
  faction: Faction;
  square: Square;
}

export interface Move {
  pieceId: PieceId;
  from: Square;
  to: Square;
  capturedId?: PieceId;
}

export interface GameState {
  board: (PieceId | null)[]; // length 90, index = y * BOARD_WIDTH + x
  pieces: Map<PieceId, EnginePiece>;
  turn: Faction;
  history: Move[];
}

export interface SerializedState {
  pieces: EnginePiece[];
  turn: Faction;
  history: Move[];
}
