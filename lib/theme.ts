/** Shared canvas-drawing color palette, kept in one place so the board,
 * pieces, move indicators, and dialog stay visually consistent. */
export const Theme = {
  boardGrid: '#6b4a2b',
  boardText: '#5a3d22',
  pieceFill: '#fbf3e1',
  pieceStrokeIdle: '#2b2320',
  pieceStrokeFocus: '#4fa8e0',
  pieceTextBlack: '#1b1f27',
  pieceTextRed: '#c0392b',
  movePointFill: '#c9c2b4',
  movePointStroke: '#3a2f22',
  captureRing: '#c0392b',
  dialogBg: '#fbf3e1',
  dialogBorder: '#6b4a2b',
  dialogText: '#1b1f27',
  confirmButton: '#c78f39',
  cancelButton: '#c0392b',
} as const;
