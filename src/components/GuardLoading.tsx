"use client";

export default function GuardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-black border-t-transparent"
          aria-label="Carregando"
          role="status"
        />
        <p className="text-sm text-black/70">Carregando...</p>
      </div>
    </div>
  );
}
