"use client";

import { apiFetch } from "@/lib/api";
import { clearAuth, getUser } from "@/lib/auth";
import { clear } from "console";
import { usePathname, useRouter } from "next/navigation";


const Item = ({
  active,
  label,
  onClick
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left ${
      active ? "bg-black text-white" : "text-black/80 hover:bg-black/5"
    }`}
  >
    <span className="h-5 w-5 rounded bg-black/10" />
    <span className="font-medium">{label}</span>
  </button>
);

export default function ClientSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getUser();

  const go = (p: string) => router.push(p);

  const onLogout = async () => {
  try {
    await apiFetch("/auth/logout", { method: "POST", auth: true });
  } catch {

  } finally {
    clearAuth();
    router.replace("/");
  }
};

  return (
    <aside className="w-[280px] border-r bg-[#f5f1ed]">
      <div className="flex h-[84px] items-center px-8">
        <div className="h-10 w-10 rounded-full bg-black/10" />
      </div>

      <div className="px-6 pt-6 space-y-2">
        <Item active={pathname.includes("/agendamentos")} label="Agendamentos" onClick={() => go("/agendamentos")} />
        <Item active={pathname.includes("/logs")} label="Logs" onClick={() => go("/logs")} />
        <Item active={pathname.includes("/minha-conta")} label="Minha Conta" onClick={() => go("/minha-conta")} />
      </div>

      <div className="mt-auto px-6 pb-6 pt-10">
        <div className="rounded-2xl bg-white px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-medium">{user?.name ?? "Usuário"}</p>
              <p className="text-sm opacity-70">Cliente</p>
            </div>
            <button type="button" className="rounded-xl border px-3 py-2 text-sm" onClick={onLogout}>
              Sair
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
