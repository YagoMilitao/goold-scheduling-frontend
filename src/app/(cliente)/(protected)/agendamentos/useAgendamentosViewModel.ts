"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { BookingItem } from "@/components/booking/BookingTable";

type ApiItem = {
  id: number;
  scheduledAt: string;
  status: "EM_ANALISE" | "AGENDADO" | "CANCELADO";
  createdByRole: "ADMIN" | "CLIENT";
  user: { id: number; name: string };
  room: { id: number; name: string };
};

type ListResponse = { items: ApiItem[] };

const pad = (n: number) => String(n).padStart(2, "0");

const toISODateLocal = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export function useAgendamentosViewModel() {
  const [items, setItems] = useState<ApiItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [q, setQ] = useState("");
  const [date, setDate] = useState("");

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

  const filteredItems = useMemo(() => {
    const term = q.trim().toLowerCase();

    return items.filter((x) => {
      const byName = term ? x.user.name.toLowerCase().includes(term) : true;
      const byDate = date ? toISODateLocal(x.scheduledAt) === date : true;
      return byName && byDate;
    });
  }, [items, q, date]);

  const viewItems: BookingItem[] = useMemo(
    () =>
      filteredItems.map((x) => ({
        id: x.id,
        scheduledAt: x.scheduledAt,
        status: x.status,
        userName: x.user.name,
        userRoleLabel: x.createdByRole === "CLIENT" ? "Cliente" : "Admin",
        roomName: x.room.name
      })),
    [filteredItems]
  );

  const totalPages = Math.max(1, Math.ceil(viewItems.length / pageSize));

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

  return {
    loading,

    q,
    setQ,

    date,
    setDate,

    modalOpen,
    openModal: () => setModalOpen(true),
    closeModal: () => setModalOpen(false),

    reload: load,

    page,
    totalPages,
    canPrev,
    canNext,
    goPrev,
    goNext,

    pagedItems,
    onCancel
  };
}