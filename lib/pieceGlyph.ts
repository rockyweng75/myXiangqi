import { Faction, PieceKind } from '../engine';

const GLYPHS: Record<PieceKind, Record<Faction, string>> = {
  king: { black: '將', red: '帥' },
  advisor: { black: '士', red: '仕' },
  elephant: { black: '象', red: '相' },
  horse: { black: '馬', red: '傌' },
  chariot: { black: '車', red: '俥' },
  cannon: { black: '砲', red: '炮' },
  soldier: { black: '卒', red: '兵' },
};

export function glyphFor(kind: PieceKind, faction: Faction): string {
  return GLYPHS[kind][faction];
}
