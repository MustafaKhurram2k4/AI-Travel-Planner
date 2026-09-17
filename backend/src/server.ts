import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./db.js";

async function main() {
  // Fail fast if the database is unavailable.
  await prisma.$connect();

  app.listen(env.PORT, () => {
    console.log(`AI Travel Planner API: http://localhost:${env.PORT}`);
    console.log(`Swagger: http://localhost:${env.PORT}/docs`);
    console.log(`Health: http://localhost:${env.PORT}/health`);
  });
}

main().catch(async error => {
  console.error("Failed to start server:", error);
  await prisma.$disconnect();
  process.exit(1);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
