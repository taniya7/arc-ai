import { NextRequest, NextResponse } from "next/server";
import { getIdentity, checkProjectAccess } from "@/lib/project-access";
import { liveblocks, getCursorColor } from "@/lib/liveblocks";
import { enrichOwner } from "@/lib/clerk-users";

/**
 * POST /api/liveblocks-auth
 *
 * Authenticates the current Clerk user for a Liveblocks room whose ID
 * equals the project ID.
 *
 * Request body: { room: string }   (the project / room ID)
 *
 * Returns:
 *  - 401  if the user is not signed in
 *  - 403  if the user has no access to the project
 *  - 200  with a Liveblocks session token on success
 */
export async function POST(req: NextRequest) {
  // 1. Require Clerk authentication
  const { userId, email } = await getIdentity();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse the requested room (= project ID)
  const body = await req.json().catch(() => null);
  const room: string | undefined = body?.room;

  if (!room) {
    return NextResponse.json(
      { error: "Missing room in request body" },
      { status: 400 }
    );
  }

  // 3. Verify project access using the existing access helper
  const project = await checkProjectAccess(room, userId, email);
  if (!project) {
    return NextResponse.json(
      { error: "You do not have access to this project" },
      { status: 403 }
    );
  }

  // 4. Ensure the Liveblocks room exists (create only if needed)
  try {
    await liveblocks.getOrCreateRoom(room, {
      defaultAccesses: [],
    });
  } catch (error) {
    console.error("Failed to get or create Liveblocks room:", error);
    return NextResponse.json(
      { error: "Failed to initialize room" },
      { status: 500 }
    );
  }

  // 5. Fetch user display info from Clerk
  const ownerInfo = await enrichOwner(userId);
  const userName = ownerInfo.displayName || email || "Anonymous";
  const userAvatar = ownerInfo.avatarUrl || "";
  const cursorColor = getCursorColor(userId);

  // 6. Create and return the Liveblocks session token
  const session = liveblocks.prepareSession(userId, {
    userInfo: {
      name: userName,
      avatar: userAvatar,
      cursorColor,
    },
  });

  // Grant full access to this specific room
  session.allow(room, session.FULL_ACCESS);

  const { status, body: responseBody } = await session.authorize();
  return new Response(responseBody, { status });
}
