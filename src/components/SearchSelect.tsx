"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  fetchOptions: (query: string) => Promise<string[]>;
  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
};

/** A combobox: type to filter, pick from the dropdown. Committed value only
 * changes when an option is actually selected (typing alone doesn't commit),
 * so callers can rely on `value` always being a real option from the list. */
export default function SearchSelect({
  value,
  onChange,
  fetchOptions,
  placeholder,
  disabled,
  ariaLabel,
  className,
}: Props) {
  const [query, setQuery] = useState(value);
  const [options, setOptions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchOptions(query).then(setOptions);
    }, 150);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery(value);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  function selectOption(opt: string) {
    onChange(opt);
    setQuery(opt);
    setOpen(false);
  }

  function handleFocus() {
    if (disabled) return;
    setOpen(true);
    setHighlighted(0);
    fetchOptions(query).then(setOptions);
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        aria-label={ariaLabel}
        className={className}
        placeholder={placeholder}
        value={query}
        disabled={disabled}
        onFocus={handleFocus}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setHighlighted(0);
        }}
        onKeyDown={(e) => {
          if (!open) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlighted((h) => Math.min(h + 1, options.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlighted((h) => Math.max(h - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            if (options[highlighted]) selectOption(options[highlighted]);
          } else if (e.key === "Escape") {
            setOpen(false);
            setQuery(value);
          }
        }}
      />
      {open && options.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg text-sm">
          {options.map((opt, i) => (
            <li key={opt}>
              <button
                type="button"
                className={`block w-full text-left px-3 py-2 hover:bg-blue-50 ${
                  i === highlighted ? "bg-blue-50" : ""
                }`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectOption(opt)}
              >
                {opt}
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && options.length === 0 && query && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg text-sm px-3 py-2 text-slate-400">
          ไม่พบรายการที่ตรงกัน
        </div>
      )}
    </div>
  );
}
