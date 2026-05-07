import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in · Pulse" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sign in to your account.
        </p>
      </div>
      <LoginForm next={next} />
      <p className="text-sm text-muted-foreground text-center">
        New here?{" "}
        <Link
          href="/signup"
          className="text-primary underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
