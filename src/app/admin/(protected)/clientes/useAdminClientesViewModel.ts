"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";

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

export type ClientRow = {
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

const isoDay = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
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

export default function useAdminClientesViewModel() {
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [q, setQ] = useState("");
  const [date, setDate] = useState("");

  const [items, setItems] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<ListResponse>(`/admin/clients?order=${order}`, { auth: true });
      setItems((res.items ?? []).map(toRow));
      setPage(1);
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
    const selectedDate = date.trim();

    return items.filter((c) => {
      const full = `${c.name} ${c.lastName ?? ""}`.trim().toLowerCase();
      const matchesName = !term || full.includes(term);
      const matchesDate = !selectedDate || isoDay(c.createdAt) === selectedDate;
      return matchesName && matchesDate;
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
    order,
    onToggleOrder,
    q,
    setQ: setQAndReset,
    date,
    setDate: setDateAndReset,
    loading,
    page: safePage,
    totalPages,
    canPrev,
    canNext,
    goPrev,
    goNext,
    items: pagedItems,
    onToggleBookingsPermission,
    onToggleLogsPermission,
    onToggleActive
  };
}