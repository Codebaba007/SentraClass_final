export type DashboardMode = "classroom" | "security";
export type BenchState = "normal" | "movement" | "alert" | "offline" | "unassigned";

export interface Bench {
  id: string;
  label: string;
  row: number;
  column: number;
  deviceId?: string;
  state: BenchState;
  distanceMm?: number;
  baselineMm?: number;
  lastSeen: string;
}

export interface ModePresentation {
  title: string;
  description: string;
  stateLabels: Record<BenchState, string>;
  detailHeading: string;
  alertTitle: string;
  stateDescriptions: Record<BenchState, string>;
}
