import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";

// Pulse has no public marketing page — / sends you to the right place.
export default async function Home() {
  const user = await getUser();
  redirect(user ? "/inbox" : "/login");
}
