"use client";

import useCadastroViewModel from "./useCadastroViewModel";

export default function CadastroPage() {
  const vm = useCadastroViewModel();

  return (
    <div className="min-h-screen bg-black">
      <header className="flex items-center justify-between px-10 py-6">
        <div className="h-10 w-10 rounded-full bg-white/10" />
        <button className="text-white" type="button" onClick={vm.goLogin}>
          Login
        </button>
      </header>

      <main className="flex items-start justify-center px-6 pb-16">
        <div className="w-full max-w-md rounded-2xl bg-white p-8">
          <form onSubmit={vm.onSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm">
                  Nome <span className="opacity-60">(Obrigatorio)</span>
                </label>
                <input
                  className="w-full rounded-xl border px-4 py-3 outline-none"
                  placeholder="ex. Jose"
                  value={vm.firstName}
                  onChange={(e) => vm.setFirstName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm">
                  Sobrenome <span className="opacity-60">(Obrigatorio)</span>
                </label>
                <input
                  className="w-full rounded-xl border px-4 py-3 outline-none"
                  placeholder="ex. Lima"
                  value={vm.lastName}
                  onChange={(e) => vm.setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm">
                E-mail <span className="opacity-60">(Obrigatorio)</span>
              </label>
              <input
                className="w-full rounded-xl border px-4 py-3 outline-none"
                placeholder="Insira seu e-mail"
                value={vm.email}
                onChange={(e) => vm.setEmail(e.target.value)}
                type="email"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm">
                Senha de acesso <span className="opacity-60">(Obrigatorio)</span>
              </label>
              <div className="relative">
                <input
                  className="w-full rounded-xl border px-4 py-3 pr-12 outline-none"
                  placeholder="Insira sua senha"
                  value={vm.password}
                  onChange={(e) => vm.setPassword(e.target.value)}
                  type={vm.showPass ? "text" : "password"}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-sm"
                  onClick={vm.toggleShowPass}
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
            </div>

            <div className="space-y-2">
              <label className="text-sm">
                CEP <span className="opacity-60">(Obrigatorio)</span>
              </label>
              <input
                className="w-full rounded-xl border px-4 py-3 outline-none"
                placeholder="Insira seu CEP"
                value={vm.cep}
                onChange={(e) => vm.onChangeCep(e.target.value)}
                inputMode="numeric"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm">Endereço</label>
              <input className="w-full rounded-xl border bg-gray-100 px-4 py-3 outline-none" value={vm.address} readOnly />
            </div>

            <div className="space-y-2">
              <label className="text-sm">Número</label>
              <input
                className="w-full rounded-xl border px-4 py-3 outline-none"
                value={vm.number}
                onChange={(e) => vm.setNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm">Complemento</label>
              <input
                className="w-full rounded-xl border px-4 py-3 outline-none"
                value={vm.complement}
                onChange={(e) => vm.setComplement(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm">Bairro</label>
              <input className="w-full rounded-xl border bg-gray-100 px-4 py-3 outline-none" value={vm.neighborhood} readOnly />
            </div>

            <div className="space-y-2">
              <label className="text-sm">Cidade</label>
              <input className="w-full rounded-xl border bg-gray-100 px-4 py-3 outline-none" value={vm.city} readOnly />
            </div>

            <div className="space-y-2">
              <label className="text-sm">Estado</label>
              <input className="w-full rounded-xl border bg-gray-100 px-4 py-3 outline-none" value={vm.state} readOnly />
            </div>

            {vm.error ? <p className="text-sm text-red-600">{vm.error}</p> : null}
            {vm.cepLoading ? <p className="text-sm opacity-70">Buscando CEP...</p> : null}

            <button
              className={`w-full rounded-xl px-4 py-4 font-semibold text-white ${vm.requiredOk ? "bg-black" : "bg-gray-300"}`}
              disabled={!vm.requiredOk || vm.loading}
              type="submit"
            >
              {vm.loading ? "Cadastrando..." : "Cadastrar-se"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}