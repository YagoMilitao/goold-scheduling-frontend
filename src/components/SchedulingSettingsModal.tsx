"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

type RoomCreateBody = {
  name: string;
  startTime: string;
  endTime: string;
  slotMinutes: number;
};

const slotOptions = [
  { label: "15 minutos", value: 15 },
  { label: "30 minutos", value: 30 },
  { label: "60 minutos", value: 60 }
];

export default function SchedulingSettingsModal({ open, onClose, onSaved }: Props) {
  const [name, setName] = useState("Sala 01");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("18:00");
  const [slotMinutes, setSlotMinutes] = useState(30);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setError(null);
      setSaving(false);
      setAdding(false);
    }
  }, [open]);

  const onAddNewRoom = () => {
    setAdding(true);
    setName("");
    setError(null);
  };

  const onSave = async () => {
    setError(null);

    if (!adding) {
      setError("Clique em 'Adicionar nova sala' para criar uma sala");
      return;
    }

    if (!name.trim()) {
      setError("Nome da sala é obrigatório");
      return;
    }

    setSaving(true);

    try {
      const body: RoomCreateBody = { name: name.trim(), startTime, endTime, slotMinutes };
      await apiFetch("/admin/rooms", { method: "POST", body, auth: true });
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-lg">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-lg font-semibold">Ajustes de agendamento</h2>
          <button className="text-xl leading-none" onClick={onClose} type="button" aria-label="Fechar">
            ×
          </button>
        </div>

        <div className="h-px bg-gray-200" />

        <div className="px-6 py-5 space-y-5">
          <div className="space-y-2">
            <label className="text-sm text-gray-700">Nome da sala</label>
            <input
              className="w-full rounded-xl border px-4 py-3 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sala 012"
              disabled={!adding}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-700">Horário Inicial & Final da sala</label>
            <div className="flex gap-3">
              <input
                className="w-full rounded-xl border px-4 py-3 outline-none"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="08:00"
              />
              <input
                className="w-full rounded-xl border px-4 py-3 outline-none"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="18:00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-700">Bloco de Horários de agendamento</label>
            <select
              className="w-full rounded-xl border px-4 py-3 outline-none"
              value={slotMinutes}
              onChange={(e) => setSlotMinutes(Number(e.target.value))}
            >
              {slotOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <button className="flex items-center gap-3 py-2 text-left" type="button" onClick={onAddNewRoom}>
            <span className="text-xl">+</span>
            <span className="font-medium">Adicionar nova sala</span>
          </button>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="px-6 pb-6">
          <button
            className="w-full rounded-xl bg-black px-4 py-4 font-semibold text-white disabled:opacity-60"
            disabled={saving}
            onClick={onSave}
            type="button"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
