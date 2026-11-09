// SERVER ONLY. Checks sign-in and spends one unit of the account's usage before an
// upstream call. Usage lives in Clerk private metadata (server-only), so there is no database.

import { auth, clerkClient } from "@clerk/nextjs/server";
import { bump, canUse, isUnlimited, toUsage, type UsageKind } from "./quota";

export type QuotaResult =
  | { ok: true; refund: () => Promise<void> }
  | { ok: false; response: Response };

const NO_REFUND = async () => undefined;

function deny(status: number, type: string, message: string): QuotaResult {
  return { ok: false, response: Response.json({ error: { type, message } }, { status }) };
}

export async function takeQuota(kind: UsageKind): Promise<QuotaResult> {
  const { userId } = await auth();
  if (!userId) return deny(401, "SIGN_IN_REQUIRED", "Sign in to use Bolo.");

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const emails = user.emailAddresses.map((e) => e.emailAddress);
  if (isUnlimited(emails, process.env.BOLO_UNLIMITED_EMAILS)) return { ok: true, refund: NO_REFUND };

  const usage = toUsage(user.privateMetadata?.usage);
  if (!canUse(usage, kind)) return deny(429, "QUOTA_EXCEEDED", "This account has used its free try.");

  // Reserve first so parallel requests cannot all slip through, then refund if the call fails.
  await client.users.updateUserMetadata(userId, { privateMetadata: { usage: bump(usage, kind) } });
  return {
    ok: true,
    refund: async () => {
      try {
        const fresh = await client.users.getUser(userId);
        const now = toUsage(fresh.privateMetadata?.usage);
        await client.users.updateUserMetadata(userId, { privateMetadata: { usage: bump(now, kind, -1) } });
      } catch {
        // A failed refund only costs the user one unit; never mask the original error.
      }
    },
  };
}
