"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function CadastroPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOk(null);
    setLoading(true);

    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: { name: name.trim(), email: email.trim(), password }
      });

      setOk("Cadastro criado. Agora faça login.");
      setTimeout(() => router.push("/"), 600);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao cadastrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f1ed]">
      <header className="flex items-center justify-between px-10 py-6">
        <div className="h-10 w-10 rounded-full bg-black/10" />
        <button className="rounded-xl border px-10 py-3 font-medium" type="button" onClick={() => router.push("/")}>
          Voltar
        </button>
      </header>

      <main className="flex min-h-[calc(100vh-96px)] items-start justify-center px-6 pt-24">
        <div className="w-full max-w-md">
          <h1 className="text-center text-3xl font-semibold text-black">Cadastre-se</h1>

          <div className="mt-10 rounded-2xl border border-black/10 bg-white px-8 py-8 shadow-sm">
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm text-black">Nome</label>
                <input
                  className="w-full rounded-xl border border-black/15 px-4 py-3 outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-black">E-mail</label>
                <input
                  className="w-full rounded-xl border border-black/15 px-4 py-3 outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-black">Senha</label>
                <input
                  className="w-full rounded-xl border border-black/15 px-4 py-3 outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  required
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}
              {ok && <p className="text-sm text-green-700">{ok}</p>}

              <button className="w-full rounded-xl bg-black px-4 py-4 font-semibold text-white disabled:opacity-60" disabled={loading}>
                {loading ? "Criando..." : "Criar conta"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
