"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import SchedulingSettingsModal from "@/components/SchedulingSettingsModal";

import { apiFetch } from "@/lib/api";
import DateFilter from "@/components/ui/DateFilterSelect";

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

const roleLabel: Record<BookingItem["createdByRole"], string> = {
  ADMIN: "Admin",
  CLIENT: "Cliente"
};

const rowBgClass: Record<BookingItem["status"], string> = {
  EM_ANALISE: "",
  AGENDADO: "bg-[#F2FFFD]",
  CANCELADO: "bg-[#FFF3F3]"
};

const statusPillClass: Record<BookingItem["status"], string> = {
  EM_ANALISE: "bg-white border-[#A4AAAD] text-[#A4AAAD]",
  AGENDADO: "bg-white border-[#10C3A9] text-[#10C3A9]",
  CANCELADO: "bg-white border-[#FF0000] text-[#FF0000]"
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

const isoDateFromScheduledAt = (iso: string) => {
  const d = new Date(iso);
  const dd = pad(d.getDate());
  const mm = pad(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
};

export default function AdminAgendamentosPage() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [q, setQ] = useState("");
  const [date, setDate] = useState("");

  const [items, setItems] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actingId, setActingId] = useState<number | null>(null);
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

  const onToggleOrder = () => setOrder((prev) => (prev === "asc" ? "desc" : "asc"));

  const onConfirm = useCallback(
    async (id: number) => {
      setActingId(id);
      setError(null);
      try {
        await apiFetch(`/admin/bookings/${id}/confirm`, { method: "PATCH", auth: true });
        await load();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao confirmar");
      } finally {
        setActingId(null);
      }
    },
    [load]
  );

  const onCancel = useCallback(
    async (id: number) => {
      setActingId(id);
      setError(null);
      try {
        await apiFetch(`/admin/bookings/${id}/cancel`, { method: "PATCH", auth: true });
        await load();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao cancelar");
      } finally {
        setActingId(null);
      }
    },
    [load]
  );

  const viewItems = useMemo(() => {
    const term = q.trim().toLowerCase();
    const selectedDate = date.trim();

    return items.filter((b) => {
      const name = b.user?.name?.toLowerCase() ?? "";
      const room = b.room?.name?.toLowerCase() ?? "";
      const status = statusText[b.status]?.toLowerCase() ?? "";

      const matchesText = !term || name.includes(term) || room.includes(term) || status.includes(term);
      const matchesDate = !selectedDate || isoDateFromScheduledAt(b.scheduledAt) === selectedDate;

      return matchesText && matchesDate;
    });
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

      <button
        className="rounded-xl bg-black px-8 py-3 font-semibold text-white"
        onClick={() => setSettingsOpen(true)}
        type="button"
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
      <span className="rounded-lg border px-4 py-2">Arrumar a paginacao</span>
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
        {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

        {loading ? (
          <div className="p-6">Carregando...</div>
        ) : viewItems.length === 0 ? (
          <div className="p-6">Nenhum agendamento encontrado</div>
        ) : (
          <div className="border-t" style={{ borderColor: "#D7D7D7" }}>
            <div className="px-8">
              <table className="w-full min-w-[980px] border-collapse">
                <thead>
                  <tr className="text-sm text-black/70" style={{ borderBottom: "1px solid #D7D7D7" }}>
                    <th className="py-5 pr-6 text-left font-medium">
                      <div className="flex items-center gap-2">
                        <span>Data agendamento</span>
                        <button
                          onClick={onToggleOrder}
                          type="button"
                          aria-label="Ordenar por data"
                          title={order === "asc" ? "Ordenar crescente" : "Ordenar decrescente"}
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
                    <th className="py-5 pr-6 text-left font-medium">Sala de agendamento</th>
                    <th className="py-5 pr-6 text-left font-medium">Status</th>
                    <th className="py-5 text-center font-medium">Ação</th>
                  </tr>
                </thead>

                <tbody>
                  {viewItems.map((b) => {
                    const showConfirm = b.status === "EM_ANALISE";
                    const showCancel = b.status !== "CANCELADO";
                    const disabled = actingId === b.id;

                    return (
                      <tr
                        key={b.id}
                        className={rowBgClass[b.status]}
                        style={{ borderBottom: "1px solid #D7D7D7" }}
                      >
                        <td className="py-6 pr-6 text-sm text-black/80">{formatBR(b.scheduledAt)}</td>

                        <td className="py-6 pr-6">
                          <div className="flex flex-col">
                            <span className="font-medium">{b.user.name}</span>
                            <span className="text-sm text-black/60">{roleLabel[b.createdByRole]}</span>
                          </div>
                        </td>

                        <td className="py-6 pr-6">
                          <span className="inline-flex rounded-full bg-black px-4 py-2 text-sm font-semibold text-white">
                            {b.room.name}
                          </span>
                        </td>

                        <td className="py-6 pr-6">
                          <span className={`inline-flex rounded-full border px-5 py-2 text-sm ${statusPillClass[b.status]}`}>
                            {statusText[b.status]}
                          </span>
                        </td>

                        <td className="py-6 text-center">
                          <div className="inline-flex gap-3">
                            {showCancel ? (
                              <button
                                type="button"
                                onClick={() => onCancel(b.id)}
                                disabled={disabled}
                                aria-label="Cancelar"
                                title="Cancelar"
                                className="disabled:opacity-50"
                              >
                                <img src="/icons/cancel.svg" alt="" className="h-10 w-10" />
                              </button>
                            ) : null}

                            {showConfirm ? (
                              <button
                                type="button"
                                onClick={() => onConfirm(b.id)}
                                disabled={disabled}
                                aria-label="Confirmar"
                                title="Confirmar"
                                className="disabled:opacity-50"
                              >
                                <img src="/icons/check.svg" alt="" className="h-10 w-10" />
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
          </div>
        )}
      </PageShell>

      <SchedulingSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSaved={() => {}}
      />
    </>
  );
}
