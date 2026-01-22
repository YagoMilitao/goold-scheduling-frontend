"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { setAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

type RegisterResponse = {
  token: string;
  user: { id: number; name: string; email: string; role: "ADMIN" | "CLIENT" };
};

type ViaCepResponse = {
  erro?: boolean;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
};

const onlyDigits = (v: string) => v.replace(/\D/g, "");

const formatCep = (v: string) => {
  const d = onlyDigits(v).slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
};

export default function CadastroPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [cep, setCep] = useState("");
  const [address, setAddress] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const [cepLoading, setCepLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cepDigits = useMemo(() => onlyDigits(cep), [cep]);

  const requiredOk = useMemo(() => {
    const baseOk = firstName.trim() && lastName.trim() && email.trim() && password.trim() && cepDigits.length === 8;
    const addrOk = address.trim() && neighborhood.trim() && city.trim() && state.trim();
    return !!(baseOk && addrOk && !cepLoading);
  }, [firstName, lastName, email, password, cepDigits, address, neighborhood, city, state, cepLoading]);

  useEffect(() => {
    const run = async () => {
      if (cepDigits.length !== 8) return;

      setError(null);
      setCepLoading(true);

      try {
        const res = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
        const data = (await res.json()) as ViaCepResponse;

        if (data.erro) {
          setAddress("");
          setNeighborhood("");
          setCity("");
          setState("");
          setError("CEP inválido");
          return;
        }

        setAddress(data.logradouro ?? "");
        setNeighborhood(data.bairro ?? "");
        setCity(data.localidade ?? "");
        setState(data.uf ?? "");
      } catch {
        setError("Erro ao buscar CEP");
      } finally {
        setCepLoading(false);
      }
    };

    run();
  }, [cepDigits]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!requiredOk) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch<RegisterResponse>("/auth/register", {
        method: "POST",
        body: {
          name: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
          cep: formatCep(cep),
          address: address.trim(),
          neighborhood: neighborhood.trim(),
          city: city.trim(),
          state: state.trim(),
          number: number.trim() || undefined,
          complement: complement.trim() || undefined
        }
      });

      setAuth(res.token, res.user);
      router.push("/agendamentos");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao cadastrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <header className="flex items-center justify-between px-10 py-6">
        <div className="h-10 w-10 rounded-full bg-white/10" />
        <button className="text-white" type="button" onClick={() => router.push("/")}>
          Login
        </button>
      </header>

      <main className="flex items-start justify-center px-6 pb-16">
        <div className="w-full max-w-md rounded-2xl bg-white p-8">
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm">
                  Nome <span className="opacity-60">(Obrigatorio)</span>
                </label>
                <input
                  className="w-full rounded-xl border px-4 py-3 outline-none"
                  placeholder="ex. Jose"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
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
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPass ? "text" : "password"}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-sm"
                  onClick={() => setShowPass((p) => !p)}
                  aria-label="Mostrar senha"
                >
                  <img
                    src={showPass ? "/icons/eye_slash.svg" : "/icons/eye.svg"}
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
                value={cep}
                onChange={(e) => setCep(formatCep(e.target.value))}
                inputMode="numeric"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm">Endereço</label>
              <input className="w-full rounded-xl border bg-gray-100 px-4 py-3 outline-none" value={address} readOnly />
            </div>

            <div className="space-y-2">
              <label className="text-sm">Número</label>
              <input className="w-full rounded-xl border px-4 py-3 outline-none" value={number} onChange={(e) => setNumber(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm">Complemento</label>
              <input
                className="w-full rounded-xl border px-4 py-3 outline-none"
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm">Bairro</label>
              <input className="w-full rounded-xl border bg-gray-100 px-4 py-3 outline-none" value={neighborhood} readOnly />
            </div>

            <div className="space-y-2">
              <label className="text-sm">Cidade</label>
              <input className="w-full rounded-xl border bg-gray-100 px-4 py-3 outline-none" value={city} readOnly />
            </div>

            <div className="space-y-2">
              <label className="text-sm">Estado</label>
              <input className="w-full rounded-xl border bg-gray-100 px-4 py-3 outline-none" value={state} readOnly />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {cepLoading && <p className="text-sm opacity-70">Buscando CEP...</p>}

            <button
              className={`w-full rounded-xl px-4 py-4 font-semibold text-white ${requiredOk ? "bg-black" : "bg-gray-300"}`}
              disabled={!requiredOk || loading}
              type="submit"
            >
              {loading ? "Cadastrando..." : "Cadastrar-se"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
