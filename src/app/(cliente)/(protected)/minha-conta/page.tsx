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
    number: string | null;
    complement: string | null;
  };
};

type ViaCepResponse = {
  erro?: boolean;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
};

type PatchMeBody = {
  name: string;
  lastName: string;
  email: string;
  cep: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  number?: string;
  complement?: string;
  password?: string;
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

    const addr =
      address.trim().length > 1 &&
      neighborhood.trim().length > 1 &&
      city.trim().length > 1 &&
      state.trim().length > 1;

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
      const body: PatchMeBody = {
        name: name.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        cep: formatCep(cep),
        address: address.trim(),
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        state: state.trim()
      };

      const n = number.trim();
      const c = complement.trim();
      if (n) body.number = n;
      if (c) body.complement = c;

      const p = password.trim();
      if (p) body.password = p;

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

  const labelCls = "text-sm text-black/80";
  const inputCls = "w-full rounded-xl border bg-white px-4 py-3 outline-none";
  const readOnlyCls = "w-full rounded-xl border bg-[#F2F2F2] px-4 py-3 outline-none";
  const borderColor = { borderColor: "#D7D7D7" as const };

  if (loading) {
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
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelCls}>
                  Nome <span className="text-black/50">(Obrigatório)</span>
                </label>
                <input className={inputCls} style={borderColor} value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <label className={labelCls}>
                  Sobrenome <span className="text-black/50">(Obrigatório)</span>
                </label>
                <input className={inputCls} style={borderColor} value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelCls}>
                E-mail <span className="text-black/50">(Obrigatório)</span>
              </label>
              <input
                className={inputCls}
                style={borderColor}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPass ? "text" : "password"}
                  placeholder="Digite para alterar (opcional)"
                />

                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white"
                  style={borderColor}
                  aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                  title={showPass ? "Ocultar senha" : "Mostrar senha"}
                >
                  <img
                    src={showPass ? "/icons/eye_slash.svg" : "/icons/eye.svg"}
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
                value={cep}
                onChange={(e) => setCep(formatCep(e.target.value))}
                inputMode="numeric"
              />
            </div>

            <div className="space-y-2">
              <label className={labelCls}>Endereço</label>
              <input className={readOnlyCls} style={borderColor} value={address} readOnly />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelCls}>Número</label>
                <input className={inputCls} style={borderColor} value={number} onChange={(e) => setNumber(e.target.value)} />
              </div>

              <div className="space-y-2">
                <label className={labelCls}>Complemento</label>
                <input
                  className={inputCls}
                  style={borderColor}
                  value={complement}
                  onChange={(e) => setComplement(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelCls}>Bairro</label>
              <input className={readOnlyCls} style={borderColor} value={neighborhood} readOnly />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelCls}>Cidade</label>
                <input className={readOnlyCls} style={borderColor} value={city} readOnly />
              </div>

              <div className="space-y-2">
                <label className={labelCls}>Estado</label>
                <input className={readOnlyCls} style={borderColor} value={state} readOnly />
              </div>
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {ok ? <p className="text-sm text-emerald-700">{ok}</p> : null}

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
