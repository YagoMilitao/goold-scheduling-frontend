"use client";

import { useEffect, useMemo, useState } from "react";
import UserGuard from "@/components/UserGuard";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";

type RoomItem = { id: number; name: string; startTime: string; endTime: string; slotMinutes: number };
type RoomsResponse = { items: RoomItem[] };

const timeToMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const minutesToTime = (m: number) => {
  const hh = String(Math.floor(m / 60)).padStart(2, "0");
  const mm = String(m % 60).padStart(2, "0");
  return `${hh}:${mm}`;
};

const buildSlots = (room: RoomItem) => {
  const start = timeToMinutes(room.startTime);
  const end = timeToMinutes(room.endTime);
  const slots: string[] = [];

  for (let m = start; m < end; m += room.slotMinutes) {
    slots.push(minutesToTime(m));
  }

  return slots;
};

export default function AgendarPage() {
  const router = useRouter();

  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [roomId, setRoomId] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch<RoomsResponse>("/admin/rooms", { auth: true });
        setRooms(res.items);
        if (res.items.length > 0) setRoomId(res.items[0].id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao carregar salas");
      }
    })();
  }, []);

  const selectedRoom = useMemo(() => rooms.find((r) => r.id === roomId) ?? null, [rooms, roomId]);

  const slots = useMemo(() => (selectedRoom ? buildSlots(selectedRoom) : []), [selectedRoom]);

  useEffect(() => {
    if (!slots.length) return;
    if (!slots.includes(time)) setTime(slots[0]);
  }, [slots, time]);

  const scheduledAtISO = useMemo(() => {
    if (!date || !time) return null;
    const local = new Date(`${date}T${time}:00`);
    return local.toISOString();
  }, [date, time]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!roomId) {
      setError("Selecione uma sala");
      return;
    }

    if (!scheduledAtISO) {
      setError("Selecione data e horário");
      return;
    }

    setLoading(true);

    try {
      await apiFetch("/bookings", {
        method: "POST",
        auth: true,
        body: { roomId, scheduledAt: scheduledAtISO }
      });

      setSuccess("Agendamento enviado para análise");
      setDate("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao criar agendamento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserGuard>
      <div className="min-h-screen p-6">
        <div className="mx-auto w-full max-w-xl space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Agendar</h1>
              <p className="text-sm opacity-70">Selecione sala, data e horário</p>
            </div>

            <button className="rounded-xl border px-4 py-2" type="button" onClick={() => router.push("/")}>
              Voltar
            </button>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-700">{success}</p>}

          <form onSubmit={onSubmit} className="rounded-2xl border p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-sm">Sala</label>
              <select
                className="w-full rounded-xl border px-4 py-3 outline-none"
                value={roomId ?? ""}
                onChange={(e) => setRoomId(Number(e.target.value))}
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>

              {selectedRoom && (
                <p className="text-sm opacity-70">
                  {selectedRoom.startTime} - {selectedRoom.endTime} • {selectedRoom.slotMinutes}min
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm">Data</label>
              <input
                className="w-full rounded-xl border px-4 py-3 outline-none"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm">Horário</label>
              <select className="w-full rounded-xl border px-4 py-3 outline-none" value={time} onChange={(e) => setTime(e.target.value)}>
                {slots.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <button className="w-full rounded-xl bg-black px-4 py-4 font-semibold text-white disabled:opacity-60" disabled={loading}>
              {loading ? "Enviando..." : "Solicitar agendamento"}
            </button>
          </form>
        </div>
      </div>
    </UserGuard>
  );
}
