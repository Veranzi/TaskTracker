import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { projects } from "@/lib/db/schema";

export async function listActiveProjects() {
  return db
    .select()
    .from(projects)
    .where(eq(projects.archived, false))
    .orderBy(asc(projects.name));
}
