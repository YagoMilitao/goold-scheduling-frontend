"use client";

import PageShell from "@/components/ui/PageShell";
import EmptyState from "@/components/ui/EmptyState";
import BookingsTable from "@/components/booking/BookingTable";
import NewBookingModal from "@/components/booking/NewBookingModal";
import DateFilter from "@/components/ui/DateFilterSelect";
import { useAgendamentosViewModel } from "./useAgendamentosViewModel";
import GuardLoading from "@/components/ui/GuardLoading";


export default function AgendamentosPage() {
  const vm = useAgendamentosViewModel();

  const toolbar = (
    <div className="mt-5 flex items-center justify-between gap-4">
      <div className="flex flex-1 items-center gap-3">
        <div className="flex w-full max-w-md items-center gap-3 rounded-xl border bg-white px-4 py-3">
          <img
            src="/icons/lupa_logo.svg"
            alt=""
            className="h-5 w-5 opacity-70"
          />
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
          className="w-52"
        />
      </div>

      <button
        className="rounded-xl bg-black px-8 py-3 font-semibold text-white"
        type="button"
        onClick={vm.openModal}
      >
        Novo Agendamento
      </button>

      <NewBookingModal
        open={vm.modalOpen}
        onClose={vm.closeModal}
        onCreated={vm.reload}
      />
    </div>
  );

  const footer = (
    <div className="flex items-center justify-center gap-1">
      <button
        className="rounded-lg bg-black px-2 py-2 text-white"
        type="button"
        onClick={vm.goPrev}
        disabled={!vm.canPrev}
        aria-label="Página anterior"
      >
        ‹
      </button>

      <span className="rounded-lg border bg-black px-2 py-2 text-white">
        {vm.page}
      </span>

      <button
        className="rounded-lg bg-black px-2 py-2 text-white"
        type="button"
        onClick={vm.goNext}
        disabled={!vm.canNext}
        aria-label="Próxima página"
      >
        ›
      </button>
    </div>
  );

  return (
    <PageShell
      title="Agendamento"
      subtitle="Acompanhe todos os seus agendamentos de forma simples"
      toolbar={toolbar}
      footer={footer}
    >
      {vm.loading ? (
        <GuardLoading />
      ) : vm.pagedItems.length === 0 ? (
        <EmptyState title="Nada por aqui ainda..." />
      ) : (
        <BookingsTable
          items={vm.pagedItems}
          onCancel={vm.onCancel}
        />
      )}
    </PageShell>
  );
}