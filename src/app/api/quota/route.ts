import { auth, clerkClient } from "@clerk/nextjs/server";
import { isUnlimited, remaining, toUsage } from "@/lib/quota";

// Read only: how many scored attempts this account has left. Spends nothing.
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ signedIn: false, unlimited: false, attemptsLeft: 0 });
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const unlimited = isUnlimited(user.emailAddresses.map((e) => e.emailAddress), process.env.BOLO_UNLIMITED_EMAILS);
    const attemptsLeft = unlimited ? 999 : remaining(toUsage(user.privateMetadata?.usage), "analyze");
    return Response.json({ signedIn: true, unlimited, attemptsLeft }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: { type: "QUOTA_FAILED", message: "Could not read usage" } }, { status: 500 });
  }
}
