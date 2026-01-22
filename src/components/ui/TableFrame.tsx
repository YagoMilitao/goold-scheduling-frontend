"use client";

import React from "react";

export function TableFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border" style={{ borderColor: "#D7D7D7" }}>
      <div className="px-7.5">{children}</div>
    </div>
  );
}

export function Table({ children, minWidth = 980 }: { children: React.ReactNode; minWidth?: number }) {
  return (
    <table className="w-full border-collapse" style={{ minWidth }}>
      {children}
    </table>
  );
}

export function Th({
  children,
  align = "left"
}: {
  children: React.ReactNode;
  align?: "left" | "center" | "right";
}) {
  const cls =
    align === "left"
      ? "text-left"
      : align === "center"
        ? "text-center"
        : "text-right";

  return <th className={`${cls} py-5 pr-6 text-sm font-medium text-black/70`}>{children}</th>;
}

export function Td({
  children,
  align = "left",
  className = ""
}: {
  children: React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
}) {
  const cls =
    align === "left"
      ? "text-left"
      : align === "center"
        ? "text-center"
        : "text-right";

  return <td className={`${cls} py-6 pr-6 ${className}`}>{children}</td>;
}

export function Tr({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <tr className={className} style={{ borderBottom: "1px solid #D7D7D7" }}>
      {children}
    </tr>
  );
}

export function TheadRow({ children }: { children: React.ReactNode }) {
  return (
    <tr style={{ borderBottom: "1px solid #D7D7D7" }}>
      {children}
    </tr>
  );
}
