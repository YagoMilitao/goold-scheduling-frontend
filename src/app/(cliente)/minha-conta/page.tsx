/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import { apiFetch } from "@/lib/api";
import { updateStoredUser } from "@/lib/auth";

type MeResponse = {
  user: {
    id: number;
    name: string;
    lastName: string;
    email: string;
    cep: string;
    address: string;
    neighborhood: string;
    city: string;
    state: string;
    number: string;
    complement: string;
  };
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

export default function MinhaContaPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [name, setName] = useState("");
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

  const cepDigits = useMemo(() => onlyDigits(cep), [cep]);

  const requiredOk = useMemo(() => {
    const base =
      name.trim().length >= 2 &&
      lastName.trim().length >= 2 &&
      email.trim().length > 3 &&
      cepDigits.length === 8;

    const addr = address.trim().length > 1 && neighborhood.trim().length > 1 && city.trim().length > 1 && state.trim().length > 1;

    return base && addr && !cepLoading && !saving;
  }, [name, lastName, email, cepDigits, address, neighborhood, city, state, cepLoading, saving]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      setOk(null);

      try {
        const res = await apiFetch<MeResponse>("/me", { auth: true });

        setName(res.user.name ?? "");
        setLastName(res.user.lastName ?? "");
        setEmail(res.user.email ?? "");

        setCep(res.user.cep ?? "");
        setAddress(res.user.address ?? "");
        setNeighborhood(res.user.neighborhood ?? "");
        setCity(res.user.city ?? "");
        setState(res.user.state ?? "");
        setNumber(res.user.number ?? "");
        setComplement(res.user.complement ?? "");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const run = async () => {
      if (cepDigits.length !== 8) return;

      setCepLoading(true);
      setError(null);
      setOk(null);

      try {
        const r = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
        const data = (await r.json()) as ViaCepResponse;

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
    setOk(null);

    if (!requiredOk) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    setSaving(true);

    try {
      const body: any = {
        name: name.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        cep: formatCep(cep),
        address: address.trim(),
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        state: state.trim(),
        number: number.trim() || undefined,
        complement: complement.trim() || undefined
      };

      if (password.trim()) body.password = password;

      const res = await apiFetch<MeResponse>("/me", {
        method: "PATCH",
        auth: true,
        body
      });

      setPassword("");
      setShowPass(false);

      updateStoredUser({
        name: res.user.name,
        email: res.user.email
      });

      setOk("Dados atualizados com sucesso");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const toolbar = (
    <div className="flex items-center justify-end">
      <div className="text-sm text-black/60">{cepLoading ? "Buscando CEP..." : ""}</div>
    </div>
  );

  if (loading) {
    return (
      <PageShell title="Minha conta" subtitle="Ajuste informações da sua conta de forma simples" toolbar={toolbar}>
        <div className="h-full w-full rounded-2xl border p-6">Carregando...</div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Minha conta" subtitle="Ajuste informações da sua conta de forma simples" toolbar={toolbar}>
      <div className="flex w-full items-start justify-center px-6 py-10">
        <div className="w-full max-w-xl rounded-2xl border bg-white p-8">
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm">
                  Nome <span className="opacity-60">(Obrigatorio)</span>
                </label>
                <input className="w-full rounded-xl border px-4 py-3 outline-none" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <label className="text-sm">
                  Sobrenome <span className="opacity-60">(Obrigatorio)</span>
                </label>
                <input className="w-full rounded-xl border px-4 py-3 outline-none" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm">
                E-mail <span className="opacity-60">(Obrigatorio)</span>
              </label>
              <input className="w-full rounded-xl border px-4 py-3 outline-none" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
            </div>

            <div className="space-y-2">
              <label className="text-sm">
                Senha de acesso <span className="opacity-60">(Obrigatorio)</span>
              </label>
              <div className="relative">
                <input
                  className="w-full rounded-xl border px-4 py-3 pr-12 outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPass ? "text" : "password"}
                  placeholder="Digite para alterar (opcional)"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg border px-2 py-1 text-sm"
                  onClick={() => setShowPass((p) => !p)}
                  aria-label="Mostrar senha"
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
              <div className="text-xs text-black/50">Se deixar em branco, a senha não muda.</div>
            </div>

            <div className="space-y-2">
              <label className="text-sm">
                CEP <span className="opacity-60">(Obrigatorio)</span>
              </label>
              <input
                className="w-full rounded-xl border px-4 py-3 outline-none"
                value={cep}
                onChange={(e) => setCep(formatCep(e.target.value))}
                inputMode="numeric"
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
              <input className="w-full rounded-xl border px-4 py-3 outline-none" value={complement} onChange={(e) => setComplement(e.target.value)} />
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
            {ok && <p className="text-sm text-emerald-700">{ok}</p>}

            <button
              type="submit"
              disabled={!requiredOk}
              className="w-full rounded-xl bg-black px-4 py-4 font-semibold text-white disabled:opacity-40"
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
