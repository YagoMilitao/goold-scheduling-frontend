"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { setAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

type EmailExistsResponse = { exists: boolean };
type LoginResponse = { token: string; user: { id: number; name: string; email: string; role: "CLIENT" | "ADMIN" } };

export default function ClientLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [emailChecked, setEmailChecked] = useState(false);
  const [emailExists, setEmailExists] = useState(false);

  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!email.trim()) return false;
    if (!emailChecked) return true;
    if (!emailExists) return false;
    return !!password.trim();
  }, [email, emailChecked, emailExists, password]);

  const onCheckEmail = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await apiFetch<EmailExistsResponse>(`/auth/email-exists?email=${encodeURIComponent(email.trim())}`);
      setEmailChecked(true);
      setEmailExists(res.exists);
      if (!res.exists) setError("Email ou senha estão errados");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao validar email");
    } finally {
      setLoading(false);
    }
  };

  const onLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: { email: email.trim(), password }
      });

      setAuth(res.token, res.user);
      router.push("/agendamentos");
    } catch (e) {
      setError(`Email ou senha estão errados ${e}`);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailChecked) {
      await onCheckEmail();
      return;
    }

    if (emailExists) {
      await onLogin();
      return;
    }

    setError("Email ou senha estão errados");
  };

  useEffect(() => {
    setEmailChecked(false);
    setEmailExists(false);
    setPassword("");
    setError(null);
  }, [email]);

  return (
    <div className="min-h-screen bg-[#f5f1ed]">
      <header className="flex items-center justify-between px-10 py-6">
        <div className="h-10 w-10 rounded-full bg-black/10" />
        <button
          className="rounded-xl bg-black px-10 py-3 font-medium text-white"
          type="button"
          onClick={() => router.push("/cadastro")}
        >
          Cadastre-se
        </button>
      </header>

      <main className="flex min-h-[calc(100vh-96px)] items-start justify-center px-6 pt-24">
        <div className="w-full max-w-md">
          <h1 className="text-center text-3xl font-semibold text-black">Entre na sua conta</h1>

          <div className="mt-10 rounded-2xl border border-black/10 bg-white px-8 py-8 shadow-sm">
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm text-black">
                  E-mail <span className="text-black/60">(Obrigatorio)</span>
                </label>
                <input
                  className="w-full rounded-xl border border-black/15 px-4 py-3 outline-none"
                  placeholder="Insira seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                />
              </div>

              {emailChecked && emailExists && (
                <div className="space-y-2">
                  <label className="text-sm text-black">
                    Senha de acesso <span className="text-black/60">(Obrigatorio)</span>
                  </label>

                  <div className="relative">
                    <input
                      className="w-full rounded-xl border border-black/15 px-4 py-3 pr-12 outline-none"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={showPass ? "text" : "password"}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg border-black/10 px-2 py-1 text-sm"
                      onClick={() => setShowPass((p) => !p)}
                      aria-label="Mostrar senha"
                    >
                      {showPass ? "/icons/eye_slash.svg" : "/icons/eye.svg"}
                    </button>
                  </div>
                </div>
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                className={`w-full rounded-xl px-4 py-4 font-semibold text-white ${
                  canSubmit ? "bg-black" : "bg-black/20"
                }`}
                disabled={!canSubmit || loading}
                type="submit"
              >
                {loading ? "Aguarde..." : "Acessar conta"}
              </button>

              <div className="flex items-center justify-between pt-2 text-sm">
                <span className="text-black/70">Ainda não tem um cadastro?</span>
                <button className="font-semibold underline" type="button" onClick={() => router.push("/cadastro")}>
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
