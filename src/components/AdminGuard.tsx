"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GuardLoading from "./GuardLoading";
import { getToken, getUser } from "@/lib/auth";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState<null | boolean>(null);

  useEffect(() => {
    const token = getToken();
    const user = getUser();

    if (!token || !user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAllowed(false);
      router.replace("/admin/login");
      return;
    }

    if (user.role !== "ADMIN") {
      setAllowed(false);
      router.replace("/admin/login");
      return;
    }

    setAllowed(true);
  }, [router]);

  if (allowed === null) return <GuardLoading />;
  if (!allowed) return null;

  return <>{children}</>;
}
