"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import EmptyState from "@/components/EmptyState";
import { apiFetch } from "@/lib/api";
import BookingsTable, { BookingItem } from "@/components/booking/BookingTable";
import NewBookingModal from "@/components/booking/NewBookingModal";
import DateFilter from "@/components/ui/DateFilterSelect";

type ApiItem = {
  id: number;
  scheduledAt: string;
  status: "EM_ANALISE" | "AGENDADO" | "CANCELADO";
  createdByRole: "ADMIN" | "CLIENT";
  user: { id: number; name: string; role: "ADMIN" | "CLIENT" };
  room: { id: number; name: string };
};

type ListResponse = { items: ApiItem[] };

const pad = (n: number) => String(n).padStart(2, "0");

const toISODateLocal = (iso: string) => {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  return `${yyyy}-${mm}-${dd}`;
};

export default function AgendamentosPage() {
  const [items, setItems] = useState<ApiItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [q, setQ] = useState("");
  const [date, setDate] = useState<string>("");

  const [modalOpen, setModalOpen] = useState(false);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<ListResponse>("/bookings", { auth: true });
      setItems(res.items ?? []);
      setPage(1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const viewItems = useMemo<BookingItem[]>(() => {
    const term = q.trim().toLowerCase();

    const filtered = items.filter((x) => {
      const matchesName = term ? x.user.name.toLowerCase().includes(term) : true;
      const matchesDate = date ? toISODateLocal(x.scheduledAt) === date : true;
      return matchesName && matchesDate;
    });

    return filtered.map((x) => ({
      id: x.id,
      scheduledAt: x.scheduledAt,
      status: x.status,
      userName: x.user.name,
      userRoleLabel: x.createdByRole === "CLIENT" ? "Cliente" : "Admin",
      roomName: x.room.name
    }));
  }, [items, q, date]);

  const totalPages = useMemo(() => {
    const t = Math.ceil(viewItems.length / pageSize);
    return t <= 0 ? 1 : t;
  }, [viewItems.length]);

  const pagedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return viewItems.slice(start, start + pageSize);
  }, [viewItems, page]);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  const onCancel = useCallback(
    async (id: number) => {
      await apiFetch(`/bookings/${id}/cancel`, { method: "PATCH", auth: true });
      await load();
    },
    [load]
  );

  const toolbar = (
    <div className="mt-5 flex items-center justify-between gap-4">
      <div className="flex flex-1 items-center gap-3">
        <div className="flex w-full max-w-md items-center gap-3 rounded-xl border bg-white px-4 py-3">
          <img src="/icons/lupa_logo.svg" alt="" className="h-5 w-5 opacity-70" />
          <input
            className="w-full outline-none"
            placeholder="Filtre por nome"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <DateFilter
          value={date}
          onChange={(next) => {
            setDate(next);
            setPage(1);
          }}
          placeholder="Selecione"
          iconSrc="/icons/bookings_logo.svg"
          className="w-52"
        />
      </div>

      <button
        className="rounded-xl bg-black px-8 py-3 font-semibold text-white"
        type="button"
        onClick={() => setModalOpen(true)}
      >
        Novo Agendamento
      </button>

      <NewBookingModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={load} />
    </div>
  );

  const footer = (
    <div className="flex items-center justify-center gap-3">
      <button
        className="rounded-lg bg-black px-3 py-2 text-white disabled:opacity-40"
        type="button"
        onClick={goPrev}
        disabled={!canPrev}
        aria-label="Página anterior"
      >
        ‹
      </button>

      <span className="rounded-lg border px-4 py-2">
        {page} / {totalPages}
      </span>

      <button
        className="rounded-lg bg-black px-3 py-2 text-white disabled:opacity-40"
        type="button"
        onClick={goNext}
        disabled={!canNext}
        aria-label="Próxima página"
      >
        ›
      </button>
    </div>
  );

  return (
    <PageShell title="Agendamento" subtitle="Acompanhe todos os seus agendamentos de forma simples" toolbar={toolbar} footer={footer}>
      {loading ? (
        <div className="h-full w-full rounded-2xl border p-6">Carregando...</div>
      ) : pagedItems.length === 0 ? (
        <EmptyState title="Nada por aqui ainda..." />
      ) : (
        <BookingsTable items={pagedItems} onCancel={onCancel} />
      )}
    </PageShell>
  );
}
