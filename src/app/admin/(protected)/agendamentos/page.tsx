"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import SchedulingSettingsModal from "@/components/SchedulingSettingsModal";
import { apiFetch } from "@/lib/api";

type BookingItem = {
  id: number;
  scheduledAt: string;
  status: "EM_ANALISE" | "AGENDADO" | "CANCELADO";
  createdByRole: "ADMIN" | "CLIENT";
  user: { id: number; name: string; role: "ADMIN" | "CLIENT" };
  room: { id: number; name: string };
};

type ListResponse = { items: BookingItem[] };

const statusText: Record<BookingItem["status"], string> = {
  EM_ANALISE: "Em análise",
  AGENDADO: "Agendado",
  CANCELADO: "Cancelado"
};

const statusPillClass: Record<BookingItem["status"], string> = {
  EM_ANALISE: "border-gray-300 text-gray-600 bg-white",
  AGENDADO: "border-emerald-300 text-emerald-600 bg-emerald-50",
  CANCELADO: "border-red-300 text-red-600 bg-red-50"
};

const rowClass: Record<BookingItem["status"], string> = {
  EM_ANALISE: "",
  AGENDADO: "bg-emerald-50/40",
  CANCELADO: "bg-red-50/40"
};

const roleLabel: Record<BookingItem["createdByRole"], string> = {
  ADMIN: "Admin",
  CLIENT: "Cliente"
};

const pad = (n: number) => String(n).padStart(2, "0");

const formatBR = (iso: string) => {
  const d = new Date(iso);
  const dd = pad(d.getDate());
  const mm = pad(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${dd}/${mm}/${yyyy} às ${hh}:${min}`;
};

function SortIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 7l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 17l-4 4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 3v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function AdminAgendamentosPage() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [q, setQ] = useState("");

  const [items, setItems] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const qs = new URLSearchParams();
      qs.set("order", order);

      const res = await apiFetch<ListResponse>(`/admin/bookings?${qs.toString()}`, { auth: true });
      setItems(res.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar agendamentos");
    } finally {
      setLoading(false);
    }
  }, [order]);

  useEffect(() => {
    load();
  }, [load]);

  const onToggleOrder = () => setOrder((p) => (p === "asc" ? "desc" : "asc"));

  const onConfirm = useCallback(
    async (id: number) => {
      try {
        await apiFetch(`/admin/bookings/${id}/confirm`, { method: "PATCH", auth: true });
        await load();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao confirmar");
      }
    },
    [load]
  );

  const onCancel = useCallback(
    async (id: number) => {
      try {
        await apiFetch(`/admin/bookings/${id}/cancel`, { method: "PATCH", auth: true });
        await load();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao cancelar");
      }
    },
    [load]
  );

  const viewItems = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;

    return items.filter((b) => {
      const name = b.user?.name?.toLowerCase() ?? "";
      const room = b.room?.name?.toLowerCase() ?? "";
      const status = statusText[b.status]?.toLowerCase() ?? "";
      return name.includes(term) || room.includes(term) || status.includes(term);
    });
  }, [items, q]);

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

        <div className="flex w-40 items-center justify-between rounded-xl border px-4 py-3 text-black/60">
          <span></span>
          <span className="h-4 w-4 rounded bg-black/10" />
        </div>
      </div>

      <button
        className="rounded-xl bg-black px-8 py-3 font-semibold text-white"
        type="button"
        onClick={() => setSettingsOpen(true)}
      >
        Ajustes de agendamento
      </button>
    </div>
  );

  const footer = (
    <div className="flex items-center justify-center gap-3">
      <button className="rounded-lg border px-3 py-2" type="button" aria-label="Página anterior">
        ‹
      </button>
      <span className="rounded-lg border px-4 py-2">1</span>
      <button className="rounded-lg border px-3 py-2" type="button" aria-label="Próxima página">
        ›
      </button>
    </div>
  );

  return (
    <>
      <PageShell
        title="Agendamentos"
        subtitle="Acompanhe todos os agendamentos de clientes forma simples"
        toolbar={toolbar}
        footer={footer}
      >
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        {loading ? (
          <div className="h-full w-full rounded-2xl border p-6">Carregando...</div>
        ) : viewItems.length === 0 ? (
          <div className="h-full w-full rounded-2xl border p-6">Nenhum agendamento encontrado</div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="min-w-[980px] w-full">
              <thead>
                <tr className="border-b text-sm text-black/70">
                  <th className="text-left py-4 pr-4">
                    <div className="flex items-center gap-2">
                      <span>Data agendamento</span>
                      <button
                        type="button"
                        onClick={onToggleOrder}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border text-black/70 hover:bg-black/5"
                        aria-label="Ordenar"
                        title={order === "asc" ? "Ordenar crescente" : "Ordenar decrescente"}
                      >
                        <SortIcon className={`h-4 w-4 transition-transform ${order === "asc" ? "rotate-0" : "rotate-180"}`} />
                      </button>
                    </div>
                  </th>

                  <th className="text-left py-4 pr-4">Nome</th>
                  <th className="text-left py-4 pr-4">Sala de agendamento</th>
                  <th className="text-left py-4 pr-4">Status</th>
                  <th className="text-right py-4 pl-4">Ação</th>
                </tr>
              </thead>

              <tbody>
                {viewItems.map((b) => {
                  const showConfirm = b.status === "EM_ANALISE";
                  const showCancel = b.status !== "CANCELADO";

                  return (
                    <tr key={b.id} className={`border-b ${rowClass[b.status]}`}>
                      <td className="py-5 pr-4">{formatBR(b.scheduledAt)}</td>

                      <td className="py-5 pr-4">
                        <div className="flex flex-col leading-tight">
                          <span className="font-medium">{b.user.name}</span>
                          <span className="text-sm text-black/60">{roleLabel[b.createdByRole]}</span>
                        </div>
                      </td>

                      <td className="py-5 pr-4">
                        <span className="inline-flex rounded-full bg-black px-4 py-2 text-sm font-semibold text-white">
                          {b.room.name}
                        </span>
                      </td>

                      <td className="py-5 pr-4">
                        <span className={`inline-flex rounded-full border px-4 py-2 text-sm ${statusPillClass[b.status]}`}>
                          {statusText[b.status]}
                        </span>
                      </td>

                      <td className="py-5 pl-4 text-right">
                        <div className="inline-flex items-center gap-3">
                          {showCancel ? (
                            <button
                              type="button"
                              onClick={() => onCancel(b.id)}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black text-white"
                              aria-label="Cancelar"
                              title="Cancelar"
                            >
                              ✕
                            </button>
                          ) : null}

                          {showConfirm ? (
                            <button
                              type="button"
                              onClick={() => onConfirm(b.id)}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black text-white"
                              aria-label="Confirmar"
                              title="Confirmar"
                            >
                              ✓
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </PageShell>

      <SchedulingSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} onSaved={() => {}} />
    </>
  );
}
