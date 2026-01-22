"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { setAuth } from "@/lib/auth";

type LoginResponse = {
  token: string;
  user: { id: number; name: string; email: string; role: "ADMIN" | "CLIENT" };
};

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("admin@portal.com");
  const [password, setPassword] = useState("Admin@123");
  const [showPass, setShowPass] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return !!email.trim() && !!password.trim() && !loading;
  }, [email, password, loading]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!email.trim() || !password.trim()) throw new Error("Email e senha são obrigatórios");

      const res = await apiFetch<LoginResponse>("/admin/login", {
        method: "POST",
        body: { email, password }
      });

      setAuth(res.token, res.user);
      router.push("/admin/agendamentos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao logar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: "#F6F4F1" }}>
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center">
          <img src="/icons/group_logo.svg" alt="Logo" className="h-10 w-auto" />
          <h1 className="mt-6 text-3xl font-semibold text-black">Login Admin</h1>
        </div>

        <div
          className="mt-8 w-full max-w-xl rounded-md bg-white"
          style={{ border: "1px solid #D7D7D7" }}
        >
          <form onSubmit={onSubmit} className="p-8">
            <div className="space-y-2">
              <label className="text-sm font-medium text-black">
                E-mail <span className="text-black/60">(Obrigatório)</span>
              </label>

              <input
                className="h-12 w-full rounded-md px-4 outline-none"
                style={{ border: "1px solid #D7D7D7" }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPass ? "text" : "password"}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 hover:bg-black/5"
                  aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                  title={showPass ? "Ocultar senha" : "Mostrar senha"}
                >
                  <img
                    src={showPass ? "/icons/eye.svg": "/icons/eye_slash.svg"}
                    alt=""
                    className="h-5 w-5 opacity-80"
                  />
                </button>
              </div>
            </div>

            {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

            <button
              disabled={!canSubmit}
              className="mt-6 h-12 w-full rounded-md bg-black font-semibold text-white disabled:opacity-40"
              type="submit"
            >
              {loading ? "Entrando..." : "Acessar conta"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
