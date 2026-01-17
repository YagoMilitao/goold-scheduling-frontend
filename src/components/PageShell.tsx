"use client";

export default function PageShell({
  title,
  subtitle,
  toolbar,
  children,
  footer
}: {
  title: string;
  subtitle: string;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="p-10">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="text-sm text-black/60">{subtitle}</p>
      </div>

      <div className="mt-8 rounded-2xl border">
        {toolbar ? <div className="border-b p-6">{toolbar}</div> : null}
        <div className="min-h-[520px] p-6">{children}</div>
        {footer ? <div className="border-t p-6">{footer}</div> : null}
      </div>
    </div>
  );
}
