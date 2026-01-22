"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import Modal from "@/components/ui/Modal";

type CreateRoomBody = {
  name: string;
  startTime: string;
  endTime: string;
  slotMinutes: 30;
};

const pad = (n: number) => String(n).padStart(2, "0");

const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const fromMinutes = (min: number) => {
  const h = pad(Math.floor(min / 60));
  const m = pad(min % 60);
  return `${h}:${m}`;
};

const buildTimeOptions = (start: string, end: string, step: number) => {
  const s = toMinutes(start);
  const e = toMinutes(end);

  const items: string[] = [];
  for (let t = s; t <= e; t += step) items.push(fromMinutes(t));

  return items;
};

export default function SchedulingSettingsModal({
  open,
  onClose,
  onSaved
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const stepMinutes = 30;

  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("18:00");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timeOptions = useMemo(() => buildTimeOptions("00:00", "23:30", stepMinutes), []);
  const endOptions = useMemo(() => {
    const s = toMinutes(startTime);
    return timeOptions.filter((t) => toMinutes(t) > s);
  }, [timeOptions, startTime]);

  useEffect(() => {
    if (!open) return;
    setName("");
    setStartTime("08:00");
    setEndTime("18:00");
    setError(null);
    setSaving(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const s = toMinutes(startTime);
    const e = toMinutes(endTime);
    if (e <= s) setEndTime(fromMinutes(s + stepMinutes));
  }, [open, startTime, endTime]);

  const canSave = useMemo(() => {
    if (!name.trim()) return false;
    if (toMinutes(endTime) <= toMinutes(startTime)) return false;
    return !saving;
  }, [name, startTime, endTime, saving]);

  const onSubmit = async () => {
    if (!canSave) return;

    setSaving(true);
    setError(null);

    try {
      const body: CreateRoomBody = {
        name: name.trim(),
        startTime,
        endTime,
        slotMinutes: 30
      };

      await apiFetch("/admin/rooms", { method: "POST", auth: true, body });

      onClose();
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar sala");
    } finally {
      setSaving(false);
    }
  };

  const footer = (
    <button
      type="button"
      onClick={onSubmit}
      disabled={!canSave}
      className="w-full rounded-xl bg-black px-4 py-4 font-semibold text-white disabled:opacity-40"
    >
      {saving ? "Salvando..." : "Adicionar nova sala"}
    </button>
  );

  return (
    <Modal open={open} onClose={onClose} title="Ajustes de agendamento" size="lg" footer={footer}>
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm">
            Nome da sala <span className="opacity-60">(Obrigatório)</span>
          </label>
          <input
            className="w-full rounded-xl border px-4 py-3 outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Sala 001"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm">
              Horário Inicial <span className="opacity-60">(Obrigatório)</span>
            </label>
            <select
              className="w-full rounded-xl border px-4 py-3 outline-none"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            >
              {timeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm">
              Horário Final <span className="opacity-60">(Obrigatório)</span>
            </label>
            <select
              className="w-full rounded-xl border px-4 py-3 outline-none"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            >
              {endOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm">Bloco de agendamento</label>
          <div className="flex items-center justify-between rounded-xl border bg-gray-50 px-4 py-3">
            <span className="text-sm">30 minutos</span>
            <span className="text-xs opacity-60">Fixado pelo sistema</span>
          </div>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </Modal>
  );
}
