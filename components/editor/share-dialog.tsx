"use client";

import { useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Link2, Trash2, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CollaboratorInfo, OwnerInfo } from "@/lib/clerk-users";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isOwner: boolean;

  // Owner data
  owner: OwnerInfo | null;

  // Collaborator data
  collaborators: CollaboratorInfo[];
  isLoadingCollaborators: boolean;

  // Invite controls (owner only)
  inviteEmail: string;
  onInviteEmailChange: (email: string) => void;
  isInviting: boolean;
  inviteError: string | null;
  onInvite: () => void;

  // Remove (owner only)
  removingId: string | null;
  onRemove: (collaboratorId: string) => void;

  // Copy link
  copied: boolean;
  onCopyLink: () => void;
}

export function ShareDialog({
  open,
  onOpenChange,
  isOwner,
  owner,
  collaborators,
  isLoadingCollaborators,
  inviteEmail,
  onInviteEmailChange,
  isInviting,
  inviteError,
  onInvite,
  removingId,
  onRemove,
  copied,
  onCopyLink,
}: ShareDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && isOwner) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open, isOwner]);

  // Total people count = owner + collaborators
  const totalPeople = (owner ? 1 : 0) + collaborators.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent id="share-dialog" className="w-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share project</DialogTitle>
          <DialogDescription>
            Invite collaborators, copy the workspace link, and manage access.
          </DialogDescription>
        </DialogHeader>

        {/* ─── Workspace Link Card ─── */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-elevated px-4 py-3">
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-medium text-foreground">
              Workspace link
            </p>
            <p className="text-xs text-muted-foreground">
              Share a direct link with teammates after you grant them access.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onCopyLink}
            className={cn(
              "shrink-0 gap-1.5 ml-4 transition-colors duration-200",
              copied && "border-success/50 text-success hover:text-success"
            )}
          >
            <Link2 className="size-3.5" />
            {copied ? "Copied!" : "Copy link"}
          </Button>
        </div>

        {/* ─── Invite Form (Owner Only) ─── */}
        {isOwner && (
          <div className="flex flex-col gap-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onInvite();
              }}
              className="flex items-center gap-2 rounded-xl border border-border bg-elevated px-3 py-1.5"
            >
              <Mail className="size-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                id="share-invite-email"
                type="email"
                placeholder="teammate@company.com"
                value={inviteEmail}
                onChange={(e) => onInviteEmailChange(e.target.value)}
                disabled={isInviting}
                autoComplete="email"
                className="h-8 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!inviteEmail.trim() || isInviting}
                className="shrink-0 rounded-lg px-4"
              >
                {isInviting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  "Invite"
                )}
              </Button>
            </form>
            {inviteError && (
              <p className="px-1 text-xs text-error animate-in fade-in-0 slide-in-from-top-1 duration-200">
                {inviteError}
              </p>
            )}
          </div>
        )}

        {/* ─── People with access ─── */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">
              People with access
            </h3>
            {!isLoadingCollaborators && (
              <span className="text-xs tabular-nums text-muted-foreground">
                {totalPeople} total
              </span>
            )}
          </div>

          {isLoadingCollaborators ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ScrollArea className="max-h-64">
              <div className="flex flex-col gap-1.5">
                {/* Owner row */}
                {owner && (
                  <PersonRow
                    email={owner.email}
                    displayName={owner.displayName}
                    avatarUrl={owner.avatarUrl}
                    role="owner"
                  />
                )}

                {/* Collaborator rows */}
                {collaborators.map((collab) => (
                  <PersonRow
                    key={collab.id}
                    email={collab.email}
                    displayName={collab.displayName}
                    avatarUrl={collab.avatarUrl}
                    role="collaborator"
                    showRemove={isOwner}
                    isRemoving={removingId === collab.id}
                    onRemove={() => onRemove(collab.id)}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Person Row ─── */

interface PersonRowProps {
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: "owner" | "collaborator";
  showRemove?: boolean;
  isRemoving?: boolean;
  onRemove?: () => void;
}

function PersonRow({
  email,
  displayName,
  avatarUrl,
  role,
  showRemove,
  isRemoving,
  onRemove,
}: PersonRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-elevated px-3 py-2.5">
      {/* Avatar */}
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={displayName || email}
          className="size-9 shrink-0 rounded-full object-cover ring-1 ring-border"
        />
      ) : (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/10 ring-1 ring-brand/20">
          <span className="text-sm font-semibold uppercase text-brand">
            {(email || "?")[0]}
          </span>
        </div>
      )}

      {/* Name + email */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">
            {displayName || email}
          </p>
          {/* Role badge */}
          <span
            className={cn(
              "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
              role === "owner"
                ? "bg-brand/15 text-brand"
                : "bg-muted text-muted-foreground"
            )}
          >
            {role}
          </span>
        </div>
        <p className="truncate text-xs text-muted-foreground">{email}</p>
      </div>

      {/* Remove button */}
      {showRemove && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          disabled={isRemoving}
          aria-label={`Remove ${displayName || email}`}
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
            "text-error/70 hover:bg-error/10 hover:text-error",
            "disabled:opacity-50"
          )}
        >
          {isRemoving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
        </button>
      )}
    </div>
  );
}
