"use client";

import { useState } from "react";
import PageShell from "@/components/ui/PageShell";
import SchedulingSettingsModal from "@/components/ui/SchedulingSettingsModal";
import DateFilter from "@/components/ui/DateFilterSelect";
import useAdminAgendamentosViewModel from "./useAdminAgendamentosViewModel";

export default function AdminAgendamentosPage() {
  const vm = useAdminAgendamentosViewModel();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const toolbar = (
    <div className="mt-5 flex items-center justify-between gap-4">
      <div className="flex flex-1 items-center gap-3">
        <div className="flex w-full max-w-md items-center gap-3 rounded-xl border bg-white px-4 py-3">
          <img src="/icons/lupa_logo.svg" alt="" className="h-5 w-5 opacity-70" />
          <input
            className="w-full outline-none"
            placeholder="Filtre por nome"
            value={vm.q}
            onChange={(e) => vm.setQ(e.target.value)}
          />
        </div>

        <DateFilter
          value={vm.date}
          onChange={vm.setDate}
          placeholder="Selecione"
          iconSrc="/icons/bookings_logo.svg"
        />
      </div>

      <button
        className="rounded-xl bg-black px-8 py-3 font-semibold text-white"
        onClick={() => setSettingsOpen(true)}
        type="button"
      >
        Ajustes de agendamento
      </button>
    </div>
  );

  const footer = (
    <div className="flex items-center justify-center">
      <button
        type="button"
        aria-label="Página anterior"
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white"
      >
        ‹
      </button>

      <span className="rounded-lg border bg-black px-4 py-2 text-white">1</span>

      <button
        type="button"
        aria-label="Próxima página"
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white"
      >
        ›
      </button>
    </div>
  );

  return (
    <>
      <PageShell
        title="Agendamentos"
        subtitle="Acompanhe todos os agendamentos de clientes forma simples"
        toolbar={toolbar}
        footer={footer}
      >
        {vm.error ? <p className="mb-4 text-sm text-red-600">{vm.error}</p> : null}

        {vm.loading ? (
          <div className="p-6">Carregando...</div>
        ) : vm.viewItems.length === 0 ? (
          <div className="p-6">Nenhum agendamento encontrado</div>
        ) : (
          <div className="border-t" style={{ borderColor: "#D7D7D7" }}>
            <div className="px-8">
              <table className="w-full min-w-245 border-collapse">
                <thead>
                  <tr className="text-sm text-black/70" style={{ borderBottom: "1px solid #D7D7D7" }}>
                    <th className="py-5 pr-6 text-left font-medium">
                      <div className="flex items-center gap-2">
                        <span>Data agendamento</span>
                        <button
                          onClick={vm.onToggleOrder}
                          type="button"
                          aria-label="Ordenar por data"
                          title={vm.order === "asc" ? "Ordenar crescente" : "Ordenar decrescente"}
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

                    <th className="py-5 pr-6 text-left font-medium">Nome</th>
                    <th className="py-5 pr-6 text-left font-medium">Sala de agendamento</th>
                    <th className="py-5 pr-6 text-left font-medium">Status</th>
                    <th className="py-5 text-center font-medium">Ação</th>
                  </tr>
                </thead>

                <tbody>
                  {vm.viewItems.map((b) => {
                    const showConfirm = b.status === "EM_ANALISE";
                    const showCancel = b.status !== "CANCELADO";
                    const disabled = vm.actingId === b.id;

                    return (
                      <tr
                        key={b.id}
                        className={vm.rowBgClass[b.status]}
                        style={{ borderBottom: "1px solid #D7D7D7" }}
                      >
                        <td className="py-6 pr-6 text-sm text-black/80">{vm.formatBR(b.scheduledAt)}</td>

                        <td className="py-6 pr-6">
                          <div className="flex flex-col">
                            <span className="font-medium">{b.user.name}</span>
                            <span className="text-sm text-black/60">{vm.roleLabel[b.createdByRole]}</span>
                          </div>
                        </td>

                        <td className="py-6 pr-6">
                          <span className="inline-flex rounded-full bg-black px-4 py-2 text-sm font-semibold text-white">
                            {b.room.name}
                          </span>
                        </td>

                        <td className="py-6 pr-6">
                          <span className={`inline-flex rounded-full border px-5 py-2 text-sm ${vm.statusPillClass[b.status]}`}>
                            {vm.statusText[b.status]}
                          </span>
                        </td>

                        <td className="py-6 text-center">
                          <div className="inline-flex gap-3">
                            {showCancel ? (
                              <button
                                type="button"
                                onClick={() => vm.onCancel(b.id)}
                                disabled={disabled}
                                aria-label="Cancelar"
                                title="Cancelar"
                                className="disabled:opacity-50"
                              >
                                <img src="/icons/cancel.svg" alt="" className="h-10 w-10" />
                              </button>
                            ) : null}

                            {showConfirm ? (
                              <button
                                type="button"
                                onClick={() => vm.onConfirm(b.id)}
                                disabled={disabled}
                                aria-label="Confirmar"
                                title="Confirmar"
                                className="disabled:opacity-50"
                              >
                                <img src="/icons/check.svg" alt="" className="h-10 w-10" />
                              </button>
                            ) : null}
                          </div>
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

      <SchedulingSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} onSaved={() => {}} />
    </>
  );
}