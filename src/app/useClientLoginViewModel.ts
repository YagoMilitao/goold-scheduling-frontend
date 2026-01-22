"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { setAuth } from "@/lib/auth";

type EmailExistsResponse = { exists: boolean };
type LoginResponse = {
  token: string;
  user: { id: number; name: string; email: string; role: "CLIENT" | "ADMIN" };
};

export default function useClientLoginViewModel() {
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

  const resetAuthStep = () => {
    setEmailChecked(false);
    setEmailExists(false);
    setPassword("");
    setError(null);
  };

  useEffect(() => {
    resetAuthStep();
  }, [email]);

  const goCadastro = () => router.push("/cadastro");

  const toggleShowPass = () => setShowPass((p) => !p);

  const onCheckEmail = async () => {
    setError(null);
    setLoading(true);

    try {
      const cleanEmail = email.trim();
      const res = await apiFetch<EmailExistsResponse>(
        `/auth/email-exists?email=${encodeURIComponent(cleanEmail)}`
      );

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
      setError(e instanceof Error ? e.message : "Email ou senha estão errados");
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

  return {
    email,
    emailChecked,
    emailExists,
    password,
    showPass,
    loading,
    error,
    canSubmit,
    setEmail,
    setPassword,
    toggleShowPass,
    goCadastro,
    onSubmit
  };
}