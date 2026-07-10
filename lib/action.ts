import {
  Difficulty,
  Faction,
  GameState,
  Move,
  PieceId,
  Square,
  applyMove,
  createInitialState,
  deserializeState,
  getAllLegalMoves,
  getLegalMoves,
  getPieceAt,
  isInCheck,
  parsePieceId,
  serializeState,
} from '../engine';
import AIMoveSource from './ai/aiMoveSource';
import { BoardGeometry, pixelToSquare } from './geometry';
import PieceView from './pieceView';
import MovePoint from './movepoint';
import Confirm from './confirm';
import ActionResult from './actionResult';
import { glyphFor } from './pieceGlyph';
import RoomConnection from './net/roomConnection';
import { NetMessage } from './net/protocol';
import { Theme } from './theme';

const Xids: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

export default class Action {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null = null;
  width: number;
  height: number;
  static itemWidth: number = 30;
  static itemHeight: number = 30;
  static originX: number = 20;
  static originY: number = 20;
  columnWidth: number = 0;
  columnHeight: number = 0;
  isOver = false;
  state: GameState = createInitialState();
  items: PieceView[] = [];
  selectedItem: PieceView | null = null;
  movePoints: MovePoint[] = [];
  $confirm: Confirm | null = null;
  oncommit: Function | undefined;
  aiMoveSource: AIMoveSource | null = null;
  onAIThinking: ((thinking: boolean) => void) | undefined;
  remote: RoomConnection | null = null;
  onRemoteStatus: ((status: 'open' | 'closed' | 'error') => void) | undefined;

  // Staged (not-yet-committed) move state, undone by rollback().
  private pendingMove: Move | null = null;
  private pendingRemovedView: PieceView | null = null;
  private pendingFrom: Square | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.width = canvas.width - Action.originX * 2;
    this.height = canvas.height - Action.originY * 2;
    this.canvas = canvas;
    this.columnWidth = Math.floor(this.width / 8);
    this.columnHeight = Math.floor(this.height / 9);

