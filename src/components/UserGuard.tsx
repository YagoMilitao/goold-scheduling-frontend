"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

const decodeRole = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.role as string | undefined;
  } catch {
    return undefined;
  }
};

export default function UserGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const { token, role } = useMemo(() => {
    const t = getToken();
    return { token: t, role: t ? decodeRole(t) : undefined };
  }, []);

  useEffect(() => {
    if (!token) {
      router.replace("/");
      return;
    }

    if (role !== "CLIENT") {
      router.replace("/admin/login");
    }
  }, [router, token, role]);

  if (!token) return null;
  if (role !== "CLIENT") return null;

  return <>{children}</>;
}
