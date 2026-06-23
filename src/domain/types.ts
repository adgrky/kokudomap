// railmap 固有型(SPEC §3.2 / §4)

// kokudomap では "国道" 単一。railmap資産の型を流用するため union に追加。
export type RailType = "新幹線" | "JR在来線" | "私鉄" | "地下鉄" | "路面・その他" | "国道";

export type LineMeta = {
  operator: string;
  lineName: string;
  lengthKm: number;
  railType: RailType;
  pref: string[];
  /** 国道番号(一桁国道コンプ称号用)。 */
  ref?: number;
};

export type Meta = {
  lines: Record<string, LineMeta>;
  totals: {
    lengthKm: number;
    lineCount: number;
    stationCount: number;
    byPref: Record<string, number>;
    byRailType: Record<string, number>;
  };
};

export type LineProps = {
  lineId: string;
  operator: string;
  lineName: string;
  segIdx: number;
  railType: RailType;
};

export type RideStatus = "full";

export type Ride = {
  status: RideStatus;
  firstDate?: string;
  count: number;
  memo?: string;
};

export type ThemeColor = "neon-blue" | "neon-green" | "neon-pink";

export type SaveData = {
  version: 1;
  updatedAt: string;
  rides: Record<string, Ride>;
  visitedStations: string[];
  settings: { theme: ThemeColor; sound: boolean };
  unlockedAchievements: Record<string, string>;
};
