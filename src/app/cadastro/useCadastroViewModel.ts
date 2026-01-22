"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { setAuth } from "@/lib/auth";

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

export default function useCadastroViewModel() {
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
    const baseOk =
      firstName.trim() &&
      lastName.trim() &&
      email.trim() &&
      password.trim() &&
      cepDigits.length === 8;

    const addrOk = address.trim() && neighborhood.trim() && city.trim() && state.trim();

    return !!(baseOk && addrOk && !cepLoading && !loading);
  }, [
    firstName,
    lastName,
    email,
    password,
    cepDigits,
    address,
    neighborhood,
    city,
    state,
    cepLoading,
    loading
  ]);


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

  const goLogin = () => router.push("/");

  const toggleShowPass = () => setShowPass((p) => !p);

  const onChangeCep = (v: string) => setCep(formatCep(v));

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

  return {
    firstName,
    lastName,
    email,
    password,
    showPass,
    cep,
    address,
    number,
    complement,
    neighborhood,
    city,
    state,
    cepLoading,
    loading,
    error,
    requiredOk,
    setFirstName,
    setLastName,
    setEmail,
    setPassword,
    setNumber,
    setComplement,
    onChangeCep,
    toggleShowPass,
    goLogin,
    onSubmit
  };
}