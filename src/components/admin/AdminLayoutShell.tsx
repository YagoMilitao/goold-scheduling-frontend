"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [dividerTop, setDividerTop] = useState<number | null>(null);

  useEffect(() => {
    const measure = () => {
      const root = contentRef.current;
      if (!root) return;

      const anchor = root.querySelector<HTMLElement>("#layout-divider-anchor");
      if (!anchor) {
        setDividerTop(null);
        return;
      }

      const rect = anchor.getBoundingClientRect();
      setDividerTop(Math.round(rect.top));
    };

    measure();

    const onResize = () => measure();
    window.addEventListener("resize", onResize);

    const t = window.setTimeout(measure, 0);

    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(t);
    };
  }, [pathname]);

  return (
    <div className="relative flex min-h-screen items-stretch">
      <AdminSidebar />

      <main ref={contentRef} className="flex-1 min-h-full">
        {children}
      </main>

      
    </div>
  );
}
