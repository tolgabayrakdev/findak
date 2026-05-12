import 'dotenv/config';
import app from "./app.js";
import { config } from "./config/environment.js";
import { prisma } from "./lib/prisma.js";

const server = app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});

async function shutdown(signal) {
  console.log(`${signal} received, shutting down...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));