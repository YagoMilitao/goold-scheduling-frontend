"use client";

import { useEffect } from "react";

type ModalSize = "sm" | "md" | "lg";

const sizeClass: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg"
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnOverlay = true,
  closeOnEsc = true
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  closeOnOverlay?: boolean;
  closeOnEsc?: boolean;
}) {
  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !closeOnEsc) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closeOnEsc, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={() => {
        if (closeOnOverlay) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full ${sizeClass[size]} overflow-hidden rounded-2xl bg-white shadow-xl`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-6 py-5">
          <h2 className="text-lg font-semibold">{title ?? ""}</h2>
          <button type="button" onClick={onClose} className="text-xl leading-none" aria-label="Fechar modal">
            ✕
          </button>
        </div>

        <div className="p-6">{children}</div>

        {footer ? <div className="border-t bg-white p-6">{footer}</div> : null}
      </div>
    </div>
  );
}
