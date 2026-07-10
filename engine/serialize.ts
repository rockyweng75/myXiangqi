import { BOARD_WIDTH, BOARD_HEIGHT, idx } from './board';
import { EnginePiece, GameState, PieceId, SerializedState } from './types';

export function serializeState(state: GameState): SerializedState {
  return {
    pieces: Array.from(state.pieces.values()).map((p) => ({ ...p, square: { ...p.square } })),
    turn: state.turn,
    history: state.history.map((m) => ({ ...m, from: { ...m.from }, to: { ...m.to } })),
  };
}

export function deserializeState(serialized: SerializedState): GameState {
  const board: (PieceId | null)[] = new Array(BOARD_WIDTH * BOARD_HEIGHT).fill(null);
  const pieces = new Map<PieceId, EnginePiece>();

  serialized.pieces.forEach((p) => {
    const piece: EnginePiece = { ...p, square: { ...p.square } };
    pieces.set(piece.id, piece);
    board[idx(piece.square)] = piece.id;
  });

  return {
    board,
    pieces,
    turn: serialized.turn,
    history: serialized.history.map((m) => ({ ...m, from: { ...m.from }, to: { ...m.to } })),
  };
}
