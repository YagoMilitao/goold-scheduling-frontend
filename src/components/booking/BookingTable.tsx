"use client";

export type BookingItem = {
  id: number;
  scheduledAt: string;
  status: "EM_ANALISE" | "AGENDADO" | "CANCELADO";
  userName: string;
  userRoleLabel: "Cliente" | "Admin";
  roomName: string;
};

const statusText: Record<BookingItem["status"], string> = {
  EM_ANALISE: "Em análise",
  AGENDADO: "Agendado",
  CANCELADO: "Cancelado"
};

const statusPillClass: Record<BookingItem["status"], string> = {
  EM_ANALISE: "border-gray-300 text-gray-600 bg-white",
  AGENDADO: "border-emerald-300 text-emerald-600 bg-emerald-50",
  CANCELADO: "border-red-300 text-red-600 bg-red-50"
};

const rowClass: Record<BookingItem["status"], string> = {
  EM_ANALISE: "",
  AGENDADO: "bg-emerald-50/40",
  CANCELADO: "bg-red-50/40"
};

const formatBR = (iso: string) => {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} às ${hh}:${min}`;
};

export default function BookingsTable({
  items,
  onCancel
}: {
  items: BookingItem[];
  onCancel: (id: number) => void;
}) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-[980px] w-full">
        <thead>
          <tr className="border-b text-sm text-black/70">
            <th className="text-left py-4 pr-4">Data agendamento</th>
            <th className="text-left py-4 pr-4">Nome</th>
            <th className="text-left py-4 pr-4">Sala de agendamento</th>
            <th className="text-left py-4 pr-4">Status transação</th>
            <th className="text-right py-4 pl-4">Ação</th>
          </tr>
        </thead>

        <tbody>
          {items.map((b) => (
            
            <tr key={b.id} className={`border-b ${rowClass[b.status]}`}>
              <td className="py-5 pr-4">{formatBR(b.scheduledAt)}</td>

              <td className="py-5 pr-4">
                <div className="flex flex-col leading-tight">
                  <span className="font-medium">{b.userName}</span>
                  <span className="text-sm text-black/60">{b.userRoleLabel}</span>
                </div>
              </td>

              <td className="py-5 pr-4">
                <span className="inline-flex rounded-full bg-black px-4 py-2 text-sm font-semibold text-white">
                  {b.roomName}
                </span>
              </td>

              <td className="py-5 pr-4">
                <span className={`inline-flex rounded-full border px-4 py-2 text-sm ${statusPillClass[b.status]}`}>
                  {statusText[b.status]}
                </span>
              </td>

              <td className="py-5 pl-4 text-right">
                 {b.status !== "CANCELADO" && (
                  <button
                    type="button"
                    onClick={() => onCancel(b.id)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black text-white"
                    aria-label="Cancelar"
                  >
                    ✕
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
