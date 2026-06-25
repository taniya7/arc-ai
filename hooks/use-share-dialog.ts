"use client";

import { useState, useCallback, useEffect } from "react";
import type { CollaboratorInfo, OwnerInfo } from "@/lib/clerk-users";

export interface UseShareDialogReturn {
  // Dialog open/close
  isOpen: boolean;
  open: () => void;
  close: () => void;

  // Owner info
  owner: OwnerInfo | null;

  // Collaborator list
  collaborators: CollaboratorInfo[];
  isLoadingCollaborators: boolean;

  // Invite
  inviteEmail: string;
  setInviteEmail: (email: string) => void;
  isInviting: boolean;
  inviteError: string | null;
  handleInvite: () => void;

  // Remove
  removingId: string | null;
  handleRemove: (collaboratorId: string) => void;

  // Copy link
  copied: boolean;
  handleCopyLink: () => void;
}

export function useShareDialog(projectId: string): UseShareDialogReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [owner, setOwner] = useState<OwnerInfo | null>(null);
  const [collaborators, setCollaborators] = useState<CollaboratorInfo[]>([]);
  const [isLoadingCollaborators, setIsLoadingCollaborators] = useState(false);

  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const [removingId, setRemovingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // ─── Fetch collaborators when dialog opens ───
  const fetchCollaborators = useCallback(async () => {
    setIsLoadingCollaborators(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`);
      if (res.ok) {
        const data: { owner: OwnerInfo; collaborators: CollaboratorInfo[] } =
          await res.json();
        setOwner(data.owner);
        setCollaborators(data.collaborators);
      }
    } catch {
      // Silently fail — list will be empty
    } finally {
      setIsLoadingCollaborators(false);
    }
  }, [projectId]);

  const open = useCallback(() => {
    setIsOpen(true);
    setInviteEmail("");
    setInviteError(null);
    setCopied(false);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setInviteEmail("");
    setInviteError(null);
  }, []);

  // Fetch when dialog opens
  useEffect(() => {
    if (isOpen) {
      void fetchCollaborators();
    }
  }, [isOpen, fetchCollaborators]);

  // ─── Invite ───
  const handleInvite = useCallback(async () => {
    const trimmed = inviteEmail.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setInviteError("Enter a valid email address");
      return;
    }
    setIsInviting(true);
    setInviteError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      if (res.status === 409) {
        setInviteError("This person is already a collaborator");
        setIsInviting(false);
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setInviteError(
          (body as { error?: string }).error ?? "Failed to invite"
        );
        setIsInviting(false);
        return;
      }

      const newCollab: CollaboratorInfo = await res.json();
      setCollaborators((prev) => [...prev, newCollab]);
      setInviteEmail("");
    } catch {
      setInviteError("Something went wrong");
    } finally {
      setIsInviting(false);
    }
  }, [inviteEmail, projectId]);

  // ─── Remove ───
  const handleRemove = useCallback(
    async (collaboratorId: string) => {
      setRemovingId(collaboratorId);

      try {
        const res = await fetch(
          `/api/projects/${projectId}/collaborators/${collaboratorId}`,
          { method: "DELETE" }
        );

        if (res.ok) {
          setCollaborators((prev) =>
            prev.filter((c) => c.id !== collaboratorId)
          );
        }
      } catch {
        // Silently fail
      } finally {
        setRemovingId(null);
      }
    },
    [projectId]
  );

  // ─── Copy Link ───
  const handleCopyLink = useCallback(() => {
    const url = `${window.location.origin}/editor/${projectId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [projectId]);

  return {
    isOpen,
    open,
    close,
    owner,
    collaborators,
    isLoadingCollaborators,
    inviteEmail,
    setInviteEmail,
    isInviting,
    inviteError,
    handleInvite,
    removingId,
    handleRemove,
    copied,
    handleCopyLink,
  };
}
