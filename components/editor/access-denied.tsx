import { Lock } from "lucide-react";
import Link from "next/link";

/**
 * Shown when a user tries to access a project they don't have
 * permission for, or when the project doesn't exist.
 */
export function AccessDenied() {
  return (
    <main
      id="access-denied"
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6"
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <Lock className="size-6 text-muted-foreground" />
      </div>

      <h1 className="text-lg font-semibold text-foreground">
        Access Denied
      </h1>

      <p className="max-w-sm text-center text-sm text-muted-foreground">
        You don&apos;t have access to this project, or it may no longer exist.
      </p>

      <Link
        href="/editor"
        className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Back to Editor
      </Link>
    </main>
  );
}
