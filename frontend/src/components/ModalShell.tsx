import type { ReactNode, MouseEvent } from "react";

export const MODAL_PANEL_LG =
  "max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl";
export const MODAL_PANEL_MD = "w-full max-w-md rounded-lg bg-white p-6 shadow-xl";

type ModalShellProps = {
  titleId: string;
  describedById?: string;
  /** Fired when the dimmed backdrop is clicked (not the panel). */
  onBackdropRequestClose: () => void;
  /** When true, backdrop clicks are ignored (e.g. while saving). */
  blockBackdropClose?: boolean;
  zClassName?: "z-10" | "z-20";
  panelClassName?: string;
  children: ReactNode;
};

export function ModalShell({
  titleId,
  describedById,
  onBackdropRequestClose,
  blockBackdropClose = false,
  zClassName = "z-20",
  panelClassName = MODAL_PANEL_LG,
  children,
}: ModalShellProps) {
  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (blockBackdropClose) return;
    if (e.target === e.currentTarget) onBackdropRequestClose();
  };

  return (
    <div
      className={`fixed inset-0 ${zClassName} flex items-center justify-center bg-black/40 p-4`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      {...(describedById ? { "aria-describedby": describedById } : {})}
      onClick={handleBackdropClick}
    >
      <div className={panelClassName} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
