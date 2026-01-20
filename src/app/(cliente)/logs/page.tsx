"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import { apiFetch } from "@/lib/api";

type LogItem = {
  id: number;
  activityType: string;
  module: "AGENDAMENTOS" | "MINHA_CONTA" | "LOGS";
  createdAt: string;
};

type LogsResponse = { items: LogItem[] };

const formatBR = (iso: string) => {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} às ${hh}:${min}`;
};

const moduleLabel = (m: LogItem["module"]) => {
  if (m === "AGENDAMENTOS") return { text: "Agendamento", icon: "📅" };
  if (m === "MINHA_CONTA") return { text: "Minha Conta", icon: "👤" };
  return { text: "Logs", icon: "🧾" };
};

export default function LogsPage() {
  const [items, setItems] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<LogsResponse>(`/logs?order=${order}`, { auth: true });
      setItems(res.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar logs");
    } finally {
      setLoading(false);
    }
  }, [order]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;

    return items.filter((l) => {
      const mod = moduleLabel(l.module).text.toLowerCase();
      return l.activityType.toLowerCase().includes(term) || mod.includes(term);
    });
  }, [items, q]);

  const toolbar = (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3">
        <span className="text-black/50">🔍</span>
        <input
          className="w-[420px] bg-transparent text-sm outline-none placeholder:text-black/40"
          placeholder="Filtre por tipo de atividade ou Módulo"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <button type="button" className="flex items-center gap-2 rounded-xl border bg-white px-5 py-3 text-sm text-black/60">
        <span>Selecione</span>
        <span className="ml-10 text-black/50">📅</span>
      </button>
    </div>
  );

  return (
    <PageShell title="Logs" subtitle="Acompanhe todos as suas Logs" toolbar={toolbar}>
      <div className="rounded-2xl border bg-white p-6">
        {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

        {loading ? (
          <div className="rounded-2xl border p-10 text-sm text-black/60">Carregando...</div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="min-w-[980px] w-full">
              <thead>
                <tr className="border-b text-sm text-black/70">
                  <th className="px-6 py-5 text-left">Tipo de atividade</th>
                  <th className="px-6 py-5 text-left">Módulo</th>
                  <th className="px-6 py-5 text-left">
                    <button
                      type="button"
                      onClick={() => setOrder((p) => (p === "asc" ? "desc" : "asc"))}
                      className="inline-flex items-center gap-2 font-medium text-black/80 hover:text-black"
                    >
                      Data e horário
                      <span className="text-black/60">{order === "asc" ? "↑" : "↓"}</span>
                    </button>
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((l) => {
                  const mod = moduleLabel(l.module);

                  return (
                    <tr key={l.id} className="border-b">
                      <td className="px-6 py-5">
                        <span className="inline-flex rounded-full border bg-white px-4 py-2 text-xs font-medium text-black/70">
                          {l.activityType}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-2 rounded-full border bg-[#F2F2F2] px-4 py-2 text-xs font-medium text-black/70">
                          <span>{mod.icon}</span>
                          <span>{mod.text}</span>
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span className="inline-flex rounded-full border bg-[#F2F2F2] px-4 py-2 text-xs font-medium text-black/70">
                          {formatBR(l.createdAt)}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-16 text-center text-sm text-black/60">
                      Nada por aqui ainda...
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 py-5">
          <button className="h-8 w-8 rounded-md bg-black text-white" type="button">
            ‹
          </button>
          <button className="h-8 w-8 rounded-md bg-black text-white" type="button">
            1
          </button>
          <button className="h-8 w-8 rounded-md bg-black text-white" type="button">
            ›
          </button>
        </div>
      </div>
    </PageShell>
  );
}
