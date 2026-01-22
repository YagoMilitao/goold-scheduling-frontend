"use client";

import PageShell from "@/components/PageShell";
import EmptyState from "@/components/EmptyState";
import DateFilter from "@/components/ui/DateFilterSelect";
import useAdminClientesViewModel, { ClientRow } from "./useAdminClientesViewModel";

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

const abbreviateStreet = (street: string) => {
  const s = street.trim();

  const map: Array<[RegExp, string]> = [
    [/^rua\s+/i, "R. "],
    [/^avenida\s+/i, "Av. "],
    [/^travessa\s+/i, "Tv. "],
    [/^alameda\s+/i, "Al. "],
    [/^estrada\s+/i, "Est. "],
    [/^rodovia\s+/i, "Rod. "],
    [/^praça\s+/i, "Pç. "],
    [/^largo\s+/i, "Lg. "]
  ];

  for (const [re, abbr] of map) {
    if (re.test(s)) return s.replace(re, abbr);
  }

  return s;
};

const formatAddressLine = (c: ClientRow) => {
  const street = c.address ? abbreviateStreet(c.address) : "";
  const num = c.number?.trim() ? `n°${c.number.trim()}` : "";
  const bairro = c.neighborhood?.trim() ? c.neighborhood.trim() : "";
  const cidade = c.city?.trim() ? c.city.trim() : "";
  const uf = c.state?.trim() ? c.state.trim().toUpperCase() : "";

  const first = [street, num].filter(Boolean).join(" ");
  const second = [bairro, cidade].filter(Boolean).join(", ");
  const third = uf ? `- ${uf}` : "";

  const line = [first, second ? `${second} ${third}`.trim() : ""].filter(Boolean).join(", ");
  return line || "-";
};

export default function AdminClientesPage() {
  const vm = useAdminClientesViewModel();

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

      <span className="rounded-lg border bg-black text-white px-4 py-2">
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

  const pillBase = "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium border";
  const pillOn = "bg-black text-white border-black";
  const pillOff = "bg-white text-black border-black/20";

  const toggleBase = "relative inline-flex h-6 w-12 items-center rounded-full transition-colors";
  const toggleOn = "bg-black";
  const toggleOff = "bg-black/30";
  const dotBase = "inline-block h-5 w-5 transform rounded-full bg-white transition-transform";
  const dotOn = "translate-x-6";
  const dotOff = "translate-x-1";

  return (
    <PageShell title="Clientes" subtitle="Overview de todos os clientes" toolbar={toolbar} footer={footer}>
      {vm.loading ? (
        <div className="p-6">Carregando...</div>
      ) : vm.items.length === 0 ? (
        <EmptyState title="Nenhum cliente encontrado" />
      ) : (
        <div className="border-t" style={{ borderColor: "#D7D7D7" }}>
          <div className="px-[30px]">
            <table className="w-full min-w-[1100px] border-collapse">
              <thead>
                <tr className="text-sm text-black/70" style={{ borderBottom: "1px solid #D7D7D7" }}>
                  <th className="py-5 pr-6 text-left font-medium">
                    <div className="flex items-center gap-2">
                      <span>Data de cadastro</span>

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

                  <th className="py-5 pr-6 text-left font-medium">Nome</th>
                  <th className="py-5 pr-6 text-left font-medium">Endereço</th>
                  <th className="py-5 pr-6 text-left font-medium">Permissões</th>
                  <th className="py-5 text-left font-medium">Status</th>
                </tr>
              </thead>

              <tbody>
                {vm.items.map((c) => {
                  const fullName = `${c.name}${c.lastName ? ` ${c.lastName}` : ""}`;
                  const addr = formatAddressLine(c);

                  return (
                    <tr key={c.id} style={{ borderBottom: "1px solid #D7D7D7" }}>
                      <td className="py-6 pr-6 text-sm">{formatDateTimeBR(c.createdAt)}</td>

                      <td className="py-6 pr-6">
                        <div className="flex flex-col leading-tight">
                          <span className="font-medium">{fullName}</span>
                          <span className="text-sm text-black/60">Cliente</span>
                        </div>
                      </td>

                      <td className="py-6 pr-6">
                        <span className="text-sm text-black/80">{addr}</span>
                      </td>

                      <td className="py-6 pr-6">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => vm.onToggleBookingsPermission(c.id)}
                            className={`${pillBase} ${c.permissions.canViewBookings ? pillOn : pillOff}`}
                          >
                            Agendamentos
                          </button>

                          <button
                            type="button"
                            onClick={() => vm.onToggleLogsPermission(c.id)}
                            className={`${pillBase} ${c.permissions.canViewLogs ? pillOn : pillOff}`}
                          >
                            Logs
                          </button>
                        </div>
                      </td>

                      <td className="py-6">
                        <button
                          type="button"
                          onClick={() => vm.onToggleActive(c.id)}
                          className={`${toggleBase} ${c.status.isActive ? toggleOn : toggleOff}`}
                          title={c.status.isActive ? "Desativar cliente" : "Ativar cliente"}
                          aria-label={c.status.isActive ? "Desativar cliente" : "Ativar cliente"}
                        >
                          <span className={`${dotBase} ${c.status.isActive ? dotOn : dotOff}`} />
                        </button>
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