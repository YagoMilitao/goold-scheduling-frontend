/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import GuardLoading from "../ui/GuardLoading";
import { getToken, getUser } from "@/lib/auth";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const auth = useMemo(() => {
    const token = getToken();
    const user = getUser();
    return { token, user };
  }, []);

  useEffect(() => {
    setMounted(true);

    if (!auth.token || !auth.user) {
      router.replace("/admin/login");
      return;
    }

    if (auth.user.role !== "ADMIN") {
      router.replace("/");
      return;
    }
  }, [router, auth.token, auth.user]);

  if (!mounted) return <GuardLoading />;

  if (!auth.token || !auth.user) return null;
  if (auth.user.role !== "ADMIN") return null;

  return <>{children}</>;
}
