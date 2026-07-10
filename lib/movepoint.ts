import { Square } from '../engine';
import { BoardGeometry, squareToPixel } from './geometry';
import { Theme } from './theme';

export default class MovePoint {
  ctx: CanvasRenderingContext2D;
  square: Square;
  x: number;
  y: number;
  width: number;
  height: number;
  isCapture: boolean;

  constructor(ctx: CanvasRenderingContext2D, square: Square, geometry: BoardGeometry, width: number, height: number, isCapture: boolean) {
    this.ctx = ctx;
    this.square = square;
    this.width = width;
    this.height = height;
    this.isCapture = isCapture;
    const pixel = squareToPixel(square, geometry);
    this.x = pixel.x;
    this.y = pixel.y;
  }

  print(): void {
    this.ctx.save();
    this.ctx.translate(this.x, this.y);
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.width / 2, 0, 2 * Math.PI);
    this.ctx.lineWidth = 5;
    this.ctx.strokeStyle = Theme.movePointStroke;
    this.ctx.stroke();
    this.ctx.fillStyle = Theme.movePointFill;
    this.ctx.fill();
    this.ctx.restore();
  }

  printCapture(): void {
    this.ctx.save();
    this.ctx.translate(this.x, this.y);
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.width / 2 + 5, 0, 2 * Math.PI);
    this.ctx.lineWidth = 5;
    this.ctx.strokeStyle = Theme.captureRing;
    this.ctx.stroke();
    this.ctx.restore();
  }
}
