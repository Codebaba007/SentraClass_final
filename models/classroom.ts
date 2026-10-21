export type DashboardMode = "classroom" | "security";
export type BenchState = "reported" | "unavailable" | "no-telemetry" | "unassigned";

export interface Bench {
  id: string;
  label: string;
  row: number;
  column: number;
  deviceId?: string;
  source?: "simulated" | "physical";
  state: BenchState;
  distanceMm?: number;
  baselineMm?: number;
  lastSeen?: string;
}

export interface ModePresentation {
  title: string;
  description: string;
  stateLabels: Record<BenchState, string>;
  detailHeading: string;
  alertTitle: string;
  stateDescriptions: Record<BenchState, string>;
}
