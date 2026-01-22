"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import EmptyState from "@/components/EmptyState";
import { apiFetch } from "@/lib/api";
import DateFilter from "@/components/ui/DateFilterSelect";

type LogModule = "AGENDAMENTOS" | "MINHA_CONTA" | "LOGS";

type ApiLogItem = {
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

const formatDateTimeBR = (iso: string) => {
  const d = new Date(iso);
  const dd = pad(d.getDate());
  const mm = pad(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${dd}/${mm}/${yyyy} às ${hh}:${min}`;
};

const ymdFromISO = (iso: string) => {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  return `${yyyy}-${mm}-${dd}`;
};

const moduleLabel: Record<LogModule, string> = {
  AGENDAMENTOS: "Agendamento",
  MINHA_CONTA: "Minha Conta",
  LOGS: "Logs"
};

const moduleIconSrc: Record<LogModule, string> = {
  AGENDAMENTOS: "/icons/bookings_logo.svg",
  MINHA_CONTA: "/icons/user.svg",
  LOGS: "/icons/logs_logo.svg"
};

export default function AdminLogsPage() {
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
    } finally {
      setLoading(false);
    }
  }, [order, q]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [q, date, order]);

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

  const pageCount = useMemo(() => Math.max(1, Math.ceil(filtered.length / pageSize)), [filtered.length]);
  const pageSafe = Math.min(page, pageCount);

  const viewItems = useMemo(() => {
    const start = (pageSafe - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageSafe]);

  const toolbar = (
    <div className="mt-5 flex items-center justify-between gap-4">
      <div className="flex flex-1 items-center gap-3">
        <div className="flex w-full max-w-md items-center gap-3 rounded-xl border bg-white px-4 py-3">
          <img src="/icons/lupa_logo.svg" alt="" className="h-5 w-5 opacity-70" />
          <input
            className="w-full outline-none"
            placeholder="Filtre por cliente, tipo de atividade ou Módulo"
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
    </div>
  );

  const footer = (
    <div className="flex items-center justify-center gap-3">
      <button
        className="rounded-lg border px-3 py-2 disabled:opacity-40"
        type="button"
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        disabled={pageSafe <= 1}
        aria-label="Página anterior"
        title="Página anterior"
      >
        ‹
      </button>

      <span className="rounded-lg border px-4 py-2">
        {pageSafe} / {pageCount}
      </span>

      <button
        className="rounded-lg border px-3 py-2 disabled:opacity-40"
        type="button"
        onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
        disabled={pageSafe >= pageCount}
        aria-label="Próxima página"
        title="Próxima página"
      >
        ›
      </button>
    </div>
  );

  const pillBase = "inline-flex items-center gap-2 rounded-full border bg-black/5 px-4 py-2 text-sm text-black/80";

  return (
    <PageShell title="Logs" subtitle="Acompanhe todos as Logs de clientes" toolbar={toolbar} footer={footer}>
      {loading ? (
        <div className="h-full w-full rounded-2xl border p-6">Carregando...</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="Nenhum log encontrado" />
      ) : (
        <div className="border-t" style={{ borderColor: "#D7D7D7" }}>
          <div style={{ paddingLeft: 30, paddingRight: 30 }}>
            <table className="w-full min-w-[980px] border-collapse">
              <thead>
                <tr className="text-sm text-black/70" style={{ borderBottom: "1px solid #D7D7D7" }}>
                  <th className="py-5 pr-6 text-left font-medium">Cliente</th>
                  <th className="py-5 pr-6 text-left font-medium">Tipo de atividade</th>
                  <th className="py-5 pr-6 text-left font-medium">Módulo</th>
                  <th className="py-5 text-left font-medium">
                    <div className="flex items-center gap-2">
                      <span>Data e horário</span>
                      <button
                        type="button"
                        onClick={onToggleOrder}
                        title={order === "asc" ? "Ordenar crescente" : "Ordenar decrescente"}
                        aria-label="Alternar ordem"
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
                </tr>
              </thead>

              <tbody>
                {viewItems.map((x) => (
                  <tr key={x.id} style={{ borderBottom: "1px solid #D7D7D7" }}>
                    <td className="py-6 pr-6">
                      <div className="flex flex-col leading-tight">
                        <span className="font-medium">{x.user.name}</span>
                        <span className="text-sm text-black/60">Cliente</span>
                      </div>
                    </td>

                    <td className="py-6 pr-6">
                      <span className={pillBase}>{x.activityType}</span>
                    </td>

                    <td className="py-6 pr-6">
                      <span className={pillBase}>
                        <img src={moduleIconSrc[x.module]} alt="" className="h-4 w-4" />
                        <span>{moduleLabel[x.module]}</span>
                      </span>
                    </td>

                    <td className="py-6">
                      <span className={pillBase}>{formatDateTimeBR(x.createdAt)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageShell>
  );
}
