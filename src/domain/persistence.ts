// localStorage 保存/読込/マイグレーション(SPEC §4)。railmap 固有。
import type { SaveData, ThemeColor } from "./types";

const STORAGE_KEY = "kokudomap.v1";
const CURRENT_VERSION = 1 as const;

export function createInitialData(): SaveData {
  return {
    version: CURRENT_VERSION,
    updatedAt: new Date().toISOString(),
    rides: {},
    visitedStations: [],
    settings: { theme: "neon-blue", sound: true },
    unlockedAchievements: {},
  };
}

function migrate(raw: unknown): SaveData {
  if (!raw || typeof raw !== "object") return createInitialData();
  const data = raw as Partial<SaveData> & { version?: number };
  switch (data.version) {
    case 1:
      if (typeof data.rides !== "object" || data.rides === null) return createInitialData();
      return {
        version: 1,
        updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : new Date().toISOString(),
        rides: data.rides as SaveData["rides"],
        visitedStations: Array.isArray(data.visitedStations) ? data.visitedStations : [],
        settings: normalizeSettings(data.settings),
        unlockedAchievements:
          typeof data.unlockedAchievements === "object" && data.unlockedAchievements !== null
            ? (data.unlockedAchievements as SaveData["unlockedAchievements"])
            : {},
      };
    default:
      return createInitialData();
  }
}

function normalizeSettings(s: unknown): SaveData["settings"] {
  const def = createInitialData().settings;
  if (!s || typeof s !== "object") return def;
  const o = s as Partial<SaveData["settings"]>;
  const themes: ThemeColor[] = ["neon-blue", "neon-green", "neon-pink"];
  return {
    theme: o.theme && themes.includes(o.theme) ? o.theme : def.theme,
    sound: typeof o.sound === "boolean" ? o.sound : def.sound,
  };
}

export function loadData(): SaveData {
  try {
    const text = localStorage.getItem(STORAGE_KEY);
    if (!text) return createInitialData();
    return migrate(JSON.parse(text));
  } catch {
    return createInitialData();
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export function saveData(data: SaveData): void {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const payload: SaveData = { ...data, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // 容量超過等は無視
    }
  }, 300);
}

export function exportData(data: SaveData): string {
  return JSON.stringify(data, null, 2);
}

export function parseImported(text: string): SaveData | null {
  try {
    const obj = JSON.parse(text);
    if (!obj || obj.version !== CURRENT_VERSION) return null;
    return migrate(obj);
  } catch {
    return null;
  }
}
