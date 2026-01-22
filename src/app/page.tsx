"use client";

import useClientLoginViewModel from "./useClientLoginViewModel";

export default function ClientLoginPage() {
  const vm = useClientLoginViewModel();

  return (
    <div className="min-h-screen bg-[#f5f1ed]">
      <header className="flex items-center justify-between px-10 py-6">
        <div className="h-10 w-10">
          <img src="/icons/group_logo.svg" alt="Logo" className="h-10 w-auto" />
        </div>

        <button
          className="rounded-xl bg-black px-10 py-3 font-medium text-white"
          type="button"
          onClick={vm.goCadastro}
        >
          Cadastre-se
        </button>
      </header>

      <main className="flex min-h-[calc(100vh-96px)] items-start justify-center px-6 pt-24">
        <div className="w-full max-w-md">
          <h1 className="text-center text-3xl font-semibold text-black">
            Entre na sua conta
          </h1>

          <div className="mt-10 rounded-2xl border border-black/10 bg-white px-8 py-8 shadow-sm">
            <form onSubmit={vm.onSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm text-black">
                  E-mail <span className="text-black/60">(Obrigatorio)</span>
                </label>
                <input
                  className="w-full rounded-xl border border-black/15 px-4 py-3 outline-none"
                  placeholder="Insira seu e-mail"
                  value={vm.email}
                  onChange={(e) => vm.setEmail(e.target.value)}
                  type="email"
                  required
                />
              </div>

              {vm.emailChecked && vm.emailExists ? (
                <div className="space-y-2">
                  <label className="text-sm text-black">
                    Senha de acesso <span className="text-black/60">(Obrigatorio)</span>
                  </label>

                  <div className="relative">
                    <input
                      className="w-full rounded-xl border border-black/15 px-4 py-3 pr-12 outline-none"
                      value={vm.password}
                      onChange={(e) => vm.setPassword(e.target.value)}
                      type={vm.showPass ? "text" : "password"}
                      required
                    />

                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg border-black/10 px-2 py-1 text-sm"
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
              ) : null}

              {vm.error ? <p className="text-sm text-red-600">{vm.error}</p> : null}

              <button
                className={`w-full rounded-xl px-4 py-4 font-semibold text-white ${
                  vm.canSubmit ? "bg-black" : "bg-black/20"
                }`}
                disabled={!vm.canSubmit || vm.loading}
                type="submit"
              >
                {vm.loading ? "Aguarde..." : "Acessar conta"}
              </button>

              <div className="flex items-center justify-between pt-2 text-sm">
                <span className="text-black/70">Ainda não tem um cadastro?</span>
                <button className="font-semibold underline" type="button" onClick={vm.goCadastro}>
                  Cadastre-se
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}