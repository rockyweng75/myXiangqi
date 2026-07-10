import { Difficulty, Faction, GameState, Move, serializeState } from '../../engine';
import { WorkerResponse } from './protocol';

/** Minimum time the AI appears to "think" before a move is applied, so fast
 * searches (e.g. shallow easy-difficulty depths) don't feel instantaneous. */
const MIN_THINKING_MS = 1000;

/** Runs AI search in a Web Worker so the main thread never blocks on it. */
export default class AIMoveSource {
  private worker: Worker;
  faction: Faction;
  difficulty: Difficulty;

  constructor(faction: Faction, difficulty: Difficulty) {
    this.faction = faction;
    this.difficulty = difficulty;
    this.worker = new Worker(new URL('./aiWorker.ts', import.meta.url), { type: 'module' });
  }

  requestMove(state: GameState): Promise<Move> {
    const searchPromise = new Promise<Move>((resolve, reject) => {
      const handleMessage = (e: MessageEvent<WorkerResponse>) => {
        this.worker.removeEventListener('message', handleMessage);
        if (e.data.type === 'move-found') {
          resolve(e.data.move);
        } else {
          reject(new Error(e.data.message));
        }
      };
      this.worker.addEventListener('message', handleMessage);
      this.worker.postMessage({
        type: 'find-move',
        state: serializeState(state),
        faction: this.faction,
        difficulty: this.difficulty,
      });
    });
    const minDelay = new Promise<void>((resolve) => setTimeout(resolve, MIN_THINKING_MS));
    // Wait for both, not whichever is first - a slow search (e.g. hard
    // difficulty) should never be shortened, only fast ones padded out.
    return Promise.all([searchPromise, minDelay]).then(([move]) => move);
  }

  dispose(): void {
    this.worker.terminate();
  }
}
