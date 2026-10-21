import type { Bench, DashboardMode, ModePresentation } from "@/models/classroom";

export const benches: Bench[] = [
  ["A1", 1, 1, "normal"], ["B1", 1, 2, "unassigned"], ["C1", 1, 3, "movement"], ["D1", 1, 4, "normal"], ["E1", 1, 5, "offline"],
  ["A2", 2, 1, "normal"], ["B2", 2, 2, "alert"], ["C2", 2, 3, "normal"], ["D2", 2, 4, "unassigned"], ["E2", 2, 5, "normal"],
  ["A3", 3, 1, "offline"], ["B3", 3, 2, "normal"], ["C3", 3, 3, "normal"], ["D3", 3, 4, "movement"], ["E3", 3, 5, "unassigned"],
].map(([label, row, column, state], index) => ({
  id: `bench-${label}`,
  label: String(label),
  row: Number(row),
  column: Number(column),
  state: state as Bench["state"],
  deviceId: state === "unassigned" ? undefined : `SC-NODE-${String(index + 1).padStart(3, "0")}`,
  distanceMm: state === "unassigned" || state === "offline" ? undefined : state === "alert" ? 612 : state === "movement" ? 505 : 405 + (index % 4) * 7,
  baselineMm: state === "unassigned" ? undefined : 400,
  lastSeen: state === "offline" ? "4 min ago" : "Just now",
}));

export const modePresentations: Record<DashboardMode, ModePresentation> = {
  classroom: {
    title: "Classroom Mode",
    description: "Monitor measured desk distance and movement patterns.",
    detailHeading: "Bench details",
    alertTitle: "Sustained deviation",
    stateLabels: { normal: "Normal", movement: "Temporary movement", alert: "Sustained deviation", offline: "Offline", unassigned: "Unassigned" },
    stateDescriptions: {
      normal: "Within the demonstration range",
      movement: "Temporary distance change example",
      alert: "Static sustained-deviation example",
      offline: "No recent device report",
      unassigned: "No device is assigned to this bench",
    },
  },
  security: {
    title: "Security Mode",
    description: "Monitor protected desk zones while the room is unoccupied.",
    detailHeading: "Protected zone details",
    alertTitle: "Possible intrusion",
    stateLabels: { normal: "Normal", movement: "Transient change", alert: "Possible intrusion", offline: "Offline", unassigned: "Unassigned" },
    stateDescriptions: {
      normal: "No security condition in this demo state",
      movement: "Brief change example; alert criteria not met",
      alert: "Static possible-intrusion example; no detection logic",
      offline: "No recent device report",
      unassigned: "No device is assigned to this bench",
    },
  },
};
