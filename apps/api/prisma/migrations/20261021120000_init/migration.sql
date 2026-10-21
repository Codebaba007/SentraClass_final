-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "OperatingMode" AS ENUM ('classroom', 'security');

-- CreateEnum
CREATE TYPE "DeviceSource" AS ENUM ('simulated', 'physical');

-- CreateEnum
CREATE TYPE "MeasurementStatus" AS ENUM ('ok', 'out_of_range', 'signal_fail', 'timeout', 'not_ready');

-- CreateEnum
CREATE TYPE "AlertOutput" AS ENUM ('off', 'on');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('possible_intrusion', 'device_offline', 'device_recovered');

-- CreateEnum
CREATE TYPE "EventSeverity" AS ENUM ('info', 'warning', 'critical');

-- CreateTable
CREATE TABLE "Classroom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mode" "OperatingMode" NOT NULL DEFAULT 'classroom',
    "rawTelemetryRetentionDays" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Classroom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bench" (
    "id" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "row" INTEGER NOT NULL,
    "column" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bench_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "source" "DeviceSource" NOT NULL,
    "benchId" TEXT,
    "lastSeen" TIMESTAMP(3),
    "lastDistanceMm" INTEGER,
    "lastMeasurementStatus" "MeasurementStatus",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModeConfiguration" (
    "id" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "mode" "OperatingMode" NOT NULL,
    "distanceChangeThresholdMm" INTEGER NOT NULL,
    "persistenceSeconds" INTEGER NOT NULL,
    "recoverySeconds" INTEGER NOT NULL,
    "offlineTimeoutSeconds" INTEGER NOT NULL,
    "demonstrationDefault" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModeConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelemetryReading" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "schemaVersion" INTEGER NOT NULL,
    "sequence" INTEGER NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mode" "OperatingMode" NOT NULL,
    "source" "DeviceSource" NOT NULL,
    "distanceMm" INTEGER,
    "valid" BOOLEAN NOT NULL,
    "status" "MeasurementStatus" NOT NULL,
    "uptimeSeconds" INTEGER,
    "alertOutput" "AlertOutput",

    CONSTRAINT "TelemetryReading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "deviceId" TEXT,
    "type" "EventType" NOT NULL,
    "severity" "EventSeverity" NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Classroom_name_idx" ON "Classroom"("name");

-- CreateIndex
CREATE INDEX "Bench_classroomId_active_idx" ON "Bench"("classroomId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "Bench_classroomId_label_key" ON "Bench"("classroomId", "label");

-- CreateIndex
CREATE UNIQUE INDEX "Bench_classroomId_row_column_key" ON "Bench"("classroomId", "row", "column");

-- CreateIndex
CREATE UNIQUE INDEX "Device_externalId_key" ON "Device"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Device_benchId_key" ON "Device"("benchId");

-- CreateIndex
CREATE INDEX "Device_source_lastSeen_idx" ON "Device"("source", "lastSeen");

-- CreateIndex
CREATE UNIQUE INDEX "ModeConfiguration_classroomId_mode_key" ON "ModeConfiguration"("classroomId", "mode");

-- CreateIndex
CREATE INDEX "TelemetryReading_deviceId_receivedAt_idx" ON "TelemetryReading"("deviceId", "receivedAt" DESC);

-- CreateIndex
CREATE INDEX "TelemetryReading_receivedAt_idx" ON "TelemetryReading"("receivedAt" DESC);

-- CreateIndex
CREATE INDEX "TelemetryReading_source_receivedAt_idx" ON "TelemetryReading"("source", "receivedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "TelemetryReading_deviceId_sequence_key" ON "TelemetryReading"("deviceId", "sequence");

-- CreateIndex
CREATE INDEX "Event_classroomId_createdAt_idx" ON "Event"("classroomId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Event_deviceId_createdAt_idx" ON "Event"("deviceId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Event_type_createdAt_idx" ON "Event"("type", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "Bench" ADD CONSTRAINT "Bench_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_benchId_fkey" FOREIGN KEY ("benchId") REFERENCES "Bench"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModeConfiguration" ADD CONSTRAINT "ModeConfiguration_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TelemetryReading" ADD CONSTRAINT "TelemetryReading_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE SET NULL ON UPDATE CASCADE;
