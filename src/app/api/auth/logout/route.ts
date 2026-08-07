import { signOut } from "@/lib/auth";

export async function POST() {
  await signOut({ redirectTo: "/" });
}

export async function GET() {
  await signOut({ redirectTo: "/" });
}
