"use client";

import useAdminLoginViewModel from "./useAdminLoginViewModel";

export default function AdminLoginPage() {
  const vm = useAdminLoginViewModel();

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: "#F6F4F1" }}>
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center">
          <img src="/icons/group_logo.svg" alt="Logo" className="h-10 w-auto" />
          <h1 className="mt-6 text-3xl font-semibold text-black">Login Admin</h1>
        </div>

        <div className="mt-8 w-full max-w-xl rounded-md bg-white" style={{ border: "1px solid #D7D7D7" }}>
          <form onSubmit={vm.onSubmit} className="p-8">
            <div className="space-y-2">
              <label className="text-sm font-medium text-black">
                E-mail <span className="text-black/60">(Obrigatório)</span>
              </label>

              <input
                className="h-12 w-full rounded-md px-4 outline-none"
                style={{ border: "1px solid #D7D7D7" }}
                value={vm.email}
                onChange={(e) => vm.setEmail(e.target.value)}
                type="email"
                required
              />
            </div>

            <div className="mt-5 space-y-2">
              <label className="text-sm font-medium text-black">
                Senha de acesso <span className="text-black/60">(Obrigatório)</span>
              </label>

              <div className="relative">
                <input
                  className="h-12 w-full rounded-md px-4 pr-12 outline-none"
                  style={{ border: "1px solid #D7D7D7" }}
                  value={vm.password}
                  onChange={(e) => vm.setPassword(e.target.value)}
                  type={vm.showPass ? "text" : "password"}
                  required
                />

                <button
                  type="button"
                  onClick={vm.toggleShowPass}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 hover:bg-black/5"
                  aria-label={vm.showPass ? "Ocultar senha" : "Mostrar senha"}
                  title={vm.showPass ? "Ocultar senha" : "Mostrar senha"}
                >
                  <img
                    src={vm.showPass ? "/icons/eye_slash.svg" : "/icons/eye.svg"}
                    alt=""
                    className="h-5 w-5 opacity-80"
                  />
                </button>
              </div>
            </div>

            {vm.error ? <p className="mt-4 text-sm text-red-600">{vm.error}</p> : null}

            <button
              disabled={!vm.canSubmit}
              className="mt-6 h-12 w-full rounded-md bg-black font-semibold text-white disabled:opacity-40"
              type="submit"
            >
              {vm.loading ? "Entrando..." : "Acessar conta"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}