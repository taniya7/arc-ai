# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Editor Workspace Shell

## Current Goal

- Add the next planned feature unit here.

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
- `12-shape-panel` — Added floating bottom shape toolbar with draggable shape payloads and drop-to-create canvas nodes using shared Liveblocks-backed React Flow state.
- `13-node-shape` — Replaced placeholder nodes with shape-specific rendering for CSS and SVG variants. Added cursor-following drag ghost preview that matches the dropped shape size and stays within existing collaborative canvas flow.
- `14-node-editing` — Added selected-node resize handles with minimum dimensions and inline centered label editing. Label edits sync live through the collaborative canvas state and editing interactions no longer drag or pan the canvas.
- `16-edge-behavior` — Added subtle four-side node handles, custom right-angle canvas edges with arrows and larger interaction paths, and inline edge label editing synced through the collaborative React Flow edge data path.
- `17-canvas-ergonomics` — Added a bottom-left canvas control bar for zoom, fit view, undo, and redo. Wired viewport actions to React Flow, history actions to Liveblocks undo/redo hooks, and matching keyboard shortcuts through `hooks/useKeyboardShortcuts.ts`.

## In Progress

- None.

## Next Up

- Add the next planned feature unit here.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Using Tailwind v4 with `@tailwindcss/postcss`. shadcn/ui configured to match the dark-only theme from `ui-context.md`.

## Session Notes

- `13-node-shape` now uses a shared renderer for CSS and SVG node variants plus a drag ghost preview wired to the existing shape payload and Liveblocks-backed node creation flow.
- `14-node-editing` uses React Flow's built-in node resizer for dimensions and a centered inline textarea editor guarded with `nodrag`/`nopan`/`nowheel` behavior for collaborative label updates.
- `16-edge-behavior` uses a custom React Flow edge renderer with `EdgeLabelRenderer` and `getSmoothStepPath` label coordinates; label saves flow through `updateEdgeData`, which feeds the existing Liveblocks-backed edge change path.
- `17-canvas-ergonomics` uses React Flow viewport methods with short animated transitions and Liveblocks `useUndo`/`useRedo` plus `useCanUndo`/`useCanRedo`; keyboard shortcuts skip inputs, textareas, selects, contenteditable fields, and textbox-role elements.
