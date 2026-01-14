"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) router.replace("/admin/login");
  }, [router]);

  return <>{children}</>;
}
