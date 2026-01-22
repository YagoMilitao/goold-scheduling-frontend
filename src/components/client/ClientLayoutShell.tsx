"use client";

import ClientSidebar from "./ClientSidebar";

export default function ClientLayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-70 self-stretch border-r" style={{ borderColor: "#D7D7D7", backgroundColor: "#F6F4F1" }}>
        <div className="sticky top-0 h-screen">
          <ClientSidebar />
        </div>
      </aside>

      <main className="flex-1 min-h-screen">
        {children}
      </main>
    </div>
  );
}
