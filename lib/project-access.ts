import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * Get the current Clerk identity (userId + primary email).
 * Returns null fields when unauthenticated.
 */
export async function getIdentity(): Promise<{
  userId: string | null;
  email: string | null;
}> {
  const { userId } = await auth();
  if (!userId) return { userId: null, email: null };

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;

  return { userId, email };
}

/**
 * Check whether a user has access to a project.
 * Access is granted if the user is the owner OR a collaborator (by email).
 *
 * Returns the project record if access is granted, or null otherwise.
 */
export async function checkProjectAccess(
  projectId: string,
  userId: string,
  email: string | null
): Promise<{ id: string; name: string; ownerId: string } | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, name: true, ownerId: true },
  });

  if (!project) return null;

  // Owner has access
  if (project.ownerId === userId) {
    return { id: project.id, name: project.name, ownerId: project.ownerId };
  }

  // Collaborator by email
  if (email) {
    const collaborator = await prisma.projectCollaborator.findUnique({
      where: { projectId_email: { projectId, email } },
    });
    if (collaborator) {
      return { id: project.id, name: project.name, ownerId: project.ownerId };
    }
  }

  return null;
}