    if (this.canvas.getContext) {
      this.ctx = this.canvas.getContext('2d');
      this.canvas.onmousedown = async (e) => await this.handleMouseDown(e);
      this.canvas.onmouseup = (e) => this.handleMouseUp(e);
      this.canvas.onmouseout = (e) => this.handleMouseOut(e);
    } else {
      alert('error');
    }
  }

  get geometry(): BoardGeometry {
    return {
      originX: Action.originX,
      originY: Action.originY,
      columnWidth: this.columnWidth,
      columnHeight: this.columnHeight,
    };
  }

  async handleMouseDown(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (this.isOver) return;
    if (this.aiMoveSource && this.state.turn === this.aiMoveSource.faction) return;
    if (this.remote && this.state.turn !== this.remote.localFaction) return;

    // The canvas is scaled down via CSS on narrow viewports while its internal
    // drawing resolution stays fixed, so clicks must be rescaled into that
    // internal pixel space (board/piece geometry is computed from canvas.width/height).
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const startX = (e.clientX - rect.left) * scaleX;
    const startY = (e.clientY - rect.top) * scaleY;

    let isReload = false;

    if (this.$confirm) {
      isReload = this.$confirm.onclick(startX, startY);
    } else {
      isReload = this.handleBoardClick(startX, startY);
    }

    if (isReload) {
      await this.clear();
      await this.print();
    }
  }

  private handleBoardClick(startX: number, startY: number): boolean {
    // Pieces and move points sit on the board's grid intersections, so
    // resolve the click to its nearest square rather than testing a small
    // circular hit-radius per item - the latter leaves dead space within
    // each cell where a click "misses" everything and silently deselects.
    const clicked = pixelToSquare(startX, startY, this.geometry);

    const point = this.movePoints.find((p) => p.square.x === clicked.x && p.square.y === clicked.y);
    if (point && this.selectedItem) {
      this.stagePendingMove(this.selectedItem, point);
      return true;
    }

    const item = this.items.find((i) => i.square.x === clicked.x && i.square.y === clicked.y);
    if (item && item.faction === this.state.turn) {
      if (this.selectedItem !== null && this.selectedItem.id === item.id) {
        this.deselect();
      } else {
        this.select(item);
      }
    } else {
      this.deselect();
    }

    // Always redraw: every branch above mutates selection/focus state (even
    // a "miss" click deselects), so skipping the redraw here would leave a
    // stale highlight/move-points on screen until some later click happens
    // to trigger one - this was the actual cause of clicks that "did
    // nothing" until repeated.
    return true;
  }

  private select(item: PieceView): void {
    this.items.forEach((i) => i.focus(false));
    item.focus(true);
    this.selectedItem = item;
    const legalSquares = getLegalMoves(this.state, item.id);
    this.movePoints = legalSquares.map(
      (square) => new MovePoint(this.ctx!, square, this.geometry, item.width, item.height, !!getPieceAt(this.state, square))
    );
  }

  private deselect(): void {
    this.items.forEach((i) => i.focus(false));
    this.selectedItem = null;
    this.movePoints = [];
  }

  private stagePendingMove(item: PieceView, point: MovePoint): void {
    this.pendingFrom = item.square;
    this.pendingMove = { pieceId: item.id, from: item.square, to: point.square };

    if (point.isCapture) {
      const captured = this.items.find((i) => i.square.x === point.square.x && i.square.y === point.square.y);
      if (captured) {
        this.pendingRemovedView = captured;
        this.items = this.items.filter((i) => i.id !== captured.id);
      }
    }

    item.syncTo(point.square, this.geometry);
    this.movePoints = [new MovePoint(this.ctx!, point.square, this.geometry, item.width, item.height, false)];

    const id = Date.now().toFixed();
    this.$confirm = new Confirm(this.ctx!, id, this.width / 3, this.height / 2, 200, 60, this.commit(), this.rollback());
  }

  handleMouseUp(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  handleMouseOut(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  printBorder() {
    this.ctx!.save();
    this.ctx!.translate(Action.originX, Action.originY);
    this.ctx!.beginPath();
    this.ctx!.fillStyle = Theme.boardText;
    for (let i = 0; i <= 8; i++) {
      this.ctx!.moveTo(i * this.columnWidth, 0);
      this.ctx!.lineTo(i * this.columnWidth, this.columnHeight * 9);
      this.ctx!.fillText(Xids[i], i * this.columnWidth, -5);
    }
    for (let y = 0; y <= 9; y++) {
      this.ctx!.moveTo(0, y * this.columnHeight);
      this.ctx!.lineTo(this.columnWidth * 8, y * this.columnHeight);
      this.ctx!.fillText(y.toString(), -10, y * this.columnHeight);
    }

    this.ctx!.moveTo(3 * this.columnWidth, 0);
    this.ctx!.lineTo(5 * this.columnWidth, 2 * this.columnHeight);
    this.ctx!.moveTo(5 * this.columnWidth, 0);
    this.ctx!.lineTo(3 * this.columnWidth, 2 * this.columnHeight);

    this.ctx!.moveTo(3 * this.columnWidth, 7 * this.columnHeight);
    this.ctx!.lineTo(5 * this.columnWidth, 9 * this.columnHeight);
    this.ctx!.moveTo(5 * this.columnWidth, 7 * this.columnHeight);
    this.ctx!.lineTo(3 * this.columnWidth, 9 * this.columnHeight);

    this.ctx!.strokeStyle = Theme.boardGrid;
    this.ctx!.stroke();
    this.ctx!.clearRect(1, 4 * this.columnHeight + 1, this.columnWidth * 8 - 2, this.columnHeight - 2);
    this.ctx!.restore();
    this.ctx!.save();
    this.ctx!.font = 'normal normal 900 30px sans-serif';
    this.ctx!.textBaseline = 'middle';
    this.ctx!.fillStyle = Theme.boardText;
    this.ctx!.translate(this.columnWidth * 2 + this.columnWidth / 2, 4 * this.columnHeight + Action.originY + this.columnHeight / 2);
    this.ctx!.fillText('楚河', 0, 0);
    this.ctx!.restore();

    this.ctx!.save();
    this.ctx!.font = 'normal normal 900 30px sans-serif';
    this.ctx!.textBaseline = 'middle';
    this.ctx!.fillStyle = Theme.boardText;
    this.ctx!.translate(this.columnWidth * 6 + this.columnWidth / 2, 4 * this.columnHeight + Action.originY + this.columnHeight / 2);
    this.ctx!.rotate((180 * Math.PI) / 180);
    this.ctx!.fillText('漢界', 0, 0);
    this.ctx!.restore();
  }

  print(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.printBorder();

      this.items.forEach((item) => item.print());

      this.movePoints.forEach((point) => {
        if (point.isCapture) {
          point.printCapture();
        } else {
          point.print();
        }
      });

      if (this.pendingMove && this.$confirm) {
        this.$confirm.print();
      }

      resolve();
    });
  }

  clear(): Promise<void> {
    return new Promise((resolve) => {
      this.ctx!.clearRect(0, 0, this.canvas.width, this.canvas.height);
      resolve();
    });
  }

  pixelToSquare(x: number, y: number): Square {
    return pixelToSquare(x, y, this.geometry);
  }

  init(): Promise<void> {
    return new Promise((resolve) => {
      this.state = createInitialState();
      this.isOver = false;
      this.rebuildItems();
      resolve();
    });
  }

  setAIOpponent(faction: Faction, difficulty: Difficulty): void {
    this.aiMoveSource?.dispose();
    this.aiMoveSource = new AIMoveSource(faction, difficulty);
    void this.maybeTriggerAI();
  }

  private async maybeTriggerAI(): Promise<void> {
    if (this.isOver || !this.aiMoveSource || this.state.turn !== this.aiMoveSource.faction) return;
    this.onAIThinking?.(true);
    try {
      const move = await this.aiMoveSource.requestMove(this.state);
      await this.applyExternalMove(move);
    } finally {
      this.onAIThinking?.(false);
    }
  }

  loadState(state: GameState): void {
    this.state = state;
    this.isOver = false;
    this.rebuildItems();
    this.deselect();
  }

  attachRemote(connection: RoomConnection): void {
    this.remote?.dispose();
    this.remote = connection;
    connection.onMessage = (message) => void this.handleRemoteMessage(message);
    connection.onStateChange = (state) => {
      if (state !== 'connecting') this.onRemoteStatus?.(state);
    };
  }

  private async handleRemoteMessage(message: NetMessage): Promise<void> {
    switch (message.type) {
      case 'move': {
        const legalSquares = getLegalMoves(this.state, message.move.pieceId);
        const isLegal = legalSquares.some((sq) => sq.x === message.move.to.x && sq.y === message.move.to.y);
        if (!isLegal) {
          this.remote?.send({ type: 'resync-request' });
          return;
        }
        await this.applyExternalMove(message.move);
        break;
      }
      case 'resync-request':
        this.remote?.send({ type: 'resync-state', state: serializeState(this.state) });
        break;
      case 'resync-state':
        this.state = deserializeState(message.state);
        this.rebuildItems();
        this.deselect();
        await this.clear();
        await this.print();
        break;
      case 'resign':
        this.isOver = true;
        if (this.oncommit) {
          const winner = this.remote?.localFaction === 'black' ? '黑' : '紅';
          this.oncommit(new ActionResult('', '', '', undefined, `${winner}方獲勝(對手認輸)`, false, true));
        }
        break;
      case 'hello':
        break;
    }
  }

  private persistState(): void {
    if (!this.remote) return;
    try {
      sessionStorage.setItem(
        `myxiangqi-room-${this.remote.roomCode}`,
        JSON.stringify({ faction: this.remote.localFaction, state: serializeState(this.state) })
      );
    } catch {
      // sessionStorage unavailable (private browsing, etc.) - resume just won't work.
    }
  }

  /** Restores a mid-game state for `roomCode` saved by persistState(), if any. */
  static loadPersistedState(roomCode: string): GameState | null {
    try {
      const raw = sessionStorage.getItem(`myxiangqi-room-${roomCode}`);
      if (!raw) return null;
      const { state } = JSON.parse(raw);
      return deserializeState(state);
    } catch {
      return null;
    }
  }

  private rebuildItems(): void {
    this.items = Array.from(this.state.pieces.values()).map(
      (piece) => new PieceView(this.ctx!, piece, this.geometry, Action.itemWidth, Action.itemHeight)
    );
  }

  /** Applies an externally-sourced move (AI / remote peer) directly, without
   * the local staged-confirm UX used for human clicks. */
  async applyExternalMove(move: Move): Promise<ActionResult> {
    const movingId = move.pieceId;
    applyMove(this.state, move);

    const view = this.items.find((i) => i.id === movingId);
    view?.syncTo(move.to, this.geometry);

    if (move.capturedId) {
      this.items = this.items.filter((i) => i.id !== move.capturedId);
    }

    const result = this.buildResult(movingId, move, move.capturedId);
    await this.clear();
    await this.print();
    if (this.oncommit) this.oncommit(result);
    this.persistState();
    void this.maybeTriggerAI();
    return result;
  }

  private buildResult(movingId: PieceId, move: Move, capturedId: PieceId | undefined): ActionResult {
    const defendingFaction = this.state.turn; // already flipped by applyMove
    const check = isInCheck(this.state, defendingFaction);
    // Xiangqi has no draws: a side with no legal replies loses, whether
    // checkmated or merely stalemated.
    const noMovesLeft = getAllLegalMoves(this.state, defendingFaction).length === 0;

    if (noMovesLeft) this.isOver = true;

    let message: string | undefined;
    if (noMovesLeft) {
      message = `${defendingFaction === 'black' ? '紅' : '黑'}方是贏家(${check ? '將死' : '困斃'})`;
    } else if (check) {
      message = `${defendingFaction === 'black' ? '黑' : '紅'}方被將軍`;
    } else if (capturedId) {
      const { faction, kind } = parsePieceId(capturedId);
      message = `${glyphFor(kind, faction)}被吃掉了`;
    }

    return new ActionResult(
      movingId,
      `${Xids[move.to.x]}${move.to.y}`,
      `${Xids[move.from.x]}${move.from.y}`,
      capturedId,
      message,
      check,
      noMovesLeft
    );
  }

  commit(): Function {
    return () => {
      const move = this.pendingMove!;
      const from = this.pendingFrom!;
      const capturedId = this.pendingRemovedView?.id;

      applyMove(this.state, move);

      this.$confirm = null;
      this.deselect();
      this.pendingMove = null;
      this.pendingFrom = null;
      this.pendingRemovedView = null;

      const result = this.buildResult(move.pieceId, { ...move, from }, capturedId);
      if (this.oncommit) this.oncommit(result);
      this.remote?.send({ type: 'move', move: { pieceId: move.pieceId, from, to: move.to } });
      this.persistState();
      void this.maybeTriggerAI();
    };
  }

  rollback(): Function {
    return () => {
      const view = this.items.find((i) => i.id === this.pendingMove!.pieceId);
      if (view) view.syncTo(this.pendingFrom!, this.geometry);

      if (this.pendingRemovedView) {
        this.items.push(this.pendingRemovedView);
      }

      this.$confirm = null;
      this.pendingMove = null;
      this.pendingFrom = null;
      this.pendingRemovedView = null;

      if (view) this.select(view);
    };
  }
}
