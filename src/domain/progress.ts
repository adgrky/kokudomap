// 達成率計算(SPEC §8.1 / §8.3)。railmap 固有(距離ベース)。
import type { Meta, RailType, SaveData } from "./types";

export function riddenKm(meta: Meta, rides: SaveData["rides"]): number {
  let sum = 0;
  for (const lineId of Object.keys(rides)) {
    const m = meta.lines[lineId];
    if (m) sum += m.lengthKm;
  }
  return Math.round(sum * 10) / 10;
}

export function nationalRatio(meta: Meta, rides: SaveData["rides"]): number {
  const total = meta.totals.lengthKm;
  if (total <= 0) return 0;
  return riddenKm(meta, rides) / total;
}

export function railTypeRatio(meta: Meta, rides: SaveData["rides"], railType: RailType): number {
  const total = meta.totals.byRailType[railType] ?? 0;
  if (total <= 0) return 0;
  let ridden = 0;
  for (const lineId of Object.keys(rides)) {
    const m = meta.lines[lineId];
    if (m && m.railType === railType) ridden += m.lengthKm;
  }
  return ridden / total;
}

export function conversionText(km: number): string {
  if (km <= 0) return "";
  if (km <= 500) {
    const trips = Math.max(1, Math.round((km / 550) * 10) / 10);
    return `東京↔大阪 約${trips.toFixed(1)}往復分`;
  }
  if (km <= 3000) {
    const times = Math.round((km / 2800) * 10) / 10;
    return `日本縦断 約${times.toFixed(1)}回分`;
  }
  const earth = 40075;
  if (km <= earth) {
    const remaining = Math.round(earth - km);
    return `地球一周まであと ${remaining.toLocaleString()} km`;
  }
  const laps = Math.round((km / earth) * 10) / 10;
  return `地球 ${laps.toFixed(1)}周分`;
}
