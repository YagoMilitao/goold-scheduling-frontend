"use client";

import { useEffect } from "react";

export default function ConfirmLogoutModal({
  open,
  onClose,
  onConfirm
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl" onMouseDown={(e) => e.stopPropagation()}>
        <div className="border-b px-6 py-5">
          <h2 className="text-lg font-semibold">Sair do perfil</h2>
          <p className="mt-1 text-sm text-black/60">Tem certeza que deseja sair?</p>
        </div>

        <div className="flex gap-3 p-6">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border px-4 py-3 font-semibold">
            Cancelar
          </button>

          <button type="button" onClick={onConfirm} className="flex-1 rounded-xl bg-black px-4 py-3 font-semibold text-white">
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
