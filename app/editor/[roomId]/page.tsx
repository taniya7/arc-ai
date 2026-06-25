import { redirect } from "next/navigation";
import { getIdentity, checkProjectAccess } from "@/lib/project-access";
import { getOwnedProjects, getSharedProjects } from "@/lib/projects";
import { AccessDenied } from "@/components/editor/access-denied";
import { WorkspaceShell } from "@/components/editor/workspace-shell";

interface PageProps {
  params: Promise<{ roomId: string }>;
}

export default async function WorkspacePage({ params }: PageProps) {
  const { roomId } = await params;

  // ─── Auth check ───
  const { userId, email } = await getIdentity();
  if (!userId) redirect("/sign-in");

  // ─── Access check ───
  const project = await checkProjectAccess(roomId, userId, email);
  if (!project) return <AccessDenied />;

  // ─── Fetch sidebar data ───
  const [ownedProjects, sharedProjects] = await Promise.all([
    getOwnedProjects(userId),
    email ? getSharedProjects(email) : Promise.resolve([]),
  ]);

  return (
    <WorkspaceShell
      projectId={project.id}
      projectName={project.name}
      isOwner={project.ownerId === userId}
      ownedProjects={ownedProjects}
      sharedProjects={sharedProjects}
    />
  );
}
