"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
};

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 3v3M17 3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M8 13h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 17h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M4 21a8 8 0 0 1 16 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LogsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 3h8l4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M15 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 13h8M8 17h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const navItems: NavItem[] = [
  { label: "Agendamentos", href: "/admin/agendamentos", Icon: CalendarIcon },
  { label: "Clientes", href: "/admin/clientes", Icon: UsersIcon },
  { label: "Logs", href: "/admin/logs", Icon: LogsIcon }
];

const isActivePath = (pathname: string, href: string) => {
  if (pathname === href) return true;

  return pathname.startsWith(href + "/");
};

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-70 shrink-0 border-r bg-white">
      <div className="p-6">
        <div className="h-10 w-10 rounded-full bg-black/10" />
      </div>

      <nav className="px-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={[
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                    active ? "bg-black text-white" : "text-black/70 hover:bg-black/5"
                  ].join(" ")}
                >
                  <item.Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto p-6">
        <div className="rounded-2xl border p-4">
          <div className="text-sm font-semibold">Admin</div>
          <div className="text-xs text-black/60">Painel</div>
        </div>
      </div>
    </aside>
  );
}
