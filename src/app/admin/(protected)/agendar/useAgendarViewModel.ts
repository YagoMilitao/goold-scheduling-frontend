"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";

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

  for (let m = start; m < end; m += room.slotMinutes) slots.push(minutesToTime(m));

  return slots;
};

export default function useAgendarViewModel() {
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [roomId, setRoomId] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadRooms = useCallback(async () => {
    setLoadingRooms(true);
    setError(null);

    try {
      const res = await apiFetch<RoomsResponse>("/admin/rooms", { auth: true });
      const list = res.items ?? [];
      setRooms(list);

      if (list.length > 0) {
        setRoomId((prev) => (prev === null ? list[0].id : prev));
      } else {
        setRoomId(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar salas");
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const selectedRoom = useMemo(() => rooms.find((r) => r.id === roomId) ?? null, [rooms, roomId]);

  const slots = useMemo(() => (selectedRoom ? buildSlots(selectedRoom) : []), [selectedRoom]);

  useEffect(() => {
    if (!slots.length) return;
    setTime((prev) => (prev && slots.includes(prev) ? prev : slots[0]));
  }, [slots]);

  const scheduledAtISO = useMemo(() => {
    if (!date || !time) return null;
    const local = new Date(`${date}T${time}:00`);
    return local.toISOString();
  }, [date, time]);

  const submit = useCallback(async () => {
    setError(null);
    setSuccess(null);

    if (!roomId) {
      setError("Selecione uma sala");
      return false;
    }

    if (!scheduledAtISO) {
      setError("Selecione data e horário");
      return false;
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
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao criar agendamento");
      return false;
    } finally {
      setLoading(false);
    }
  }, [roomId, scheduledAtISO]);

  return {
    rooms,
    roomId,
    setRoomId,
    date,
    setDate,
    time,
    setTime,
    selectedRoom,
    slots,
    loading,
    loadingRooms,
    error,
    success,
    reloadRooms: loadRooms,
    submit
  };
}