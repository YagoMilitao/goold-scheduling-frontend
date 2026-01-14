"use client";

import { formatDateTimeBR } from "@/lib/format";

export type BookingItem = {
  id: number;
  scheduledAt: string;
  status: "EM_ANALISE" | "AGENDADO" | "CANCELADO";
  createdByRole: "ADMIN" | "CLIENT";
  user: { id: number; name: string; role: "ADMIN" | "CLIENT" };
  room: { id: number; name: string };
};

type Props = {
  items: BookingItem[];
  order: "asc" | "desc";
  onToggleOrder: () => void;
  onConfirm: (id: number) => void;
  onCancel: (id: number) => void;
};

const statusLabel: Record<BookingItem["status"], string> = {
  EM_ANALISE: "Em análise",
  AGENDADO: "Agendado",
  CANCELADO: "Cancelado"
};

const roleLabel: Record<BookingItem["createdByRole"], string> = {
  ADMIN: "Admin",
  CLIENT: "Cliente"
};

export default function BookingTable({ items, order, onToggleOrder, onConfirm, onCancel }: Props) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border">
      <table className="min-w-[900px] w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4">
              <div className="flex items-center gap-3">
                <span>Data de agendamento</span>
                <button className="rounded-lg border px-3 py-1 text-sm" onClick={onToggleOrder} type="button">
                  {order === "asc" ? "Crescente" : "Decrescente"}
                </button>
              </div>
            </th>
            <th className="text-left p-4">Nome</th>
            <th className="text-left p-4">Sala de agendamento</th>
            <th className="text-left p-4">Status</th>
            <th className="text-left p-4">Ação</th>
          </tr>
        </thead>

        <tbody>
          {items.map((b) => {
            const { date, time } = formatDateTimeBR(b.scheduledAt);
            const canAct = b.status === "EM_ANALISE";

            return (
              <tr key={b.id} className="border-b last:border-b-0">
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-medium">{date}</span>
                    <span className="text-sm opacity-70">{time}</span>
                  </div>
                </td>

                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-medium">{b.user.name}</span>
                    <span className="text-sm opacity-70">{roleLabel[b.createdByRole]}</span>
                  </div>
                </td>

                <td className="p-4">{b.room.name}</td>

                <td className="p-4">
                  <span className="rounded-xl border px-3 py-1 text-sm">{statusLabel[b.status]}</span>
                </td>

                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      className="rounded-xl border px-3 py-2 disabled:opacity-40"
                      type="button"
                      disabled={!canAct}
                      onClick={() => onCancel(b.id)}
                      aria-label="Cancelar"
                    >
                      X
                    </button>
                    <button
                      className="rounded-xl border px-3 py-2 disabled:opacity-40"
                      type="button"
                      disabled={!canAct}
                      onClick={() => onConfirm(b.id)}
                      aria-label="Confirmar"
                    >
                      ✓
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          {items.length === 0 && (
            <tr>
              <td className="p-6" colSpan={5}>
                Nenhum agendamento encontrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
