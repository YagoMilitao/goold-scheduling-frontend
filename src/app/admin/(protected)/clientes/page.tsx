"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import EmptyState from "@/components/EmptyState";
import { apiFetch } from "@/lib/api";
import DateFilter from "@/components/ui/DateFilterSelect";


type ApiClientItem = {
  id: number;
  createdAt: string;
  name: string;
  lastName: string | null;
  role: "CLIENT";
  address: string | null;
  number: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  isActive: boolean;
  canViewBookings: boolean;
  canViewLogs: boolean;
};

type ListResponse = { items: ApiClientItem[] };

type ClientRow = {
  id: number;
  createdAt: string;
  name: string;
  lastName: string | null;
  address: string | null;
  number: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  permissions: {
    canViewBookings: boolean;
    canViewLogs: boolean;
  };
  status: {
    isActive: boolean;
  };
};

const pad = (n: number) => String(n).padStart(2, "0");

const formatDateTimeBR = (iso: string) => {
  const d = new Date(iso);
  const dd = pad(d.getDate());
  const mm = pad(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${dd}/${mm}/${yyyy} às ${hh}:${min}`;
};

const abbreviateStreet = (street: string) => {
  const s = street.trim();

  const map: Array<[RegExp, string]> = [
    [/^rua\s+/i, "R. "],
    [/^avenida\s+/i, "Av. "],
    [/^travessa\s+/i, "Tv. "],
    [/^alameda\s+/i, "Al. "],
    [/^estrada\s+/i, "Est. "],
    [/^rodovia\s+/i, "Rod. "],
    [/^praça\s+/i, "Pç. "],
    [/^largo\s+/i, "Lg. "]
  ];

  for (const [re, abbr] of map) {
    if (re.test(s)) return s.replace(re, abbr);
  }

  return s;
};

const formatAddressLine = (c: ClientRow) => {
  const street = c.address ? abbreviateStreet(c.address) : "";
  const num = c.number?.trim() ? `n°${c.number.trim()}` : "";
  const bairro = c.neighborhood?.trim() ? c.neighborhood.trim() : "";
  const cidade = c.city?.trim() ? c.city.trim() : "";
  const uf = c.state?.trim() ? c.state.trim().toUpperCase() : "";

  const first = [street, num].filter(Boolean).join(" ");
  const second = [bairro, cidade].filter(Boolean).join(", ");
  const third = uf ? `- ${uf}` : "";

  const line = [first, second ? `${second} ${third}`.trim() : ""].filter(Boolean).join(", ");
  return line || "-";
};

const toRow = (x: ApiClientItem): ClientRow => ({
  id: x.id,
  createdAt: x.createdAt,
  name: x.name,
  lastName: x.lastName,
  address: x.address,
  number: x.number,
  neighborhood: x.neighborhood,
  city: x.city,
  state: x.state,
  permissions: {
    canViewBookings: !!x.canViewBookings,
    canViewLogs: !!x.canViewLogs
  },
  status: {
    isActive: !!x.isActive
  }
});

const isoDay = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export default function AdminClientesPage() {
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [q, setQ] = useState("");
  const [date, setDate] = useState("");
  const [items, setItems] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<ListResponse>(`/admin/clients?order=${order}`, { auth: true });
      setItems((res.items ?? []).map(toRow));
    } finally {
      setLoading(false);
    }
  }, [order]);

  useEffect(() => {
    load();
  }, [load]);

  const onToggleOrder = () => setOrder((p) => (p === "asc" ? "desc" : "asc"));

  const optimisticUpdate = useCallback((id: number, patch: Partial<ClientRow>) => {
    setItems((prev) => prev.map((x) => (x.id === id ? ({ ...x, ...patch } as ClientRow) : x)));
  }, []);

  const onToggleBookingsPermission = useCallback(
    async (id: number) => {
      const current = items.find((x) => x.id === id);
      if (!current) return;

      const next = !current.permissions.canViewBookings;

      optimisticUpdate(id, {
        permissions: { ...current.permissions, canViewBookings: next }
      });

      try {
        await apiFetch(`/admin/clients/${id}/permissions`, {
          method: "PATCH",
          auth: true,
          body: { permission: "canViewBookings" }
        });
      } catch {
        await load();
      }
    },
    [items, optimisticUpdate, load]
  );

  const onToggleLogsPermission = useCallback(
    async (id: number) => {
      const current = items.find((x) => x.id === id);
      if (!current) return;

      const next = !current.permissions.canViewLogs;

      optimisticUpdate(id, {
        permissions: { ...current.permissions, canViewLogs: next }
      });

      try {
        await apiFetch(`/admin/clients/${id}/permissions`, {
          method: "PATCH",
          auth: true,
          body: { permission: "canViewLogs" }
        });
      } catch {
        await load();
      }
    },
    [items, optimisticUpdate, load]
  );

  const onToggleActive = useCallback(
    async (id: number) => {
      const current = items.find((x) => x.id === id);
      if (!current) return;

      const next = !current.status.isActive;

      optimisticUpdate(id, {
        status: { ...current.status, isActive: next }
      });

      try {
        await apiFetch(`/admin/clients/${id}/status`, {
          method: "PATCH",
          auth: true
        });
      } catch {
        await load();
      }
    },
    [items, optimisticUpdate, load]
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const byName = (c: ClientRow) => {
      if (!term) return true;
      const full = `${c.name} ${c.lastName ?? ""}`.trim().toLowerCase();
      return full.includes(term);
    };

    const byDate = (c: ClientRow) => {
      if (!date) return true;
      return isoDay(c.createdAt) === date;
    };

    return items.filter((c) => byName(c) && byDate(c));
  }, [items, q, date]);

  const toolbar = (
    <div className="mt-5 flex items-center justify-between gap-4">
      <div className="flex flex-1 items-center gap-3">
        <div className="flex w-full max-w-md items-center gap-3 rounded-xl border bg-white px-4 py-3">
          <img src="/icons/lupa_logo.svg" alt="" className="h-5 w-5 opacity-70" />
          <input
            className="w-full outline-none"
            placeholder="Filtre por nome"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <DateFilter
          value={date}
          onChange={setDate}
          placeholder="Selecione"
          iconSrc="/icons/bookings_logo.svg"
        />
      </div>
    </div>
  );

  const footer = (
    <div className="flex items-center justify-center gap-3">
      <button className="rounded-lg border px-3 py-2" type="button" title="Página anterior" aria-label="Página anterior">
        ‹
      </button>
      <span className="rounded-lg border px-4 py-2">Arrumar a paginação</span>
      <button className="rounded-lg border px-3 py-2" type="button" title="Próxima página" aria-label="Próxima página">
        ›
      </button>
    </div>
  );

  const pillBase = "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium border";
  const pillOn = "bg-black text-white border-black";
  const pillOff = "bg-white text-black border-black/20";

  const toggleBase = "relative inline-flex h-6 w-12 items-center rounded-full transition-colors";
  const toggleOn = "bg-black";
  const toggleOff = "bg-black/30";
  const dotBase = "inline-block h-5 w-5 transform rounded-full bg-white transition-transform";
  const dotOn = "translate-x-6";
  const dotOff = "translate-x-1";

  return (
    <PageShell title="Clientes" subtitle="Overview de todos os clientes" toolbar={toolbar} footer={footer}>
      {loading ? (
        <div className="p-6">Carregando...</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="Nenhum cliente encontrado" />
      ) : (
        <div className="border-t" style={{ borderColor: "#D7D7D7" }}>
          <div className="px-[30px]">
            <table className="w-full min-w-[1100px] border-collapse">
              <thead>
                <tr className="text-sm text-black/70" style={{ borderBottom: "1px solid #D7D7D7" }}>
                  <th className="py-5 pr-6 text-left font-medium">
                    <div className="flex items-center gap-2">
                      <span>Data de cadastro</span>
                      <button
                        type="button"
                        onClick={onToggleOrder}
                        title={order === "asc" ? "Ordenar crescente" : "Ordenar decrescente"}
                        aria-label="Alternar ordem"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-black/5"
                      >
                        <img
                          src="/icons/ArrowsDownUpIcon.svg"
                          alt=""
                          className={`h-4 w-4 transition-transform ${order === "asc" ? "rotate-0" : "rotate-180"}`}
                        />
                      </button>
                    </div>
                  </th>

                  <th className="py-5 pr-6 text-left font-medium">Nome</th>
                  <th className="py-5 pr-6 text-left font-medium">Endereço</th>
                  <th className="py-5 pr-6 text-left font-medium">Permissões</th>
                  <th className="py-5 text-left font-medium">Status</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((c) => {
                  const fullName = `${c.name}${c.lastName ? ` ${c.lastName}` : ""}`;
                  const addr = formatAddressLine(c);

                  return (
                    <tr key={c.id} style={{ borderBottom: "1px solid #D7D7D7" }}>
                      <td className="py-6 pr-6 text-sm">{formatDateTimeBR(c.createdAt)}</td>

                      <td className="py-6 pr-6">
                        <div className="flex flex-col leading-tight">
                          <span className="font-medium">{fullName}</span>
                          <span className="text-sm text-black/60">Cliente</span>
                        </div>
                      </td>

                      <td className="py-6 pr-6">
                        <span className="text-sm text-black/80">{addr}</span>
                      </td>

                      <td className="py-6 pr-6">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => onToggleBookingsPermission(c.id)}
                            className={`${pillBase} ${c.permissions.canViewBookings ? pillOn : pillOff}`}
                          >
                            Agendamentos
                          </button>

                          <button
                            type="button"
                            onClick={() => onToggleLogsPermission(c.id)}
                            className={`${pillBase} ${c.permissions.canViewLogs ? pillOn : pillOff}`}
                          >
                            Logs
                          </button>
                        </div>
                      </td>

                      <td className="py-6">
                        <button
                          type="button"
                          onClick={() => onToggleActive(c.id)}
                          className={`${toggleBase} ${c.status.isActive ? toggleOn : toggleOff}`}
                          title={c.status.isActive ? "Desativar cliente" : "Ativar cliente"}
                          aria-label={c.status.isActive ? "Desativar cliente" : "Ativar cliente"}
                        >
                          <span className={`${dotBase} ${c.status.isActive ? dotOn : dotOff}`} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageShell>
  );
}
