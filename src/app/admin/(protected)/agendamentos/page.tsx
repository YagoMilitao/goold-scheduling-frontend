"use client";

import { useCallback, useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import SchedulingSettingsModal from "@/components/SchedulingSettingsModal";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { clearAuth } from "@/lib/auth";

type BookingItem = {
  id: number;
  scheduledAt: string;
  status: "EM_ANALISE" | "AGENDADO" | "CANCELADO";
  createdByRole: "ADMIN" | "CLIENT";
  user: { id: number; name: string; role: "ADMIN" | "CLIENT" };
  room: { id: number; name: string };
};

type ListResponse = { items: BookingItem[] };

type RoomItem = { id: number; name: string; startTime: string; endTime: string; slotMinutes: number };
type RoomsResponse = { items: RoomItem[] };

const statusLabel: Record<BookingItem["status"], string> = {
  EM_ANALISE: "Em análise",
  AGENDADO: "Agendado",
  CANCELADO: "Cancelado"
};

const roleLabel: Record<BookingItem["createdByRole"], string> = {
  ADMIN: "Admin",
  CLIENT: "Cliente"
};

const formatDateTimeBR = (iso: string) => {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return { date: `${dd}/${mm}/${yyyy}`, time: `${hh}:${min}` };
};

export default function AdminAgendamentosPage() {
  const router = useRouter();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [rooms, setRooms] = useState<RoomItem[]>([]);

  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [items, setItems] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRooms = useCallback(async () => {
    try {
      const res = await apiFetch<RoomsResponse>("/admin/rooms", { auth: true });
      setRooms(res.items);
    } catch {}
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch<ListResponse>(`/admin/bookings?order=${order}`, { auth: true });
      setItems(res.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar agendamentos");
    } finally {
      setLoading(false);
    }
  }, [order]);

  useEffect(() => {
    load();
    loadRooms();
  }, [load, loadRooms]);

  const onToggleOrder = () => setOrder((p) => (p === "asc" ? "desc" : "asc"));

  const onConfirm = async (id: number) => {
    try {
      await apiFetch(`/admin/bookings/${id}/confirm`, { method: "PATCH", auth: true });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao confirmar");
    }
  };

  const onCancel = async (id: number) => {
    try {
      await apiFetch(`/admin/bookings/${id}/cancel`, { method: "PATCH", auth: true });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao cancelar");
    }
  };

  const onLogout = () => {
    clearAuth();
    router.replace("/admin/login");
  };

  const onOpenSettings = () => setSettingsOpen(true);
  const onCloseSettings = () => setSettingsOpen(false);

  return (
    <AdminGuard>
      <div className="min-h-screen p-6">
        <div className="mx-auto w-full max-w-6xl space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Agendamentos</h1>
              <p className="text-sm opacity-70">Painel Admin</p>
            </div>

            <div className="flex items-center gap-2">
              <button className="rounded-xl border px-4 py-2" onClick={onOpenSettings} type="button">
                Ajustes de agendamento
              </button>

              <button className="rounded-xl border px-4 py-2" onClick={onLogout} type="button">
                Sair
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {loading && <div className="rounded-2xl border p-6">Carregando...</div>}

          <div className="rounded-2xl border p-4">
  <div className="flex items-center justify-between">
    <h2 className="font-semibold">Salas cadastradas</h2>
    <span className="text-sm opacity-70">{rooms.length}</span>
  </div>

  {rooms.length === 0 ? (
    <p className="mt-2 text-sm opacity-70">Nenhuma sala cadastrada ainda</p>
  ) : (
    <ul className="mt-3 space-y-2">
      {rooms.map((r) => (
        <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2">
          <span className="font-medium">{r.name}</span>
          <span className="text-sm opacity-70">
            {r.startTime} - {r.endTime} • {r.slotMinutes}min
          </span>
        </li>
      ))}
    </ul>
  )}
</div>


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
                          >
                            X
                          </button>
                          <button
                            className="rounded-xl border px-3 py-2 disabled:opacity-40"
                            type="button"
                            disabled={!canAct}
                            onClick={() => onConfirm(b.id)}
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
        </div>
      </div>

      <SchedulingSettingsModal open={settingsOpen} onClose={onCloseSettings} onSaved={loadRooms} />
    </AdminGuard>
  );
}
