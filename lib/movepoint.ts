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

  isInside(mouseX: number, mouseY: number): boolean {
    const h = this.x;
    const k = this.y;
    const r = this.width / 2;
    return (
      Math.pow(mouseX, 2) + Math.pow(mouseY, 2) - 2 * h * mouseX - 2 * k * mouseY + Math.pow(h, 2) + Math.pow(k, 2) - Math.pow(r, 2) <=
        0 &&
      Math.pow(-2 * h, 2) + Math.pow(-2 * k, 2) - 4 * (Math.pow(h, 2) + Math.pow(k, 2) - Math.pow(r, 2)) > 0
    );
  }
}
