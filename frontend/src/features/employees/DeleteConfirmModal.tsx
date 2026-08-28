"use client";

import { useEffect, useRef } from "react";
import { ModalShell, MODAL_PANEL_MD } from "@/components/ModalShell";
import { ModalError } from "@/components/ModalError";
import { ModalCancelPrimaryButtons } from "@/components/ModalFooter";

export interface DeleteConfirmModalProps {
  employeeName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
  error?: string | null;
}

export function DeleteConfirmModal({
  employeeName,
  onConfirm,
  onCancel,
  loading,
  error,
}: DeleteConfirmModalProps) {
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
      titleId="delete-title"
      describedById="delete-description"
      onBackdropRequestClose={onCancel}
      zClassName="z-10"
      panelClassName={MODAL_PANEL_MD}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
          <span className="text-lg font-bold text-red-600" aria-hidden>
            !
          </span>
        </div>
        <div className="flex-1">
          <h3 id="delete-title" className="text-lg font-semibold text-gray-900">
            Delete Employee?
          </h3>
          <p id="delete-description" className="mt-2 text-sm text-gray-600">
            Are you sure you want to delete <strong>{employeeName}</strong>? This action cannot be undone and
            will permanently remove all data associated with this employee.
          </p>
          {error ? (
            <ModalError variant="text">{error}</ModalError>
          ) : null}
        </div>
      </div>
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
