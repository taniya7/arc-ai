# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Editor Workspace Shell

## Current Goal

- `12-shape-panel`

## Completed

- `01-design-system` — shadcn/ui installed with Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea. `cn()` helper in `lib/utils.ts`. Dark-only theme in `globals.css`. `lucide-react` installed.
- `02-editor-chrome` — Editor navbar with sidebar toggle (`PanelLeftOpen`/`PanelLeftClose`). Floating project sidebar with tabs (My Projects / Shared), empty placeholders, and New Project button. Dialog pattern verified (shadcn Dialog already uses project color tokens).
- `03-auth` — ClerkProvider with dark theme wrapping root layout. Sign-in/sign-up pages with two-panel layout. `proxy.ts` protected-first middleware. Home page redirects by auth state. `UserButton` in editor navbar.
- `04-project-dialogs` — Editor home screen with heading/description/New Project button. Create/Rename/Delete project dialogs using shadcn Dialog. `useProjectDialogs` hook for dialog/form/loading state. Sidebar project items with owner-only actions menu (rename/delete). Mock project data. Live slug preview in create dialog.
- `05-prisma` — Prisma schema with Project and ProjectCollaborator models. `lib/prisma.ts` cached singleton branching Accelerate vs direct `@prisma/adapter-pg`. Initial migration applied.
- `06-project-apis` — REST endpoints: GET/POST `/api/projects`, PATCH/DELETE `/api/projects/[projectId]`. Clerk auth (401) and owner-only mutation guards (403).
- `07-wire-editor-home` — Server-side data fetching for editor page. `useProjectActions` hook with real API mutations (create/rename/delete). Sidebar and dialogs wired to live data. Create navigates to workspace. Delete redirects if active.
- `08-editor-workspace-shell` — `/editor/[roomId]` server component with auth/access gates. `lib/project-access.ts` helpers. `AccessDenied` component. `WorkspaceShell` with navbar (project name, share, AI toggle), canvas placeholder, AI sidebar placeholder. Sidebar highlights active room.
- `09-share-dialog` — Share dialog with owner invite/remove and collaborator read-only list. Clerk Backend API enrichment for names/avatars. Copy project link with "Copied!" feedback. REST endpoints: GET/POST `/api/projects/[projectId]/collaborators`, DELETE `/api/projects/[projectId]/collaborators/[collaboratorId]`. `useShareDialog` hook.
- `10-liveblocks-setup` — Liveblocks config with Presence (cursor, isThinking) and UserMeta (name, avatar, cursorColor). Cached node client in `lib/liveblocks.ts` with deterministic cursor color helper. `POST /api/liveblocks-auth` route with Clerk auth, project access verification, room creation, and session token.

- `11-base-canvas` — Created shared canvas types. Implemented Liveblocks room wrapper with suspense and error handling. Set up React Flow canvas synced to Liveblocks with dark theme mini map.

## In Progress

- `12-shape-panel`

## Next Up

- Add the next planned feature unit here.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Using Tailwind v4 with `@tailwindcss/postcss`. shadcn/ui configured to match the dark-only theme from `ui-context.md`.

## Session Notes

- Add context needed to resume work in the next session.
