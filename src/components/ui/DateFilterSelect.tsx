"use client";

import { useCallback, useMemo, useRef } from "react";

type DateFilterProps = {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  iconSrc: string;
  className?: string;
};

type DateInputWithPicker = HTMLInputElement & {
  showPicker?: () => void;
};

export default function DateFilter({
  value,
  onChange,
  placeholder = "Selecione",
  iconSrc,
  className
}: DateFilterProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const label = useMemo(() => {
    if (!value) return placeholder;
    const [yyyy, mm, dd] = value.split("-");
    if (!yyyy || !mm || !dd) return placeholder;
    return `${dd}/${mm}/${yyyy}`;
  }, [value, placeholder]);

  const openPicker = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;

    const pickerEl = el as DateInputWithPicker;

    if (typeof pickerEl.showPicker === "function") {
      pickerEl.showPicker();
      return;
    }

    el.focus();
    el.click();
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <div className={`relative ${className ?? ""}`}>
      <div
        role="button"
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") openPicker();
        }}
        className="flex w-52 cursor-pointer items-center justify-between rounded-xl border bg-white px-4 py-3 text-black/60"
        aria-label="Selecionar data"
        title="Selecionar data"
      >
        <span className={value ? "text-black/80" : ""}>{label}</span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openPicker();
          }}
          className="inline-flex h-5 w-5 items-center justify-center rounded-lg hover:bg-black/5"
          aria-label="Abrir calendário"
          title="Abrir calendário"
        >
          <img src={iconSrc} alt="" className="h-4 w-4" />
        </button>
      </div>

      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={handleChange}
        className="pointer-events-none absolute left-0 top-0 h-0 w-0 opacity-0"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
}
