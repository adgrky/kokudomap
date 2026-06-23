// 振り返り年表タブ。firstDate 年月別に乗車済路線を一覧表示(citymap YearTab と同様の設計)。
import type { Meta, Ride } from "../domain/types";

type Props = {
  meta: Meta;
  rides: Record<string, Ride>;
  themeColor: string;
  onSelect: (lineId: string) => void;
};

type Entry = { lineId: string; lineName: string; operator: string };
type MonthGroup = { month: string; entries: Entry[] };
type YearGroup = { year: string; months: MonthGroup[] };

function buildYearGroups(meta: Meta, rides: Record<string, Ride>): {
  groups: YearGroup[];
  undated: Entry[];
} {
  const byYearMonth: Record<string, Record<string, Entry[]>> = {};
  const undated: Entry[] = [];

  for (const [lineId, ride] of Object.entries(rides)) {
    const info = meta.lines[lineId];
    if (!info) continue;
    const entry = { lineId, lineName: info.lineName, operator: info.operator };
    if (ride.firstDate) {
      const year = ride.firstDate.slice(0, 4);
      const month = ride.firstDate.slice(5, 7);
      ((byYearMonth[year] ??= {})[month] ??= []).push(entry);
    } else {
      undated.push(entry);
    }
  }

  // 事業者→路線名順でソート
  const sort = (arr: Entry[]) =>
    arr.sort((a, b) => a.operator.localeCompare(b.operator) || a.lineName.localeCompare(b.lineName));

  const groups: YearGroup[] = Object.keys(byYearMonth)
    .sort((a, b) => Number(b) - Number(a)) // 新しい年が上
    .map((year) => ({
      year,
      months: Object.keys(byYearMonth[year])
        .sort((a, b) => Number(b) - Number(a)) // 新しい月が上
        .map((month) => ({ month, entries: sort(byYearMonth[year][month]) })),
    }));

  return { groups, undated: sort(undated) };
}

type EntryListProps = {
  entries: Entry[];
  themeColor: string;
  onSelect: (id: string) => void;
};

function EntryList({ entries, themeColor, onSelect }: EntryListProps) {
  // 事業者ごとにまとめる
  const byOperator: Record<string, Entry[]> = {};
  for (const e of entries) {
    (byOperator[e.operator] ??= []).push(e);
  }

  return (
    <div className="space-y-2">
      {Object.entries(byOperator).map(([operator, lines]) => (
        <div key={operator}>
          {operator && <p className="mb-1 text-[11px] text-text-dim">{operator}</p>}
          <div className="flex flex-wrap gap-1.5">
            {lines.map((l) => (
              <button
                key={l.lineId}
                onClick={() => onSelect(l.lineId)}
                className="flex items-center gap-1 rounded-token bg-surface-2 px-2 py-1 text-xs text-text transition-opacity hover:opacity-80"
              >
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ background: themeColor }}
                />
                {l.lineName}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function YearTab({ meta, rides, themeColor, onSelect }: Props) {
  const { groups, undated } = buildYearGroups(meta, rides);
  const total = Object.keys(rides).length;

  if (total === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-text-dim">
        国道をタップして走破を記録しよう
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-bg pb-20">
      <div className="mx-auto max-w-md space-y-6 p-4">
        {groups.map(({ year, months }) => (
          <section key={year}>
            <h2 className="mb-2 text-lg font-bold" style={{ color: themeColor }}>
              {year}年
            </h2>
            <div className="space-y-4">
              {months.map(({ month, entries }) => (
                <div key={month}>
                  <div className="mb-1 flex items-baseline gap-2">
                    <h3 className="text-sm font-semibold text-text">{Number(month)}月</h3>
                    <span className="text-xs text-text-dim">{entries.length}本</span>
                  </div>
                  <EntryList entries={entries} themeColor={themeColor} onSelect={onSelect} />
                </div>
              ))}
            </div>
          </section>
        ))}

        {undated.length > 0 && (
          <section>
            <div className="mb-2 flex items-baseline gap-2">
              <h2 className="text-base font-semibold text-text-dim">日付不明</h2>
              <span className="text-xs text-text-dim">{undated.length}本</span>
            </div>
            <EntryList entries={undated} themeColor={themeColor} onSelect={onSelect} />
          </section>
        )}
      </div>
    </div>
  );
}
