import Link from "next/link";
import { SignupForm } from "./signup-form";

export const metadata = { title: "Sign up · Pulse" };

export default function SignupPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome to the team.
        </p>
      </div>
      <SignupForm />
      <p className="text-sm text-muted-foreground text-center">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
