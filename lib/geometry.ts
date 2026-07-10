import { Square } from '../engine';

export interface BoardGeometry {
  originX: number;
  originY: number;
  columnWidth: number;
  columnHeight: number;
}

export function squareToPixel(square: Square, geometry: BoardGeometry): { x: number; y: number } {
  return {
    x: square.x * geometry.columnWidth + geometry.originX,
    y: square.y * geometry.columnHeight + geometry.originY,
  };
}

export function pixelToSquare(x: number, y: number, geometry: BoardGeometry): Square {
  return {
    x: Math.round((x - geometry.originX) / geometry.columnWidth),
    y: Math.round((y - geometry.originY) / geometry.columnHeight),
  };
}
