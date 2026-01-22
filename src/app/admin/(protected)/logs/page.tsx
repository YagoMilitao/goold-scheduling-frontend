"use client";

import PageShell from "@/components/ui/PageShell";
import EmptyState from "@/components/ui/EmptyState";
import DateFilter from "@/components/ui/DateFilterSelect";
import useAdminLogsViewModel, { moduleIconSrc, moduleLabel } from "./useAdminLogsViewModel";
import GuardLoading from "@/components/ui/GuardLoading";

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

export default function AdminLogsPage() {
  const vm = useAdminLogsViewModel();

  const toolbar = (
    <div className="mt-5 flex items-center justify-between gap-4">
      <div className="flex flex-1 items-center gap-3">
        <div className="flex w-full max-w-md items-center gap-3 rounded-xl border bg-white px-4 py-3">
          <img src="/icons/lupa_logo.svg" alt="" className="h-5 w-5 opacity-70" />
          <input
            className="w-full outline-none"
            placeholder="Filtre por cliente, tipo de atividade ou Módulo"
            value={vm.q}
            onChange={(e) => vm.setQ(e.target.value)}
          />
        </div>

        <DateFilter value={vm.date} onChange={vm.setDate} placeholder="Selecione" iconSrc="/icons/bookings_logo.svg" />
      </div>
    </div>
  );

  const footer = (
    <div className="flex items-center justify-center">
      <button
        className="rounded-lg bg-black px-3 py-2 text-white "
        type="button"
        onClick={vm.goPrev}
        disabled={!vm.canPrev}
        aria-label="Página anterior"
        title="Página anterior"
      >
        ‹
      </button>

      <span className="rounded-lg border bg-black px-3 py-2 text-white">
        {vm.page}
      </span>

      <button
        className="rounded-lg bg-black px-3 py-2 text-white "
        type="button"
        onClick={vm.goNext}
        disabled={!vm.canNext}
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
      {vm.loading ? (
        <GuardLoading />
      ) : vm.filteredCount === 0 ? (
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
                        onClick={vm.onToggleOrder}
                        title={vm.order === "asc" ? "Ordenar crescente" : "Ordenar decrescente"}
                        aria-label="Alternar ordem"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-black/5"
                      >
                        <img
                          src="/icons/ArrowsDownUpIcon.svg"
                          alt=""
                          className={`h-4 w-4 transition-transform ${vm.order === "asc" ? "rotate-0" : "rotate-180"}`}
                        />
                      </button>
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                {vm.items.map((x) => (
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