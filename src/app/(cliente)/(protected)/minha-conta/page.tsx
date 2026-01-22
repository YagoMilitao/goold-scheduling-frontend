"use client";

import PageShell from "@/components/PageShell";
import { useMinhaContaViewModel } from "./useMinhaContaViewModel";

export default function MinhaContaPage() {
  const vm = useMinhaContaViewModel();

  const toolbar = (
    <div className="flex items-center justify-end">
      <div className="text-sm text-black/60">{vm.cepLoading ? "Buscando CEP..." : ""}</div>
    </div>
  );

  const labelCls = "text-sm text-black/80";
  const inputCls = "w-full rounded-xl border bg-white px-4 py-3 outline-none";
  const readOnlyCls = "w-full rounded-xl border bg-[#F2F2F2] px-4 py-3 outline-none";
  const borderColor = { borderColor: "#D7D7D7" as const };

  if (vm.loading) {
    return (
      <PageShell title="Minha conta" subtitle="Ajuste informações da sua conta de forma simples" toolbar={toolbar}>
        <div className="h-full w-full rounded-2xl border p-6" style={borderColor}>
          Carregando...
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Minha conta" subtitle="Ajuste informações da sua conta de forma simples" toolbar={toolbar}>
      <div className="flex w-full items-start justify-center px-6 py-10">
        <div className="w-full max-w-xl rounded-2xl border bg-white p-8" style={borderColor}>
          <form onSubmit={vm.onSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelCls}>
                  Nome <span className="text-black/50">(Obrigatório)</span>
                </label>
                <input className={inputCls} style={borderColor} value={vm.name} onChange={(e) => vm.setName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <label className={labelCls}>
                  Sobrenome <span className="text-black/50">(Obrigatório)</span>
                </label>
                <input
                  className={inputCls}
                  style={borderColor}
                  value={vm.lastName}
                  onChange={(e) => vm.setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelCls}>
                E-mail <span className="text-black/50">(Obrigatório)</span>
              </label>
              <input
                className={inputCls}
                style={borderColor}
                value={vm.email}
                onChange={(e) => vm.setEmail(e.target.value)}
                type="email"
              />
            </div>

            <div className="space-y-2">
              <label className={labelCls}>
                Senha de acesso <span className="text-black/50">(Opcional)</span>
              </label>

              <div className="relative">
                <input
                  className={`${inputCls} pr-12`}
                  style={borderColor}
                  value={vm.password}
                  onChange={(e) => vm.setPassword(e.target.value)}
                  type={vm.showPass ? "text" : "password"}
                  placeholder="Digite para alterar (opcional)"
                />

                <button
                  type="button"
                  onClick={vm.toggleShowPass}
                  className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white"
                  style={borderColor}
                  aria-label={vm.showPass ? "Ocultar senha" : "Mostrar senha"}
                  title={vm.showPass ? "Ocultar senha" : "Mostrar senha"}
                >
                  <img
                    src={vm.showPass ? "/icons/eye_slash.svg" : "/icons/eye.svg"}
                    alt=""
                    className="h-4 w-4 opacity-70"
                  />
                </button>
              </div>

              <div className="text-xs text-black/50">Se deixar em branco, a senha não muda.</div>
            </div>

            <div className="space-y-2">
              <label className={labelCls}>
                CEP <span className="text-black/50">(Obrigatório)</span>
              </label>
              <input
                className={inputCls}
                style={borderColor}
                value={vm.cep}
                onChange={(e) => vm.setCep(vm.formatCep(e.target.value))}
                inputMode="numeric"
              />
            </div>

            <div className="space-y-2">
              <label className={labelCls}>Endereço</label>
              <input className={readOnlyCls} style={borderColor} value={vm.address} readOnly />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelCls}>Número</label>
                <input
                  className={inputCls}
                  style={borderColor}
                  value={vm.number}
                  onChange={(e) => vm.setNumber(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className={labelCls}>Complemento</label>
                <input
                  className={inputCls}
                  style={borderColor}
                  value={vm.complement}
                  onChange={(e) => vm.setComplement(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelCls}>Bairro</label>
              <input className={readOnlyCls} style={borderColor} value={vm.neighborhood} readOnly />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelCls}>Cidade</label>
                <input className={readOnlyCls} style={borderColor} value={vm.city} readOnly />
              </div>

              <div className="space-y-2">
                <label className={labelCls}>Estado</label>
                <input className={readOnlyCls} style={borderColor} value={vm.state} readOnly />
              </div>
            </div>

            {vm.error ? <p className="text-sm text-red-600">{vm.error}</p> : null}
            {vm.ok ? <p className="text-sm text-emerald-700">{vm.ok}</p> : null}

            <button
              type="submit"
              disabled={!vm.requiredOk}
              className="w-full rounded-xl bg-black px-4 py-4 font-semibold text-white disabled:opacity-40"
            >
              {vm.saving ? "Salvando..." : "Salvar"}
            </button>
          </form>
        </div>
      </div>
    </PageShell>
  );
}