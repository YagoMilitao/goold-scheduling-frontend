"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import EmptyState from "@/components/EmptyState";
import DateFilter from "@/components/ui/DateFilterSelect";
import { apiFetch } from "@/lib/api";

type LogModule = "AGENDAMENTOS" | "MINHA_CONTA" | "LOGS";

type LogItem = {
  id: number;
  activityType: string;
  module: LogModule;
  createdAt: string;
};

type LogsResponse = { items: LogItem[] };

const pad = (n: number) => String(n).padStart(2, "0");

const formatBR = (iso: string) => {
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} às ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

const toISODateLocal = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const moduleMeta: Record<LogModule, { label: string; icon: string }> = {
  AGENDAMENTOS: { label: "Agendamento", icon: "/icons/bookings_logo.svg" },
  MINHA_CONTA: { label: "Minha Conta", icon: "/icons/user.svg" },
  LOGS: { label: "Logs", icon: "/icons/logs_logo.svg" }
};

export default function LogsPage() {
  const [items, setItems] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [date, setDate] = useState<string>("");

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
          moduleMeta[l.module].label.toLowerCase().includes(term)
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

  const toolbar = (
    <div className="mt-5 flex items-center justify-between gap-4">
      <div className="flex flex-1 items-center gap-3">
        <div className="flex w-full max-w-md items-center gap-3 rounded-xl border bg-white px-4 py-3">
          <img src="/icons/lupa_logo.svg" alt="" className="h-5 w-5 opacity-70" />
          <input
            className="w-full outline-none"
            placeholder="Filtre por tipo de atividade ou módulo"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <DateFilter
          value={date}
          onChange={(v) => {
            setDate(v);
            setPage(1);
          }}
          placeholder="Selecione"
          iconSrc="/icons/bookings_logo.svg"
          className="w-52"
        />
      </div>
    </div>
  );

  const footer = (
    <div className="flex items-center justify-center gap-3">
      <button
        className="rounded-lg bg-black px-3 py-2 text-white disabled:opacity-40"
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        disabled={page === 1}
        type="button"
      >
        ‹
      </button>

      <span className="rounded-lg border px-4 py-2">
        {page} / {totalPages}
      </span>

      <button
        className="rounded-lg bg-black px-3 py-2 text-white disabled:opacity-40"
        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        disabled={page === totalPages}
        type="button"
      >
        ›
      </button>
    </div>
  );

  return (
    <PageShell title="Logs" subtitle="Acompanhe todos os seus logs" toolbar={toolbar} footer={footer}>
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      {loading ? (
        <div className="p-6">Carregando...</div>
      ) : pagedItems.length === 0 ? (
        <EmptyState title="Nada por aqui ainda..." />
      ) : (
        <div className="border-t" style={{ borderColor: "#D7D7D7" }}>
          <div className="px-7.5">
            <table className="w-full min-w-[980px] border-collapse">
              <thead>
                <tr className="text-sm text-black/70" style={{ borderBottom: "1px solid #D7D7D7" }}>
                  <th className="py-5 pr-6 text-left font-medium">Tipo de atividade</th>
                  <th className="py-5 pr-6 text-left font-medium">Módulo</th>
                  <th className="py-5 text-left font-medium">Data e horário</th>
                </tr>
              </thead>

              <tbody>
                {pagedItems.map((l) => {
                  const mod = moduleMeta[l.module];

                  return (
                    <tr key={l.id} style={{ borderBottom: "1px solid #D7D7D7" }}>
                      <td className="py-6 pr-6">
                        <span className="inline-flex rounded-full border bg-white px-4 py-2 text-xs font-medium text-black/70">
                          {l.activityType}
                        </span>
                      </td>

                      <td className="py-6 pr-6">
                        <span className="inline-flex items-center gap-2 rounded-full border bg-[#F2F2F2] px-4 py-2 text-xs font-medium text-black/70">
                          <img src={mod.icon} alt="" className="h-4 w-4" />
                          <span>{mod.label}</span>
                        </span>
                      </td>

                      <td className="py-6">
                        <span className="inline-flex rounded-full border bg-[#F2F2F2] px-4 py-2 text-xs font-medium text-black/70">
                          {formatBR(l.createdAt)}
                        </span>
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
  );
}
