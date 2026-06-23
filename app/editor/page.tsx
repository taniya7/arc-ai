import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getOwnedProjects, getSharedProjects } from "@/lib/projects";
import { EditorShell } from "@/components/editor/editor-shell";

export default async function EditorPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Fetch owned projects. Shared projects require the user's email.
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";

  const [ownedProjects, sharedProjects] = await Promise.all([
    getOwnedProjects(userId),
    email ? getSharedProjects(email) : Promise.resolve([]),
  ]);

  return (
    <EditorShell
      ownedProjects={ownedProjects}
      sharedProjects={sharedProjects}
    />
  );
}
