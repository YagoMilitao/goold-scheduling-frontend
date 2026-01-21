"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import EmptyState from "@/components/EmptyState";
import { apiFetch } from "@/lib/api";


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

const moduleLabel: Record<LogModule, string> = {
  AGENDAMENTOS: "Agendamento",
  MINHA_CONTA: "Minha Conta",
  LOGS: "Logs"
};

const moduleIcon: Record<LogModule, string> = {
  AGENDAMENTOS: "🗓️",
  MINHA_CONTA: "👤",
  LOGS: "🧾"
};

export default function AdminLogsPage() {
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [q, setQ] = useState("");
  const [items, setItems] = useState<ApiLogItem[]>([]);
  const [loading, setLoading] = useState(false);

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

  const onToggleOrder = () => setOrder((p) => (p === "asc" ? "desc" : "asc"));

  const viewItems = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;

    return items.filter((x) => {
      const client = x.user?.name?.toLowerCase() ?? "";
      const act = (x.activityType ?? "").toLowerCase();
      const mod = moduleLabel[x.module]?.toLowerCase() ?? "";
      return client.includes(term) || act.includes(term) || mod.includes(term);
    });
  }, [items, q]);

  const toolbar = (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-1 items-center gap-3">
        <div className="flex w-full max-w-md items-center gap-3 rounded-xl border px-4 py-3">
          <span className="h-4 w-4 rounded bg-black/10" />
          <input
            className="w-full outline-none"
            placeholder="Filtre por cliente, tipo de atividade ou Módulo"
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

  const pillBase = "inline-flex items-center gap-2 rounded-full border bg-black/5 px-4 py-2 text-sm text-black/80";
  const modulePill = "inline-flex items-center gap-2 rounded-full border bg-black/5 px-4 py-2 text-sm text-black/80";

  return (
    <PageShell title="Logs" subtitle="Acompanhe todos as Logs de clientes" toolbar={toolbar} footer={footer}>
      {loading ? (
        <div className="h-full w-full rounded-2xl border p-6">Carregando...</div>
      ) : viewItems.length === 0 ? (
        <EmptyState title="Nenhum log encontrado" />
      ) : (
        <div className="w-full overflow-x-auto rounded-2xl border">
          <table className="min-w-[1100px] w-full">
            <thead>
              <tr className="border-b text-sm text-black/70">
                <th className="text-left p-4">Cliente</th>
                <th className="text-left p-4">Tipo de atividade</th>
                <th className="text-left p-4">Módulo</th>

                <th className="text-left p-4">
                  <div className="flex items-center gap-3">
                    <span>Data e horário</span>

                    <button
                      type="button"
                      onClick={onToggleOrder}
                      title={order === "asc" ? "Ordenar crescente" : "Ordenar decrescente"}
                      aria-label="Alternar ordem"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border text-black/70 hover:bg-black/5"
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
                <tr key={x.id} className="border-b last:border-b-0">
                  <td className="p-4">
                    <div className="flex flex-col leading-tight">
                      <span className="font-medium">{x.user.name}</span>
                      <span className="text-sm text-black/60">Cliente</span>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className={pillBase}>{x.activityType}</span>
                  </td>

                  <td className="p-4">
                    <span className={modulePill}>
                      <span className="text-base leading-none">{moduleIcon[x.module]}</span>
                      <span>{moduleLabel[x.module]}</span>
                    </span>
                  </td>

                  <td className="p-4">
                    <span className={pillBase}>{formatDateTimeBR(x.createdAt)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
