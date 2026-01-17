"use client";

import { useState } from "react";
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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border p-6">
        <h1 className="text-xl font-semibold">Login Admin</h1>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm">Email</label>
            <input
              className="w-full rounded-xl border px-4 py-3 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm">Senha</label>
            <input
              className="w-full rounded-xl border px-4 py-3 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button disabled={loading} className="w-full rounded-xl border px-4 py-3 font-medium disabled:opacity-60">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
