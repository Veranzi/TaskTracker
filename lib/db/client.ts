import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env";
import * as schema from "./schema";

// Reuse one pg client across hot reloads in dev.
const globalForDb = globalThis as unknown as {
  _pgClient?: ReturnType<typeof postgres>;
};

const client =
  globalForDb._pgClient ??
  postgres(env.DATABASE_URL, {
    // Supabase's transaction pooler (port 6543) doesn't support PREPARE.
    prepare: false,
    max: 10,
    // Recycle idle connections every 20s — pooler silently drops them after a while
    // and a stale TCP socket will hang for the OS-default timeout (minutes) on next use.
    idle_timeout: 20,
    max_lifetime: 60 * 30,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb._pgClient = client;
}

export const db = drizzle(client, { schema });
