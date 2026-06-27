import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  enrichEmails,
  enrichOwner,
  type CollaboratorInfo,
  type OwnerInfo,
} from "@/lib/clerk-users";

type RouteContext = { params: Promise<{ projectId: string }> };

/**
 * GET /api/projects/[projectId]/collaborators — list collaborators for a project.
 * Both owners and collaborators with access can view.
 * Returns { owner: OwnerInfo, collaborators: CollaboratorInfo[] }.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await context.params;

  // Verify project exists and caller has access (owner or collaborator)
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // For now, allow owner and any collaborator to see the list
  if (project.ownerId !== userId) {
    // Check if user is a collaborator by finding their email
    // We need to resolve the user's email first
    const { currentUser } = await import("@clerk/nextjs/server");
    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress ?? null;

    if (!email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const collab = await prisma.projectCollaborator.findUnique({
      where: { projectId_email: { projectId, email } },
    });

    if (!collab) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // Fetch owner info + collaborators in parallel
  const [ownerInfo, collaborators] = await Promise.all([
    enrichOwner(project.ownerId),
    prisma.projectCollaborator.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" },
      select: { id: true, email: true, createdAt: true },
    }),
  ]);

  // Enrich collaborators with Clerk user data
  const emails = collaborators.map((c) => c.email);
  const enriched = await enrichEmails(emails);

  const result: { owner: OwnerInfo; collaborators: CollaboratorInfo[] } = {
    owner: ownerInfo,
    collaborators: collaborators.map((c) => {
      const info = enriched.get(c.email.toLowerCase());
      return {
        id: c.id,
        email: c.email,
        displayName: info?.displayName ?? null,
        avatarUrl: info?.avatarUrl ?? null,
        createdAt: c.createdAt.toISOString(),
      };
    }),
  };

  return NextResponse.json(result);
}

/**
 * POST /api/projects/[projectId]/collaborators — invite a collaborator.
 * Body: { email: string }
 * Only the project owner may invite.
 */
export async function POST(request: Request, context: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await context.params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (project.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let email: string | undefined;

  try {
    const body = await request.json();
    if (body.email && typeof body.email === "string" && body.email.trim()) {
      email = body.email.trim().toLowerCase();
    }
  } catch {
    // Invalid JSON
  }

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "A valid email address is required" },
      { status: 400 }
    );
  }

  // Check if already a collaborator
  const existing = await prisma.projectCollaborator.findUnique({
    where: { projectId_email: { projectId, email } },
  });

  if (existing) {
    return NextResponse.json(
      { error: "This person is already a collaborator" },
      { status: 409 }
    );
  }

  const collaborator = await prisma.projectCollaborator.create({
    data: { projectId, email },
  });

  // Enrich the single new collaborator
  const enriched = await enrichEmails([email]);
  const info = enriched.get(email);

  const result: CollaboratorInfo = {
    id: collaborator.id,
    email: collaborator.email,
    displayName: info?.displayName ?? null,
    avatarUrl: info?.avatarUrl ?? null,
    createdAt: collaborator.createdAt.toISOString(),
  };

  return NextResponse.json(result, { status: 201 });
}
