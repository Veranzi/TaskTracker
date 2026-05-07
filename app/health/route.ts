import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";

type PgErrorLike = {
  code?: string;
  errno?: string | number;
  severity?: string;
  detail?: string;
  hint?: string;
  address?: string;
  port?: number;
  message?: string;
};

function unwrap(error: unknown): PgErrorLike & { message: string } {
  const e = error as { cause?: unknown; message?: string } & PgErrorLike;
  const cause = (e?.cause ?? e) as PgErrorLike & { message?: string };
  return {
    message: cause.message ?? e.message ?? String(error),
    code: cause.code,
    errno: cause.errno,
    severity: cause.severity,
    detail: cause.detail,
    hint: cause.hint,
    address: cause.address,
    port: cause.port,
  };
}

export async function GET() {
  const start = Date.now();
  try {
    await db.execute(sql`select 1`);
    return Response.json({
      status: "ok",
      db: "connected",
      latencyMs: Date.now() - start,
    });
  } catch (error) {
    return Response.json(
      {
        status: "error",
        db: "disconnected",
        ...unwrap(error),
      },
      { status: 503 },
    );
  }
}
