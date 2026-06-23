# 国道完全制覇マップ(kokudomap) SPEC

> 基底: 工場マスター(docs/00_master) + シリーズ設計(docs/10_fillmap_series §E1 LINE, §A5)。本書は差分のみ。
> railmap(LINE)の資産(地図描画・光走りアニメ・距離換算)を流用。

## §1 概要
全国の一般国道(436本)の走破記録を地図に「線」で描いていくLINEモードアプリ。一言: 国道436路線、走った道で日本に線を描く。

## §2 データ(§E1 LINE / §E6 / §E7)
- ソース: OpenStreetMap(Overpass API)。`relation[route=road][network=JP:national]` を ref 番号レンジで5分割取得。
- ⚠️ ライセンス: © OpenStreetMap contributors(ODbL)。設定画面に明記。
- 前処理: `tools/preprocess_road.py`(OSM relation→ref番号で集約→1国道=1 MultiLineString)。
  - 簡略化 0.0025度 + 座標4桁 + way重複排除でサイズ最適化(29MB→5.6MB)。
- 受入: 436本 / lines.geojson 5.6MB / 総延長 約67,000km(概算)。
- 注: 総延長は上下線・重複区間の扱いで道路統計年報と差異あり(概算値)。

## §3 塗り状態
- 未走破(グレー細線) / 走破済(テーマ色+グロー+line-gradient)。rides に存在=走破済。
- 走破アニメ(W1): railmap の光走りアニメ `animateLine` を流用(始点→終点へ光が走る→フラッシュ→グロー)。prefers-reduced-motion 尊重。
- 背景地図: OpenFreeMap dark(道路ラベル除去・県境/水域のみ)。

## §4 保存(§E4)
- storageKey: `kokudomap.v1` / version: 1
- rides: `{ [lineId]: { status:"full", count, firstDate?, memo? } }`(lineId="国道N号")

## §5 画面構成
- タブ: 🗾地図 / 📊統計 / 📅年表 / 🏆称号 / ⚙️設定
- 国道タップ→LineSheet: 国道名/総延長/区分/走破トグル

## §6 デザイントークン
- テーマ: neon-blue/green/pink の3択(既定 neon-blue)。

## §7 スコア / 演出
- 総走破距離(km)。換算文言「東京↔大阪○往復/日本縦断○回/地球一周まで○km」(railmap progress 流用)。

## §8 達成率
- 全国 = 走破距離 / 総延長。本数 N/436 も表示。

## §9 称号
- 国道デビュー / 一桁国道コンプ(1〜9号) / 50本 / 100本 / 5,000km / 2万km / 日本四分の一(25%) / 全国道制覇

## §10 シェア画像(§E5)
- 地図スナップ+「全国 N%」+「総走破 Nkm ○○」+統一フッター(国道完全制覇マップ)。

## 残課題(v2)
- 酷道・旧道・海上国道タグ(プレミアム種)。都道府県別達成率(OSM relationに県情報が無く現状pref空)。データ年1回更新。
