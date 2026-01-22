"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";

export type BookingItem = {
  id: number;
  scheduledAt: string;
  status: "EM_ANALISE" | "AGENDADO" | "CANCELADO";
  createdByRole: "ADMIN" | "CLIENT";
  user: { id: number; name: string; role: "ADMIN" | "CLIENT" };
  room: { id: number; name: string };
};

type ListResponse = { items: BookingItem[] };

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

export default function useAdminAgendamentosViewModel() {
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

  const onToggleOrder = useCallback(() => {
    setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  }, []);

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

  return {
    order,
    q,
    setQ,
    date,
    setDate,
    loading,
    actingId,
    error,
    viewItems,
    onToggleOrder,
    onConfirm,
    onCancel,
    formatBR,
    statusText,
    roleLabel,
    rowBgClass,
    statusPillClass
  };
}