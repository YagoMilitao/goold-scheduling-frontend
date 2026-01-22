"use client";

import ClientLayoutShell from "@/components/client/ClientLayoutShell";
import UserGuard from "@/components/client/UserGuard";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserGuard>
      <ClientLayoutShell>{children}</ClientLayoutShell>
    </UserGuard>
  );
}
