import { buildApp } from "./app.js";
import { config } from "./config.js";
import { prisma } from "./db/client.js";

const app = buildApp(prisma);

try {
  await app.listen({ host: config.HOST, port: config.PORT });
} catch (error) {
  app.log.error({ err: error }, "Failed to start API server");
  await prisma.$disconnect();
  process.exitCode = 1;
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, async () => {
    await app.close();
    await prisma.$disconnect();
    process.exit(0);
  });
}
