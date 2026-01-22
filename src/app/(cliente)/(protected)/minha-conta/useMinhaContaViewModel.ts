"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

export function useMinhaContaViewModel() {
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

  const abortRef = useRef<AbortController | null>(null);
  const lastCepRef = useRef<string>("");

  const load = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const run = async () => {
      if (cepDigits.length !== 8) return;
      if (lastCepRef.current === cepDigits) return;

      lastCepRef.current = cepDigits;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setCepLoading(true);
      setError(null);
      setOk(null);

      try {
        const r = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`, {
          signal: controller.signal
        });
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
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError("Erro ao buscar CEP");
      } finally {
        setCepLoading(false);
      }
    };

    run();
  }, [cepDigits]);

  const toggleShowPass = () => setShowPass((p) => !p);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
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
      } catch (e2) {
        setError(e2 instanceof Error ? e2.message : "Erro ao salvar");
      } finally {
        setSaving(false);
      }
    },
    [requiredOk, name, lastName, email, cep, address, neighborhood, city, state, number, complement, password]
  );

  return {
    loading,
    saving,
    cepLoading,
    error,
    ok,
    name,
    setName,
    lastName,
    setLastName,
    email,
    setEmail,
    password,
    setPassword,
    showPass,
    toggleShowPass,
    cep,
    setCep,
    formatCep,
    address,
    number,
    setNumber,
    complement,
    setComplement,
    neighborhood,
    city,
    state,
    requiredOk,
    onSubmit
  };
}