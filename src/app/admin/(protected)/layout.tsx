"use client";

import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayoutShell from "@/components/admin/AdminLayoutShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminLayoutShell>{children}</AdminLayoutShell>
    </AdminGuard>
  );
}
