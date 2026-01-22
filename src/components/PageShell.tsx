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
    <div className="px-10 pt-10">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="text-sm text-black/60">{subtitle}</p>
      </div>

      <div id="layout-divider-anchor" className="mt-8" />

      <div className="pb-10">
        <div className="border border-[#D7D7D7]">
          {toolbar ? <div className=" p-6">{toolbar}</div> : null}
          <div className="min-h-130 p-6">{children}</div>
        </div>
        {footer ? <div className="p-6">{footer}</div> : null}
      </div>
    </div>
  );
}
