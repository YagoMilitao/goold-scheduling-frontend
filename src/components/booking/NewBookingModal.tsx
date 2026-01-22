"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import Modal from "@/components/ui/Modal";

type RoomAvail = {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  slotMinutes: number;
  available: boolean;
};

type RoomsAvailResponse = { items: RoomAvail[] };

type RoomItem = {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  slotMinutes: number;
};

type RoomsResponse = { items: RoomItem[] };

const pad = (n: number) => String(n).padStart(2, "0");

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const fromMinutes = (min: number) => {
  const h = String(Math.floor(min / 60)).padStart(2, "0");
  const m = String(min % 60).padStart(2, "0");
  return `${h}:${m}`;
};

const clampToStep = (value: number, step: number, mode: "ceil" | "floor") => {
  if (step <= 0) return value;
  if (mode === "ceil") return Math.ceil(value / step) * step;
  return Math.floor(value / step) * step;
};

const buildTimeOptions = (startTime: string, endTime: string, stepMinutes: number) => {
  const start = clampToStep(toMinutes(startTime), stepMinutes, "ceil");
  const end = clampToStep(toMinutes(endTime), stepMinutes, "floor");

  const items: string[] = [];
  for (let t = start; t <= end; t += stepMinutes) items.push(fromMinutes(t));
  return items;
};

export default function NewBookingModal({
  open,
  onClose,
  onCreated
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [roomId, setRoomId] = useState<number | "">("");

  const [rooms, setRooms] = useState<RoomAvail[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const [rangeStart, setRangeStart] = useState("08:00");
  const [rangeEnd, setRangeEnd] = useState("18:00");
  const [loadingRange, setLoadingRange] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stepMinutes = 30;

  const timeOptions = useMemo(() => buildTimeOptions(rangeStart, rangeEnd, stepMinutes), [rangeStart, rangeEnd]);
  const canQueryRooms = useMemo(() => !!date && !!time, [date, time]);
  const canSubmit = useMemo(() => !!date && !!time && roomId !== "" && !saving, [date, time, roomId, saving]);

  useEffect(() => {
    if (!open) return;

    setDate("");
    setTime("");
    setRoomId("");
    setRooms([]);
    setError(null);
    setSaving(false);
    setRangeStart("08:00");
    setRangeEnd("18:00");
  }, [open]);

  useEffect(() => {
    const run = async () => {
      if (!open) return;

      setLoadingRange(true);

      try {
        const res = await apiFetch<RoomsResponse>("/rooms", { auth: true });
        const items = res.items ?? [];
        if (items.length === 0) return;

        const starts = items.map((r) => r.startTime);
        const ends = items.map((r) => r.endTime);

        const minStart = starts.reduce((a, b) => (toMinutes(a) < toMinutes(b) ? a : b));
        const maxEnd = ends.reduce((a, b) => (toMinutes(a) > toMinutes(b) ? a : b));

        setRangeStart(minStart);
        setRangeEnd(maxEnd);
      } finally {
        setLoadingRange(false);
      }
    };

    run();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setRoomId("");
  }, [open, date, time]);

  useEffect(() => {
    const run = async () => {
      if (!open) return;

      if (!canQueryRooms) {
        setRooms([]);
        setRoomId("");
        return;
      }

      setLoadingRooms(true);
      setError(null);

      try {
        const res = await apiFetch<RoomsAvailResponse>(`/rooms/available?date=${date}&time=${time}`, { auth: true });
        setRooms(res.items);

        const stillValid = res.items.some((r) => r.id === roomId && r.available);
        if (!stillValid) setRoomId("");
      } catch (e) {
        setRooms([]);
        setRoomId("");
        setError(e instanceof Error ? e.message : "Erro ao carregar salas");
      } finally {
        setLoadingRooms(false);
      }
    };

    run();
  }, [open, canQueryRooms, date, time, roomId]);

  const onSubmit = async () => {
    if (!canSubmit) return;

    setSaving(true);
    setError(null);

    try {
      await apiFetch("/bookings", { method: "POST", auth: true, body: { date, time, roomId } });
      onClose();
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao criar agendamento");
    } finally {
      setSaving(false);
    }
  };

  const footer = (
    <button
      type="button"
      onClick={onSubmit}
      disabled={!canSubmit}
      className="w-full rounded-xl bg-black px-4 py-4 font-semibold text-white disabled:opacity-40"
    >
      {saving ? "Confirmando..." : "Confirmar Agendamento"}
    </button>
  );

  return (
    <Modal open={open} onClose={onClose} title="Novo Agendamento" size="md" footer={footer}>
      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm">
            Selecione uma <span className="font-semibold">data</span> <span className="opacity-60">(Obrigatório)</span>
          </label>
          <div className="relative">
            <input
              className="w-full rounded-xl border px-4 py-3 pr-10 outline-none"
              type="date"
              min={todayISO()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-60">📅</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm">
            Selecione um <span className="font-semibold">horário</span> <span className="opacity-60">(Obrigatório)</span>
          </label>

          <select
            className="w-full rounded-xl border px-4 py-3 outline-none disabled:bg-gray-100"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            disabled={!date || loadingRange}
          >
            <option value="">
              {!date ? "Selecione uma data primeiro" : loadingRange ? "Carregando horários..." : "Selecione um horário"}
            </option>
            {timeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {!date ? <p className="text-xs text-black/60">Selecione uma data para liberar os horários.</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm">
            Selecione um <span className="font-semibold">Sala</span> <span className="opacity-60">(Obrigatório)</span>
          </label>

          <select
            className="w-full rounded-xl border px-4 py-3 outline-none disabled:bg-gray-100"
            disabled={!canQueryRooms || loadingRooms}
            value={roomId}
            onChange={(e) => setRoomId(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">
              {loadingRooms ? "Carregando salas..." : canQueryRooms ? "Selecione uma sala" : "Selecione data e horário primeiro"}
            </option>

            {rooms.map((r) => (
              <option key={r.id} value={r.id} disabled={!r.available}>
                {r.name}
                {!r.available ? " (Indisponível)" : ""}
              </option>
            ))}
          </select>

          {!canQueryRooms ? <p className="text-xs text-black/60">Selecione data e horário para ver salas disponíveis.</p> : null}
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </Modal>
  );
}
