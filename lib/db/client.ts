import "server-only";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env";
import * as schema from "./schema";

type Db = PostgresJsDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { _db?: Db };

function getDb(): Db {
  if (globalForDb._db) return globalForDb._db;
  const client = postgres(env().DATABASE_URL, {
    // Supabase's transaction pooler (port 6543) doesn't support PREPARE.
    prepare: false,
    max: 10,
    // Recycle idle connections so stale TCP sockets don't hang forever.
    idle_timeout: 20,
    max_lifetime: 60 * 30,
    connect_timeout: 10,
  });
  const instance = drizzle(client, { schema });
  if (process.env.NODE_ENV !== "production") {
    globalForDb._db = instance;
  }
  return instance;
}

// Proxy so existing `import { db } from "@/lib/db/client"` callers still work.
// The actual postgres connection + env validation happens on first property access.
export const db = new Proxy({} as Db, {
  get(_target, prop) {
    return Reflect.get(getDb() as object, prop);
  },
});
