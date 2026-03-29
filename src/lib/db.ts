import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { schema } from "@/lib/schema";

if (!process.env.TURSO_DATABASE_URL) {
  throw new Error("TURSO_DATABASE_URL is not set.");
}

const globalForDb = globalThis as unknown as {
  tursoClient?: ReturnType<typeof createClient>;
  db?: ReturnType<typeof drizzle<typeof schema>>;
};

const client =
  globalForDb.tursoClient ??
  createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

export const db = globalForDb.db ?? drizzle(client, { schema });
export { client };

if (process.env.NODE_ENV !== "production") {
  globalForDb.tursoClient = client;
  globalForDb.db = db;
}
