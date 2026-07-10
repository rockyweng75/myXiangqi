/// <reference lib="webworker" />
import { DIFFICULTY_PRESETS, deserializeState, findBestMove } from '../../engine';
import { WorkerRequest, WorkerResponse } from './protocol';

function post(response: WorkerResponse): void {
  (self as unknown as DedicatedWorkerGlobalScope).postMessage(response);
}

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const request = e.data;
  if (request.type !== 'find-move') return;

  try {
    const state = deserializeState(request.state);
    const options = DIFFICULTY_PRESETS[request.difficulty];
    const result = findBestMove(state, request.faction, options);

    if (!result) {
      post({ type: 'error', message: 'no legal moves available' });
      return;
    }

    post({ type: 'move-found', move: result.move, depthReached: result.depthReached, score: result.score });
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
};
