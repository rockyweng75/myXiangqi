import { EnginePiece, PieceId, Square } from '../engine';
import { BoardGeometry, squareToPixel } from './geometry';
import { glyphFor } from './pieceGlyph';
import { Theme } from './theme';

/** Pure rendering/hit-testing wrapper around an engine piece. Owns no rules. */
export default class PieceView {
  ctx: CanvasRenderingContext2D;
  id: PieceId;
  faction: EnginePiece['faction'];
  kind: EnginePiece['kind'];
  text: string;
  square: Square;
  x: number;
  y: number;
  width: number;
  height: number;
  isFocus: boolean = false;

  constructor(ctx: CanvasRenderingContext2D, piece: EnginePiece, geometry: BoardGeometry, width: number, height: number) {
    this.ctx = ctx;
    this.id = piece.id;
    this.faction = piece.faction;
    this.kind = piece.kind;
    this.text = glyphFor(piece.kind, piece.faction);
    this.square = piece.square;
    this.width = width;
    this.height = height;
    const pixel = squareToPixel(piece.square, geometry);
    this.x = pixel.x;
    this.y = pixel.y;
  }

  syncTo(square: Square, geometry: BoardGeometry): void {
    this.square = square;
    const pixel = squareToPixel(square, geometry);
    this.x = pixel.x;
    this.y = pixel.y;
  }

  focus(bool: boolean): void {
    this.isFocus = bool;
  }

  print(): void {
    this.ctx.save();
    this.ctx.translate(this.x, this.y);
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.width / 2, 0, 2 * Math.PI);
    this.ctx.lineWidth = 5;
    this.ctx.strokeStyle = this.isFocus ? Theme.pieceStrokeFocus : Theme.pieceStrokeIdle;
    this.ctx.stroke();
    this.ctx.fillStyle = Theme.pieceFill;
    this.ctx.fill();
    this.ctx.font = 'normal normal 900 16px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = this.faction === 'black' ? Theme.pieceTextBlack : Theme.pieceTextRed;
    this.ctx.fillText(this.text, 0, 2);
    this.ctx.restore();
  }
}
