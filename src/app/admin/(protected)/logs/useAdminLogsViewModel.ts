"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";

export type LogModule = "AGENDAMENTOS" | "MINHA_CONTA" | "LOGS";

export type ApiLogItem = {
  id: number;
  createdAt: string;
  activityType: string;
  module: LogModule;
  user: {
    id: number;
    name: string;
    role: "CLIENT";
  };
};

type ListResponse = { items: ApiLogItem[] };

const pad = (n: number) => String(n).padStart(2, "0");

const ymdFromISO = (iso: string) => {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  return `${yyyy}-${mm}-${dd}`;
};

export const moduleLabel: Record<LogModule, string> = {
  AGENDAMENTOS: "Agendamento",
  MINHA_CONTA: "Minha Conta",
  LOGS: "Logs"
};

export const moduleIconSrc: Record<LogModule, string> = {
  AGENDAMENTOS: "/icons/bookings_logo.svg",
  MINHA_CONTA: "/icons/user.svg",
  LOGS: "/icons/logs_logo.svg"
};

export default function useAdminLogsViewModel() {
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [q, setQ] = useState("");
  const [date, setDate] = useState("");

  const [items, setItems] = useState<ApiLogItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set("order", order);
      if (q.trim()) qs.set("q", q.trim());

      const res = await apiFetch<ListResponse>(`/admin/logs?${qs.toString()}`, { auth: true });
      setItems(res.items ?? []);
      setPage(1);
    } finally {
      setLoading(false);
    }
  }, [order, q]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [date]);

  const onToggleOrder = () => setOrder((p) => (p === "asc" ? "desc" : "asc"));

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();

    return items.filter((x) => {
      const client = x.user?.name?.toLowerCase() ?? "";
      const act = (x.activityType ?? "").toLowerCase();
      const mod = moduleLabel[x.module]?.toLowerCase() ?? "";

      const matchText = !term || client.includes(term) || act.includes(term) || mod.includes(term);
      const matchDate = !date || ymdFromISO(x.createdAt) === date;

      return matchText && matchDate;
    });
  }, [items, q, date]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filtered.length / pageSize)), [filtered.length]);

  const safePage = useMemo(() => Math.min(page, totalPages), [page, totalPages]);

  useEffect(() => {
    if (safePage !== page) setPage(safePage);
  }, [safePage, page]);

  const pagedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage]);

  const canPrev = safePage > 1;
  const canNext = safePage < totalPages;

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  const setQAndReset = (v: string) => {
    setQ(v);
    setPage(1);
  };

  const setDateAndReset = (v: string) => {
    setDate(v);
    setPage(1);
  };

  return {
    loading,
    order,
    q,
    date,
    items: pagedItems,
    filteredCount: filtered.length,
    onToggleOrder,
    setQ: setQAndReset,
    setDate: setDateAndReset,
    page: safePage,
    totalPages,
    canPrev,
    canNext,
    goPrev,
    goNext
  };
}