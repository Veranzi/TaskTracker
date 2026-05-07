import "server-only";
import { z } from "zod";

const Env = z.object({
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

type EnvShape = z.infer<typeof Env>;

let cached: EnvShape | undefined;

// Lazy so the Next.js build (which evaluates route modules to collect metadata)
// doesn't crash when env vars aren't set in CI. Validation runs on first access
// at request time. Literal `process.env.NEXT_PUBLIC_*` references so Next can
// still inline them into client bundles.
export function env(): EnvShape {
  if (cached) return cached;
  cached = Env.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
  return cached;
}
