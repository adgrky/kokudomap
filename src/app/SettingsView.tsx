// 設定画面(SPEC §5.5)。app層。
import { useRef, useState } from "react";
import type { ThemeColor } from "../domain/types";
import { exportData, parseImported, createInitialData } from "../domain/persistence";
import { useRailStore } from "../domain/store";
import { redeemPremiumCode } from "@fillmap/core/generic";

const APP_VERSION = "0.2.0"; // Phase2

const STRIPE_LINK = import.meta.env.VITE_STRIPE_PAYMENT_LINK as string | undefined;
const UNLOCK_HASH = import.meta.env.VITE_UNLOCK_CODE_HASH as string | undefined;

type Props = {
  premium: boolean;
  onPremiumUnlocked: () => void;
};

const THEMES: { color: ThemeColor; label: string; hex: string }[] = [
  { color: "neon-blue",  label: "ネオンブルー",  hex: "#38bdf8" },
  { color: "neon-green", label: "ネオングリーン", hex: "#34d399" },
  { color: "neon-pink",  label: "ネオンピンク",   hex: "#f472b6" },
];

export function SettingsView({ premium, onPremiumUnlocked }: Props) {
  const data = useRailStore((s) => s.data);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [clearStep, setClearStep] = useState<0 | 1 | 2>(0); // 0=通常 1=確認 2=再確認
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleRedeem = async () => {
    setCodeError(null);
    if (!UNLOCK_HASH) {
      setCodeError("現在準備中です。");
      return;
    }
    const ok = await redeemPremiumCode("kokudomap.v1", code, UNLOCK_HASH);
    if (ok) {
      onPremiumUnlocked();
      setCode("");
    } else {
      setCodeError("コードが正しくありません。");
    }
  };

  const setTheme = (theme: ThemeColor) =>
    useRailStore.setState((s) => ({ data: { ...s.data, settings: { ...s.data.settings, theme } } }));

  const setSound = (sound: boolean) =>
    useRailStore.setState((s) => ({ data: { ...s.data, settings: { ...s.data.settings, sound } } }));

  // エクスポート
  const handleExport = () => {
    const json = exportData(data);
    const blob = new Blob([json], { type: "application/json" });
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `kokudomap-backup-${date}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  };

  // インポート(§5.5: version 検証→確認→反映)
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    setImportSuccess(false);
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseImported(reader.result as string);
      if (!parsed) {
        setImportError("ファイルが壊れているか、対応していないバージョンです。現在のデータは保持されます。");
        return;
      }
      const ok = window.confirm("現在のデータをすべて上書きします。よろしいですか？");
      if (!ok) return;
      useRailStore.setState({ data: parsed });
      setImportSuccess(true);
    };
    reader.readAsText(file);
    // 同じファイルを再選択できるよう reset
    e.target.value = "";
  };

  // 全消去(2段階確認, §5.5)
  const handleClear = () => {
    if (clearStep === 0) { setClearStep(1); return; }
    if (clearStep === 1) { setClearStep(2); return; }
    useRailStore.setState({ data: createInitialData() });
    setClearStep(0);
  };

  return (
    <div className="h-full overflow-y-auto bg-bg pb-20">
      <div className="mx-auto max-w-md space-y-4 p-4">

        {/* テーマカラー選択 */}
        <section className="rounded-token bg-surface p-4">
          <h2 className="mb-3 text-sm font-semibold text-text-dim">テーマカラー</h2>
          <div className="flex gap-3">
            {THEMES.map((t) => (
              <button
                key={t.color}
                onClick={() => setTheme(t.color)}
                className={`flex-1 rounded-lg py-2.5 text-xs font-semibold transition-all ${
                  data.settings.theme === t.color ? "ring-2 ring-offset-1 ring-offset-surface" : "opacity-60 hover:opacity-80"
                }`}
                style={{
                  background: `${t.hex}22`,
                  color: t.hex,
                  ringColor: t.hex,
                  boxShadow: data.settings.theme === t.color ? `0 0 8px ${t.hex}60` : undefined,
                } as React.CSSProperties}
              >
                {t.label}
              </button>
            ))}
          </div>
        </section>

        {/* 効果音 */}
        <section className="rounded-token bg-surface p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-text">効果音</p>
              <p className="text-sm text-text-dim">走破した!ボタンの効果音</p>
            </div>
            <button
              onClick={() => setSound(!data.settings.sound)}
              className={`relative h-7 w-12 rounded-full transition-colors ${data.settings.sound ? "bg-accent-blue" : "bg-surface-2"}`}
              role="switch"
              aria-checked={data.settings.sound}
            >
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                  data.settings.sound ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </section>

        {/* データ管理 */}
        <section className="rounded-token bg-surface p-4">
          <h2 className="mb-3 text-sm font-semibold text-text-dim">データ</h2>
          <div className="space-y-2">
            <button
              onClick={handleExport}
              className="w-full rounded-lg bg-surface-2 py-3 text-sm font-semibold text-text hover:bg-surface-2/70"
            >
              💾 バックアップを書き出す
            </button>
            <button
              onClick={() => { setImportError(null); setImportSuccess(false); fileRef.current?.click(); }}
              className="w-full rounded-lg bg-surface-2 py-3 text-sm font-semibold text-text hover:bg-surface-2/70"
            >
              📂 バックアップから読み込む
            </button>
            <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={handleImportFile} />
            {importError && <p className="rounded-lg bg-danger/10 p-3 text-xs text-danger">{importError}</p>}
            {importSuccess && <p className="rounded-lg bg-accent-green/10 p-3 text-xs text-accent-green">読み込みが完了しました。</p>}
          </div>
        </section>

        {/* 全消去(2段階確認) */}
        <section className="rounded-token bg-surface p-4">
          <h2 className="mb-3 text-sm font-semibold text-text-dim">危険操作</h2>
          {clearStep === 0 && (
            <button onClick={handleClear} className="w-full rounded-lg border border-danger/40 py-3 text-sm font-semibold text-danger hover:bg-danger/10">
              🗑️ すべてのデータを消去する
            </button>
          )}
          {clearStep === 1 && (
            <div className="space-y-2">
              <p className="text-sm text-danger">本当に消去しますか？元には戻せません。</p>
              <button onClick={handleClear} className="w-full rounded-lg bg-danger/20 py-3 text-sm font-bold text-danger hover:bg-danger/30">
                はい、消去します
              </button>
              <button onClick={() => setClearStep(0)} className="w-full rounded-lg bg-surface-2 py-3 text-sm text-text-dim hover:bg-surface-2/70">
                キャンセル
              </button>
            </div>
          )}
          {clearStep === 2 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-danger">最後の確認です。本当に消去しますか？</p>
              <button onClick={handleClear} className="w-full rounded-lg bg-danger py-3 text-sm font-bold text-white hover:opacity-90">
                完全に消去する
              </button>
              <button onClick={() => setClearStep(0)} className="w-full rounded-lg bg-surface-2 py-3 text-sm text-text-dim hover:bg-surface-2/70">
                キャンセル
              </button>
            </div>
          )}
        </section>

        {/* 広告除外(買い切り) */}
        <section className="rounded-token bg-surface p-4">
          <h2 className="mb-1 text-sm font-semibold text-text-dim">広告除外</h2>
          {premium ? (
            <p className="rounded-lg bg-accent-green/10 p-3 text-sm text-accent-green">
              購入済みです。広告は表示されません。
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-text-dim">
                買い切りで広告を非表示にできます。決済ページで購入後に表示されるコードをここに入力してください。
              </p>
              {STRIPE_LINK ? (
                <a
                  href={STRIPE_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full rounded-lg bg-surface-2 py-3 text-center text-sm font-semibold text-text hover:bg-surface-2/70"
                >
                  💳 広告を削除する(買い切り)
                </a>
              ) : (
                <p className="rounded-lg bg-surface-2 p-3 text-xs text-text-dim">準備中です。</p>
              )}
              <div className="flex gap-2">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="解除コードを入力"
                  className="flex-1 rounded-lg bg-surface-2 px-3 py-2 text-sm text-text outline-none"
                />
                <button
                  onClick={handleRedeem}
                  className="rounded-lg bg-accent-blue px-4 py-2 text-sm font-semibold text-bg"
                >
                  適用
                </button>
              </div>
              {codeError && <p className="text-xs text-danger">{codeError}</p>}
            </div>
          )}
        </section>

        {/* 出典・プライバシー(§5.5 / §1) */}
        <section className="rounded-token bg-surface p-4 text-xs text-text-dim">
          <p className="mb-2 font-semibold text-text">このアプリについて</p>
          <p className="mb-1">バージョン {APP_VERSION}</p>
          <p className="mb-3 rounded-lg bg-surface-2 px-3 py-2 text-text">
            すべてのデータは端末内にのみ保存されます。外部サーバーへの送信は一切行いません。
          </p>
          <p className="font-semibold text-text-dim">出典</p>
          <ul className="mt-1 space-y-1">
            <li>国道データ: © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline">OpenStreetMap contributors</a>(ODbL)。route=road / network=JP:national を抽出して作成</li>
            <li>地図タイル: © <a href="https://openfreemap.org" target="_blank" rel="noopener noreferrer" className="underline">OpenFreeMap</a></li>
            <li>総延長は概算値です(上下線・重複区間の扱いにより道路統計年報と差異あり)</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
