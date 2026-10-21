import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required to seed the development database.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
const classroomId = "demo-classroom-room-204";
const benchPositions = ["A1", "B1", "C1", "D1", "E1", "A2", "B2", "C2", "D2", "E2", "A3", "B3", "C3", "D3", "E3"];

async function seed() {
  await prisma.classroom.upsert({
    where: { id: classroomId },
    update: { name: "Room 204" },
    create: { id: classroomId, name: "Room 204", mode: "classroom" },
  });

  for (const [index, label] of benchPositions.entries()) {
    const benchId = `demo-room-204-${label.toLowerCase()}`;
    await prisma.bench.upsert({
      where: { id: benchId },
      update: { classroomId, label, row: Math.floor(index / 5) + 1, column: (index % 5) + 1, active: true },
      create: { id: benchId, classroomId, label, row: Math.floor(index / 5) + 1, column: (index % 5) + 1 },
    });
  }

  for (const mode of ["classroom", "security"] as const) {
    await prisma.modeConfiguration.upsert({
      where: { classroomId_mode: { classroomId, mode } },
      update: {},
      create: {
        classroomId,
        mode,
        distanceChangeThresholdMm: 120,
        persistenceSeconds: 30,
        recoverySeconds: 15,
        offlineTimeoutSeconds: 90,
        demonstrationDefault: true,
      },
    });
  }

  const simulatedDevices = [
    { label: "A1", externalId: "SC-NODE-001", id: "demo-device-001" },
    { label: "C1", externalId: "SC-NODE-003", id: "demo-device-003" },
    { label: "B2", externalId: "SC-NODE-007", id: "demo-device-007" },
    { label: "D3", externalId: "SC-NODE-014", id: "demo-device-014" },
  ];
  for (const device of simulatedDevices) {
    const benchId = `demo-room-204-${device.label.toLowerCase()}`;
    const currentAssignment = await prisma.device.findUnique({ where: { benchId }, select: { externalId: true } });
    const canAssignBench = !currentAssignment || currentAssignment.externalId === device.externalId;
    if (!canAssignBench) console.info(`Skipped assigning ${device.externalId}; bench ${device.label} already has another device.`);
    await prisma.device.upsert({
      where: { externalId: device.externalId },
      update: { source: "simulated", ...(canAssignBench ? { benchId } : {}) },
      create: { id: device.id, externalId: device.externalId, source: "simulated", ...(canAssignBench ? { benchId } : {}) },
    });
  }

  console.info("Seeded demonstration classroom, 15 benches, 4 simulated devices, and 2 demonstration configurations. No events were created.");
}

seed()
  .catch((error: unknown) => {
    console.error("Development seed failed.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
