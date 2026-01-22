"use client";

export default function EmptyState({ title = "Nada por aqui ainda..." }: { title?: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 py-20">
      <div className="h-28 w-28  bg-#D5DAE5">
        <img
            src="/icons/nothing_here.svg"
            alt=""
            className="h-40 w-40"
          />
      </div>
      <p className="text-lg font-semibold text-black/80">{title}</p>
    </div>
  );
}
