// 塗り状態の Zustand ストア(SPEC §2)。railmap 固有。
import { create } from "zustand";
import type { Ride, SaveData } from "./types";
import { loadData, saveData } from "./persistence";

type RailStore = {
  data: SaveData;
  addRide: (lineId: string) => void;
  removeRide: (lineId: string) => void;
  toggleRide: (lineId: string) => void;
  updateRide: (lineId: string, patch: Partial<Ride>) => void;
  isRidden: (lineId: string) => boolean;
};

function persist(set: (fn: (s: RailStore) => Partial<RailStore>) => void, mutate: (d: SaveData) => SaveData) {
  set((s) => {
    const next = mutate(s.data);
    saveData(next);
    return { data: next };
  });
}

export const useRailStore = create<RailStore>((set, get) => ({
  data: loadData(),

  addRide: (lineId) =>
    persist(set, (d) => ({
      ...d,
      rides: { ...d.rides, [lineId]: d.rides[lineId] ?? { status: "full", count: 1 } },
    })),

  removeRide: (lineId) =>
    persist(set, (d) => {
      const rides = { ...d.rides };
      delete rides[lineId];
      return { ...d, rides };
    }),

  toggleRide: (lineId) => {
    if (get().isRidden(lineId)) get().removeRide(lineId);
    else get().addRide(lineId);
  },

  updateRide: (lineId, patch) =>
    persist(set, (d) => {
      const cur = d.rides[lineId];
      if (!cur) return d;
      return { ...d, rides: { ...d.rides, [lineId]: { ...cur, ...patch } } };
    }),

  isRidden: (lineId) => Boolean(get().data.rides[lineId]),
}));
