// 称号定義(SPEC §9 / §A5)。app層: kokudomap 固有。
// 条件は `(stats) => boolean` で注入。判定エンジンは定義を知らない。
import type { AchievementDef } from "../domain/achievements";

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { id: "first", name: "国道デビュー", condition: "初めて国道を走破", check: (s) => s.rideCount >= 1 },
  { id: "single9", name: "一桁国道コンプ", condition: "国道1〜9号をすべて走破", check: (s) => s.singleDigitCount >= 9 },
  { id: "c50", name: "50本クラブ", condition: "50本を走破", check: (s) => s.rideCount >= 50 },
  { id: "c100", name: "100本クラブ", condition: "100本を走破", check: (s) => s.rideCount >= 100 },
  { id: "km5000", name: "5,000kmクラブ", condition: "累計5,000km", check: (s) => s.riddenKm >= 5000 },
  { id: "km20000", name: "2万kmクラブ", condition: "累計20,000km", check: (s) => s.riddenKm >= 20000 },
  { id: "quarter", name: "日本四分の一", condition: "全国25%", check: (s) => s.nationalRatio >= 0.25 },
  { id: "complete", name: "全国道制覇", condition: "全国道を走破", check: (s) => s.nationalRatio >= 1 },
];
