import { MongoMemoryServer } from "mongodb-memory-server";

const server = await MongoMemoryServer.create({
  instance: { port: 27017, dbName: "kaundinya" },
});

console.log(`[dev-mongo] ready at ${server.getUri()}`);

async function shutdown() {
  await server.stop();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

setInterval(() => {}, 1 << 30);
