"use client";

import AdminGuard from "@/components/AdminGuard";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-white">
        <div className="flex min-h-screen">
          <AdminSidebar />
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </AdminGuard>
  );
}
