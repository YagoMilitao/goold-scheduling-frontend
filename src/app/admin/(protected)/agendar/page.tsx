"use client";

import { useRouter } from "next/navigation";
import UserGuard from "@/components/UserGuard";
import useAgendarViewModel from "./useAgendarViewModel";

export default function AgendarPage() {
  const router = useRouter();
  const vm = useAgendarViewModel();

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

          {vm.error ? <p className="text-sm text-red-600">{vm.error}</p> : null}
          {vm.success ? <p className="text-sm text-green-700">{vm.success}</p> : null}

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await vm.submit();
            }}
            className="space-y-5 rounded-2xl border p-6"
          >
            <div className="space-y-2">
              <label className="text-sm">Sala</label>

              <select
                className="w-full rounded-xl border px-4 py-3 outline-none"
                value={vm.roomId ?? ""}
                onChange={(e) => vm.setRoomId(Number(e.target.value))}
                disabled={vm.loadingRooms}
              >
                {vm.rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>

              {vm.selectedRoom ? (
                <p className="text-sm opacity-70">
                  {vm.selectedRoom.startTime} - {vm.selectedRoom.endTime} • {vm.selectedRoom.slotMinutes}min
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm">Data</label>
              <input
                className="w-full rounded-xl border px-4 py-3 outline-none"
                type="date"
                value={vm.date}
                onChange={(e) => vm.setDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm">Horário</label>

              <select
                className="w-full rounded-xl border px-4 py-3 outline-none"
                value={vm.time}
                onChange={(e) => vm.setTime(e.target.value)}
                disabled={!vm.slots.length}
              >
                {vm.slots.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="w-full rounded-xl bg-black px-4 py-4 font-semibold text-white disabled:opacity-60"
              disabled={vm.loading}
              type="submit"
            >
              {vm.loading ? "Enviando..." : "Solicitar agendamento"}
            </button>
          </form>
        </div>
      </div>
    </UserGuard>
  );
}