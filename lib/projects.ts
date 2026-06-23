import { prisma } from "@/lib/prisma";

/**
 * Shared project shape used by the sidebar and dialogs.
 * Keeps the boundary between Prisma models and UI lean.
 */
export interface ProjectItem {
  id: string;
  name: string;
  isOwner: boolean;
  updatedAt: string; // ISO string
}

/**
 * Fetch projects the user owns.
 */
export async function getOwnedProjects(
  userId: string
): Promise<ProjectItem[]> {
  const rows = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, updatedAt: true },
  });

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    isOwner: true,
    updatedAt: r.updatedAt.toISOString(),
  }));
}

/**
 * Fetch projects shared with the user (by collaborator email).
 */
export async function getSharedProjects(
  userEmail: string
): Promise<ProjectItem[]> {
  const rows = await prisma.projectCollaborator.findMany({
    where: { email: userEmail },
    orderBy: { project: { updatedAt: "desc" } },
    select: {
      project: {
        select: { id: true, name: true, updatedAt: true },
      },
    },
  });

  return rows.map((r) => ({
    id: r.project.id,
    name: r.project.name,
    isOwner: false,
    updatedAt: r.project.updatedAt.toISOString(),
  }));
}
