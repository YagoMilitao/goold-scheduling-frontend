"use client";

import ClientSidebar from "@/components/ClientSidebar";
import UserGuard from "@/components/UserGuard";


export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserGuard>
      <div className="min-h-screen bg-white">
        <div className="flex min-h-screen">
          <ClientSidebar />
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </UserGuard>
  );
}
