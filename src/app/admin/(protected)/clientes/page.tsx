"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/PageShell";
import EmptyState from "@/components/EmptyState";
import { apiFetch } from "@/lib/api";

type ClientItem = {
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
  permissions: {
    canViewBookings: boolean;
    canViewLogs: boolean;
  };
  status: {
    visibleToClient: boolean;
  };
};

type ListResponse = {
  items: ClientItem[];
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

const formatAddressLine = (c: ClientItem) => {
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

export default function AdminClientesPage() {
  const router = useRouter();

  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [q, setQ] = useState("");
  const [items, setItems] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<ListResponse>(`/admin/clients?order=${order}`, { auth: true });
      setItems(res.items ?? []);
    } finally {
      setLoading(false);
    }
  }, [order]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;

    return items.filter((c) => {
      const full = `${c.name} ${c.lastName ?? ""}`.trim().toLowerCase();
      return full.includes(term);
    });
  }, [items, q]);

  const onToggleOrder = () => setOrder((p) => (p === "asc" ? "desc" : "asc"));

  const patchClient = useCallback(
    async (id: number, patch: Partial<ClientItem>) => {
      setItems((prev) => prev.map((x) => (x.id === id ? ({ ...x, ...patch } as ClientItem) : x)));

      try {
        await apiFetch(`/admin/clients/${id}`, {
          method: "PATCH",
          auth: true,
          body: patch
        });
      } catch {
        await load();
      }
    },
    [load]
  );

  const onToggleLogsPermission = useCallback(
    async (id: number) => {
      const current = items.find((x) => x.id === id);
      if (!current) return;

      const next = !current.permissions.canViewLogs;

      await patchClient(id, {
        permissions: {
          ...current.permissions,
          canViewLogs: next
        }
      });
    },
    [items, patchClient]
  );

  const onToggleBookingsPermission = useCallback(
    async (id: number) => {
      const current = items.find((x) => x.id === id);
      if (!current) return;

      const next = !current.permissions.canViewBookings;

      await patchClient(id, {
        permissions: {
          ...current.permissions,
          canViewBookings: next
        }
      });
    },
    [items, patchClient]
  );

  const onToggleVisible = useCallback(
    async (id: number) => {
      const current = items.find((x) => x.id === id);
      if (!current) return;

      const next = !current.status.visibleToClient;

      await patchClient(id, {
        status: {
          ...current.status,
          visibleToClient: next
        }
      });
    },
    [items, patchClient]
  );

  const toolbar = (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-1 items-center gap-3">
        <div className="flex w-full max-w-md items-center gap-3 rounded-xl border px-4 py-3">
          <span className="h-4 w-4 rounded bg-black/10" />
          <input className="w-full outline-none" placeholder="Filtre por nome" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>

        <div className="flex w-52 items-center justify-between rounded-xl border px-4 py-3 text-black/60">
          <span>Selecione</span>
          <span className="h-4 w-4 rounded bg-black/10" />
        </div>
      </div>

      <button
        className="rounded-xl border px-6 py-3 font-semibold"
        type="button"
        onClick={() => router.push("/admin/agendamentos")}
        title="Voltar para agendamentos"
        aria-label="Voltar para agendamentos"
      >
        Voltar
      </button>
    </div>
  );

  const footer = (
    <div className="flex items-center justify-center gap-3">
      <button className="rounded-lg border px-3 py-2" type="button" title="Página anterior" aria-label="Página anterior">
        ‹
      </button>
      <span className="rounded-lg border px-4 py-2">1</span>
      <button className="rounded-lg border px-3 py-2" type="button" title="Próxima página" aria-label="Próxima página">
        ›
      </button>
    </div>
  );

  return (
    <PageShell title="Clientes" subtitle="Overview de todos os clientes" toolbar={toolbar} footer={footer}>
      {loading ? (
        <div className="h-full w-full rounded-2xl border p-6">Carregando...</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="Nenhum cliente encontrado" />
      ) : (
        <div className="w-full overflow-x-auto rounded-2xl border">
          <table className="min-w-[1100px] w-full">
            <thead>
              <tr className="border-b text-sm text-black/70">
                <th className="text-left p-4">
                  <div className="flex items-center gap-3">
                    <span>Data de cadastro</span>
                    <button className="rounded-lg border px-3 py-1 text-sm" onClick={onToggleOrder} type="button" title="Alternar ordem de classificação" aria-label="Alternar ordem de classificação">
                      {order === "asc" ? "Crescente" : "Decrescente"}
                    </button>
                  </div>
                </th>
                <th className="text-left p-4">Nome</th>
                <th className="text-left p-4">Endereço</th>
                <th className="text-left p-4">Permissões</th>
                <th className="text-left p-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((c) => {
                const fullName = `${c.name}${c.lastName ? ` ${c.lastName}` : ""}`;
                const addr = formatAddressLine(c);

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
                  <tr key={c.id} className="border-b last:border-b-0">
                    <td className="p-4">{formatDateTimeBR(c.createdAt)}</td>

                    <td className="p-4">
                      <div className="flex flex-col leading-tight">
                        <span className="font-medium">{fullName}</span>
                        <span className="text-sm text-black/60">Cliente</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="text-sm text-black/80">{addr}</span>
                    </td>

                    <td className="p-4">
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

                    <td className="p-4">
                      <button type="button" onClick={() => onToggleVisible(c.id)} className={`${toggleBase} ${c.status.visibleToClient ? toggleOn : toggleOff}`} title={c.status.visibleToClient ? "Ocultar cliente" : "Mostrar cliente"} aria-label={c.status.visibleToClient ? "Ocultar cliente" : "Mostrar cliente"}>
                        <span className={`${dotBase} ${c.status.visibleToClient ? dotOn : dotOff}`} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
