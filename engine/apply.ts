import { idx, parsePieceId } from './board';
import { EnginePiece, GameState, Move } from './types';

function otherFaction(faction: GameState['turn']): GameState['turn'] {
  return faction === 'red' ? 'black' : 'red';
}

/** Mutates state in place: moves the piece, capturing whatever occupies `to`.
 * Fills in `move.capturedId` as a side effect so `undoMove` can reverse it. */
export function applyMove(state: GameState, move: Move): void {
  const piece = state.pieces.get(move.pieceId);
  if (!piece) throw new Error(`applyMove: unknown piece ${move.pieceId}`);

  const capturedId = state.board[idx(move.to)];
  if (capturedId) {
    move.capturedId = capturedId;
    state.pieces.delete(capturedId);
  } else {
    move.capturedId = undefined;
  }

  state.board[idx(piece.square)] = null;
  piece.square = move.to;
  state.board[idx(move.to)] = move.pieceId;

  state.history.push(move);
  state.turn = otherFaction(state.turn);
}

/** Reverses the most recent applyMove(state, move) call. */
export function undoMove(state: GameState, move: Move): void {
  const piece = state.pieces.get(move.pieceId);
  if (!piece) throw new Error(`undoMove: unknown piece ${move.pieceId}`);

  state.board[idx(move.to)] = null;
  piece.square = move.from;
  state.board[idx(move.from)] = move.pieceId;

  if (move.capturedId) {
    const { faction, kind } = parsePieceId(move.capturedId);
    const restored: EnginePiece = { id: move.capturedId, kind, faction, square: move.to };
    state.pieces.set(move.capturedId, restored);
    state.board[idx(move.to)] = move.capturedId;
  }

  state.history.pop();
  state.turn = otherFaction(state.turn);
}

export function cloneState(state: GameState): GameState {
  const pieces = new Map<string, EnginePiece>();
  state.pieces.forEach((piece, id) => pieces.set(id, { ...piece, square: { ...piece.square } }));
  return {
    board: [...state.board],
    pieces,
    turn: state.turn,
    history: state.history.map((m) => ({ ...m, from: { ...m.from }, to: { ...m.to } })),
  };
}
