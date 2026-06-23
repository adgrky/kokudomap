// シェア画像(SPEC §10)。drawShareImage(generic) に railmap 固有テキストを注入。
import { drawShareImage, shareOrDownloadImage } from "@fillmap/core/generic";
import { conversionText, nationalRatio, riddenKm } from "./progress";
import { formatRatio } from "@fillmap/core/generic";
import type { Meta, SaveData } from "./types";

type ShareOpts = {
  mapCanvas: HTMLCanvasElement;
  meta: Meta;
  rides: SaveData["rides"];
  themeColor: string;
  achievementName?: string;
};

export async function generateShareImage(opts: ShareOpts): Promise<Blob> {
  const { mapCanvas, meta, rides, themeColor, achievementName } = opts;
  const ratio = nationalRatio(meta, rides);
  const km = riddenKm(meta, rides);
  const subText = `総走破 ${km.toLocaleString("ja-JP", { maximumFractionDigits: 1 })} km　${conversionText(km)}`;

  return drawShareImage({
    mapCanvas,
    themeColor,
    mainText: `全国 ${formatRatio(ratio)}`,
    subText,
    footerLabel: "国道完全制覇マップ",
    achievementName,
    achievementSuffix: achievementName ? "国道完全制覇マップで解除しました" : undefined,
  });
}

export async function shareOrDownload(blob: Blob, filename: string): Promise<void> {
  return shareOrDownloadImage(blob, filename, "国道完全制覇マップ");
}
