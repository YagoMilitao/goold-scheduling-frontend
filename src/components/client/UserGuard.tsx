/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GuardLoading from "../ui/GuardLoading";
import { getToken, getUser } from "@/lib/auth";

export default function UserGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setMounted(true);

    const token = getToken();
    const user = getUser();

    if (!token || !user) {
      setAllowed(false);
      router.replace("/");
      return;
    }

    if (user.role !== "CLIENT") {
      setAllowed(false);
      router.replace("/admin/login");
      return;
    }

    setAllowed(true);
  }, [router]);

  if (!mounted) return <GuardLoading />;
  if (!allowed) return null;

  return <>{children}</>;
}
