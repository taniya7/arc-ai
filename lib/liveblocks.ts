import { Liveblocks } from "@liveblocks/node";

/**
 * Cached Liveblocks node client.
 *
 * In development Next.js hot-reloads modules, so we store the instance on
 * `globalThis` to avoid creating multiple clients.
 */
const globalForLiveblocks = globalThis as unknown as {
  liveblocks: Liveblocks | undefined;
};

export const liveblocks =
  globalForLiveblocks.liveblocks ??
  new Liveblocks({
    secret: process.env.LIVEBLOCKS_SECRET_KEY!,
  });

if (process.env.NODE_ENV !== "production") {
  globalForLiveblocks.liveblocks = liveblocks;
}

// ---------------------------------------------------------------------------
// Cursor-color helper
// ---------------------------------------------------------------------------

/**
 * A fixed palette of 12 visually distinct cursor colors that work well
 * on dark backgrounds.
 */
const CURSOR_COLORS = [
  "#E57373", // red
  "#64B5F6", // blue
  "#81C784", // green
  "#FFD54F", // amber
  "#BA68C8", // purple
  "#4DD0E1", // cyan
  "#FF8A65", // deep orange
  "#AED581", // light green
  "#F06292", // pink
  "#90A4AE", // blue grey
  "#FFB74D", // orange
  "#7986CB", // indigo
] as const;

/**
 * Deterministically maps a user ID to a consistent cursor color from the
 * fixed palette.  Uses a simple hash so the same user always gets the same
 * color across sessions.
 */
export function getCursorColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0; // convert to 32-bit int
  }
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}
