// 称号判定エンジン(SPEC §9)。kokudomap 固有統計型 + buildStats。
// checkNewAchievements は @fillmap/core/generic の汎用版を使う。
import type { AchievementDef as GenericAchievementDef } from "@fillmap/core/generic";
import type { Meta, SaveData } from "./types";
import { nationalRatio, riddenKm } from "./progress";

export type AchievementStats = {
  rideCount: number; // 走破した国道の本数
  riddenKm: number; // 累計走破距離
  nationalRatio: number; // 全国道に対する距離達成率
  singleDigitCount: number; // 走破した一桁国道(1〜9号)の本数
};

/** kokudomap 称号定義型のエイリアス。 */
export type AchievementDef = GenericAchievementDef<AchievementStats>;

/** lineId("国道N号")から番号を取り出す。 */
function refOf(lineId: string): number {
  const m = lineId.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

export function buildStats(meta: Meta, rides: SaveData["rides"]): AchievementStats {
  const rideCount = Object.keys(rides).length;
  let singleDigitCount = 0;
  for (const lineId of Object.keys(rides)) {
    const ref = refOf(lineId);
    if (ref >= 1 && ref <= 9) singleDigitCount++;
  }
  return {
    rideCount,
    riddenKm: riddenKm(meta, rides),
    nationalRatio: nationalRatio(meta, rides),
    singleDigitCount,
  };
}
