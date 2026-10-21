import "dotenv/config";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
if (!testDatabaseUrl) {
  console.error("TEST_DATABASE_URL is required. Configure a separate database whose name ends in _test.");
  process.exit(1);
}

let databaseName: string;
try {
  databaseName = decodeURIComponent(new URL(testDatabaseUrl).pathname.replace(/^\//, "").split("?")[0] ?? "");
} catch {
  console.error("TEST_DATABASE_URL is not a valid PostgreSQL URL.");
  process.exit(1);
}

if (!databaseName.endsWith("_test")) {
  console.error("Refusing to migrate test database: TEST_DATABASE_URL database name must end with _test.");
  process.exit(1);
}

const prismaCli = resolve("node_modules", "prisma", "build", "index.js");
const result = spawnSync(process.execPath, [prismaCli, "migrate", "deploy", "--config", "prisma.test.config.ts"], {
  cwd: process.cwd(),
  env: process.env,
  stdio: "inherit",
});

if (result.error) {
  console.error("Could not start Prisma test migration.", result.error.message);
  process.exitCode = 1;
} else {
  process.exitCode = result.status ?? 1;
}
