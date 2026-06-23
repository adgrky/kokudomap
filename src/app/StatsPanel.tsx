// 統計画面(SPEC §5.3 / §A5)。div+CSS のみ。kokudomap 固有(国道本数+距離)。
import type { Meta, SaveData } from "../domain/types";
import { conversionText, nationalRatio, riddenKm } from "../domain/progress";
import { formatRatio } from "@fillmap/core/generic";

type Props = {
  meta: Meta;
  rides: SaveData["rides"];
  themeColor: string;
  onOpenShare?: () => void;
  /** 互換用(kokudomapでは未使用。pref データが無いため)。 */
  onJumpToPref?: (pref: string) => void;
};

export function StatsPanel({ meta, rides, themeColor, onOpenShare }: Props) {
  const km = riddenKm(meta, rides);
  const ratio = nationalRatio(meta, rides);
  const convert = conversionText(km);
  const rideCount = Object.keys(rides).length;
  const total = meta.totals.lineCount;
  const left = Math.max(0, total - rideCount);

  return (
    <div className="h-full overflow-y-auto bg-bg pb-20">
      <div className="mx-auto max-w-md space-y-4 p-4">

        {/* ヒーローカード: 総走破距離 */}
        <div className="rounded-token bg-surface p-5 text-center">
          <p className="text-sm text-text-dim">総走破距離</p>
          <p className="tnum mt-1 text-5xl font-black" style={{ color: themeColor }}>
            {km.toLocaleString("ja-JP", { maximumFractionDigits: 1 })}
            <span className="ml-1 text-xl font-semibold text-text-dim">km</span>
          </p>
          {convert && <p className="mt-2 text-sm text-text-dim">{convert}</p>}
        </div>

        {/* 本数カード */}
        <div className="rounded-token bg-surface p-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-text-dim">走破した国道</h2>
            <p className="text-sm text-text-dim">
              <span className="tnum text-2xl font-bold" style={{ color: themeColor }}>{rideCount}</span>
              {" "}/ {total} 本
            </p>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{ width: `${Math.min(100, ratio * 100)}%`, background: themeColor }}
            />
          </div>
          <p className="mt-2 text-right text-xs text-text-dim">
            全国 {formatRatio(ratio)}・制覇まであと {left.toLocaleString()} 本
          </p>
        </div>

        {/* シェアボタン */}
        <button
          onClick={onOpenShare}
          className="w-full rounded-token bg-surface py-4 text-base font-semibold text-text hover:bg-surface-2"
        >
          📸 シェア画像をつくる
        </button>
      </div>
    </div>
  );
}
