"use client";

import PageShell from "@/components/ui/PageShell";
import EmptyState from "@/components/ui/EmptyState";
import DateFilter from "@/components/ui/DateFilterSelect";
import { useLogsViewModel } from "./useLogsViewModel";
import GuardLoading from "@/components/ui/GuardLoading";

const moduleMeta = {
  AGENDAMENTOS: { label: "Agendamento", icon: "/icons/bookings_logo.svg" },
  MINHA_CONTA: { label: "Minha Conta", icon: "/icons/user.svg" },
  LOGS: { label: "Logs", icon: "/icons/logs_logo.svg" }
};

const pad = (n: number) => String(n).padStart(2, "0");

const formatBR = (iso: string) => {
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} às ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

export default function LogsPage() {
  const vm = useLogsViewModel();

  const toolbar = (
    <div className="mt-5 flex items-center justify-between gap-4">
      <div className="flex flex-1 items-center gap-3">
        <div className="flex w-full max-w-md items-center gap-3 rounded-xl border bg-white px-4 py-3">
          <img src="/icons/lupa_logo.svg" alt="" className="h-5 w-5 opacity-70" />
          <input
            className="w-full outline-none"
            placeholder="Filtre por tipo de atividade ou módulo"
            value={vm.q}
            onChange={(e) => {
              vm.setQ(e.target.value);
              vm.goPrev();
            }}
          />
        </div>

        <DateFilter
          value={vm.date}
          onChange={(v) => {
            vm.setDate(v);
            vm.goPrev();
          }}
          placeholder="Selecione"
          iconSrc="/icons/bookings_logo.svg"
          className="w-52"
        />
      </div>
    </div>
  );

  const footer = (
    <div className="flex items-center justify-center gap-1">
      <button
        className="rounded-lg bg-black px-2 py-2 text-white"
        onClick={vm.goPrev}
        disabled={vm.page === 1}
        type="button"
        aria-label="Página anterior"
      >
        ‹
      </button>

      <span className="rounded-lg border bg-black px-4 py-2 text-white">
        {vm.page}
      </span>

      <button
        className="rounded-lg bg-black px-3 py-2 text-white"
        onClick={vm.goNext}
        disabled={vm.page === vm.totalPages}
        type="button"
        aria-label="Próxima página"
      >
        ›
      </button>
    </div>
  );

  return (
    <PageShell title="Logs" subtitle="Acompanhe todos os seus logs" toolbar={toolbar} footer={footer}>
      {vm.error && <p className="mb-4 text-sm text-red-600">{vm.error}</p>}

      {vm.loading ? (
        <GuardLoading />
      ) : vm.pagedItems.length === 0 ? (
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
                {vm.pagedItems.map((l) => {
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