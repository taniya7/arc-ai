import { clerkClient } from "@clerk/nextjs/server";

/**
 * Enriched collaborator info returned to the client.
 */
export interface CollaboratorInfo {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string; // ISO string
}

/**
 * Owner info returned alongside collaborators.
 */
export interface OwnerInfo {
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
}

/**
 * Look up Clerk users by their email addresses and return a map
 * of email → { displayName, avatarUrl }.
 *
 * If no Clerk user is found for an email, that email is omitted
 * from the returned map (callers should fall back to email-only display).
 */
export async function enrichEmails(
  emails: string[]
): Promise<Map<string, { displayName: string; avatarUrl: string | null }>> {
  const result = new Map<
    string,
    { displayName: string; avatarUrl: string | null }
  >();

  if (emails.length === 0) return result;

  const client = await clerkClient();

  // Clerk's getUserList supports filtering by email address.
  // We batch all emails in a single call.
  try {
    const { data: users } = await client.users.getUserList({
      emailAddress: emails,
      limit: 100,
    });

    for (const user of users) {
      for (const emailObj of user.emailAddresses) {
        const addr = emailObj.emailAddress.toLowerCase();
        if (emails.includes(addr)) {
          const displayName =
            [user.firstName, user.lastName].filter(Boolean).join(" ") ||
            emailObj.emailAddress;

          result.set(addr, {
            displayName,
            avatarUrl: user.imageUrl ?? null,
          });
        }
      }
    }
  } catch {
    // If Clerk API fails, return empty map — callers fall back to email-only.
  }

  return result;
}

/**
 * Look up a Clerk user by their userId and return display info.
 * Returns null fields if the user can't be found.
 */
export async function enrichOwner(ownerId: string): Promise<OwnerInfo> {
  const client = await clerkClient();
  try {
    const user = await client.users.getUser(ownerId);
    const email = user.emailAddresses?.[0]?.emailAddress ?? "";
    const displayName =
      [user.firstName, user.lastName].filter(Boolean).join(" ") || null;
    return {
      email,
      displayName,
      avatarUrl: user.imageUrl ?? null,
    };
  } catch {
    return { email: "", displayName: null, avatarUrl: null };
  }
}

