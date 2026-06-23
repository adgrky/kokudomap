## 初期生成
- 完了: create_app.py で雛形生成
- 決定: -
- 残課題: SPEC.md 記入・データ準備・App.tsx 本実装

## フル実装(2026-06-23)
- 完了: OSM Overpassから国道436本を取得→preprocess_road.pyでMultiLineString集約(5.6MB)。railmap骨格を流用しLINE描画・光走りアニメ・距離スコア・称号8種・統計簡素化・出典ODbL明記。typecheck通過・dev実機検証OK(走破→青く点灯・スコア4.8%/3247km・地球一周換算・国道デビュー解除)。
- 決定: railmap資産をほぼそのまま流用(railType="国道"単一で型互換)。1国道=1 MultiLineStringでサイズ29MB→5.6MBに圧縮。
- 残課題: GitHub Pages公開エクスポート(ケン確認後)。酷道タグ・都道府県別達成率はv2。
