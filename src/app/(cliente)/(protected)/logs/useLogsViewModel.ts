"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";

export type LogModule = "AGENDAMENTOS" | "MINHA_CONTA" | "LOGS";

export type LogItem = {
  id: number;
  activityType: string;
  module: LogModule;
  createdAt: string;
};

type LogsResponse = { items: LogItem[] };

const pad = (n: number) => String(n).padStart(2, "0");

const toISODateLocal = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export function useLogsViewModel() {
  const [items, setItems] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [date, setDate] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch<LogsResponse>("/logs", { auth: true });
      setItems(res.items ?? []);
      setPage(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();

    return items.filter((l) => {
      const matchesText = term
        ? l.activityType.toLowerCase().includes(term) ||
          l.module.toLowerCase().includes(term)
        : true;

      const matchesDate = date ? toISODateLocal(l.createdAt) === date : true;

      return matchesText && matchesDate;
    });
  }, [items, q, date]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const pagedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return {
    loading,
    error,
    q,
    setQ,
    date,
    setDate,
    page,
    totalPages,
    pagedItems,
    goPrev,
    goNext,
    reload: load
  };
}