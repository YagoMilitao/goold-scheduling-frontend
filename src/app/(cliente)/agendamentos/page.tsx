"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import EmptyState from "@/components/EmptyState";
import { apiFetch } from "@/lib/api";
import BookingsTable, { BookingItem } from "@/components/booking/BookingTable";
import NewBookingModal from "@/components/booking/NewBookingModal";

type ApiItem = {
  id: number;
  scheduledAt: string;
  status: "EM_ANALISE" | "AGENDADO" | "CANCELADO";
  createdByRole: "ADMIN" | "CLIENT";
  user: { id: number; name: string; role: "ADMIN" | "CLIENT" };
  room: { id: number; name: string };
};

type ListResponse = { items: ApiItem[] };

export default function AgendamentosPage() {
  const [items, setItems] = useState<ApiItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<ListResponse>("/bookings", { auth: true });
      setItems(res.items ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const viewItems = useMemo<BookingItem[]>(() => {
    const term = q.trim().toLowerCase();
    const filtered = term ? items.filter((x) => x.user.name.toLowerCase().includes(term)) : items;

    return filtered.map((x) => ({
      id: x.id,
      scheduledAt: x.scheduledAt,
      status: x.status,
      userName: x.user.name,
      userRoleLabel: x.createdByRole === "CLIENT" ? "Cliente" : "Admin",
      roomName: x.room.name
    }));
  }, [items, q]);


  const onCancel = useCallback(async (id: number) => {
    await apiFetch(`/bookings/${id}/cancel`, { method: "PATCH", auth: true });
    await load();
  }, [load]);

  const toolbar = (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-1 items-center gap-3">
        <div className="flex w-full max-w-md items-center gap-3 rounded-xl border px-4 py-3">
          <span className="h-4 w-4 rounded bg-black/10" />
          <input
            className="w-full outline-none"
            placeholder="Filtre por nome"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
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
          onClick={() => setModalOpen(true)}
        >
          Novo Agendamento
        </button>
        <NewBookingModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onCreated={load}
        />
    </div>
  );

  const footer = (
    <div className="flex items-center justify-center gap-3">
      <button className="rounded-lg border px-3 py-2" type="button">
        ‹
      </button>
      <span className="rounded-lg border px-4 py-2">1</span>
      <button className="rounded-lg border px-3 py-2" type="button">
        ›
      </button>
    </div>
  );

  return (
    <PageShell
      title="Agendamento"
      subtitle="Acompanhe todos os seus agendamentos de forma simples"
      toolbar={toolbar}
      footer={footer}
    >
      {loading ? (
        <div className="h-full w-full rounded-2xl border p-6">Carregando...</div>
      ) : viewItems.length === 0 ? (
        <EmptyState title="Nada por aqui ainda..." />
      ) : (
        <BookingsTable items={viewItems} onCancel={onCancel} />
      )}
    </PageShell>
  );
}
