"use client";

import { useEffect, useRef } from "react";
import { ModalShell, MODAL_PANEL_MD } from "@/components/ModalShell";
import { ModalError } from "@/components/ModalError";
import { ModalCancelPrimaryButtons } from "@/components/ModalFooter";

export interface ProjectDeleteConfirmModalProps {
  projectName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
  error?: string | null;
}

export function ProjectDeleteConfirmModal({
  projectName,
  onConfirm,
  onCancel,
  loading,
  error,
}: ProjectDeleteConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    const focusTimer = setTimeout(() => cancelRef.current?.focus(), 0);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(focusTimer);
    };
  }, [onCancel]);

  return (
    <ModalShell
      titleId="delete-project-title"
      describedById="delete-project-description"
      onBackdropRequestClose={onCancel}
      zClassName="z-10"
      panelClassName={MODAL_PANEL_MD}
    >
      <h3 id="delete-project-title" className="text-lg font-semibold text-gray-900">
        Delete Project?
      </h3>
      <p id="delete-project-description" className="mt-2 text-sm text-gray-600">
        Are you sure you want to delete <strong>{projectName}</strong>? Assignments to employees will be
        removed. This cannot be undone.
      </p>
      {error ? (
        <ModalError variant="text">{error}</ModalError>
      ) : null}
      <ModalCancelPrimaryButtons
        cancelRef={cancelRef}
        onCancel={onCancel}
        onPrimary={onConfirm}
        primaryLabel="Delete"
        primaryPendingLabel="Deleting…"
        pending={loading}
        primaryVariant="danger"
      />
    </ModalShell>
  );
}
