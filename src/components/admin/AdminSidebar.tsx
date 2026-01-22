"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuth, getUser } from "@/lib/auth";
import ConfirmLogoutModal from "../auth/ConfirmLougoutModal";

type NavItem = {
  href: string;
  label: string;
  iconSrc: string;
};

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const user = useMemo(() => getUser(), []);
  const adminName = user?.name ?? "Admin";
  const roleLabel = user?.role === "ADMIN" ? "Admin" : "Usuário";

  const items: NavItem[] = [
    { href: "/admin/agendamentos", label: "Agendamentos", iconSrc: "/icons/bookings_logo.svg" },
    { href: "/admin/clientes", label: "Clientes", iconSrc: "/icons/clients_logo.svg" },
    { href: "/admin/logs", label: "Logs", iconSrc: "/icons/logs_logo.svg" }
  ];

  const onLogout = () => {
    clearAuth();
    router.replace("/admin/login");
  };

  return (
    <>
      <aside
        className="flex w-70 flex-col self-stretch border-r min-h-full"
        style={{ backgroundColor: "#F6F4F1", borderColor: "#D7D7D7" }}
      >
        <div className="px-8 py-8">
          <Link href="/admin/agendamentos" className="inline-flex items-center gap-3">
            <img src="/icons/group_logo.svg" alt="Logo" className="h-8 w-auto" />
          </Link>
        </div>

        <nav className="flex-1 px-6">
          <div className="space-y-3">
            {items.map((it) => {
              const active = pathname === it.href || pathname.startsWith(`${it.href}/`);
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                    active ? "bg-black text-white" : "text-black/80 hover:bg-black/10"
                  }`}
                >
                  <img src={it.iconSrc} alt="" className={`h-5 w-5 ${active ? "brightness-0 invert" : ""}`} />
                  <span className="text-sm font-medium">{it.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t px-6 pb-6" style={{ borderColor: "#D7D7D7" }}>
          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            className="flex w-full items-center justify-between px-4 py-4"
            aria-label="Abrir menu do perfil"
            title="Abrir menu do perfil"
          >
            <div className="flex flex-col items-start leading-tight">
              <span className="text-sm font-semibold">{adminName}</span>
              <span className="text-xs text-black/60">{roleLabel}</span>
            </div>

            <img
              src="/icons/chevron-down.svg"
              alt=""
              className="h-4 w-4 opacity-70"
              style={{ marginRight: 19 }}
            />
          </button>
        </div>
      </aside>

      <ConfirmLogoutModal open={logoutOpen} onClose={() => setLogoutOpen(false)} onConfirm={onLogout} />
    </>
  );
}
