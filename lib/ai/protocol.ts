import { Difficulty, Move, SerializedState } from '../../engine';

export interface FindMoveRequest {
  type: 'find-move';
  state: SerializedState;
  faction: 'red' | 'black';
  difficulty: Difficulty;
}

export type WorkerRequest = FindMoveRequest;

export interface MoveFoundResponse {
  type: 'move-found';
  move: Move;
  depthReached: number;
  score: number;
}

export interface WorkerErrorResponse {
  type: 'error';
  message: string;
}

export type WorkerResponse = MoveFoundResponse | WorkerErrorResponse;
