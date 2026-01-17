"use client";

export default function EmptyState({ title = "Nada por aqui ainda..." }: { title?: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 py-20">
      <div className="h-28 w-28 rounded-full border bg-white" />
      <p className="text-lg font-semibold text-black/80">{title}</p>
    </div>
  );
}
