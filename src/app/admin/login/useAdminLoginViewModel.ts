"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { setAuth } from "@/lib/auth";

type LoginResponse = {
  token: string;
  user: { id: number; name: string; email: string; role: "ADMIN" | "CLIENT" };
};

export default function useAdminLoginViewModel() {
  const router = useRouter();

  const [email, setEmail] = useState("admin@portal.com");
  const [password, setPassword] = useState("Admin@123");
  const [showPass, setShowPass] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return !!email.trim() && !!password.trim() && !loading;
  }, [email, password, loading]);

  const toggleShowPass = useCallback(() => {
    setShowPass((p) => !p);
  }, []);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
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
    },
    [email, password, router]
  );

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPass,
    toggleShowPass,
    error,
    loading,
    canSubmit,
    onSubmit
  };
}