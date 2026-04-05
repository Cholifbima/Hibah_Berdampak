"use client";

import type { ReactNode } from "react";

interface AuthUnderlineFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  required?: boolean;
  autoComplete?: string;
  rightSlot?: ReactNode;
}

export default function AuthUnderlineField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  autoComplete,
  rightSlot,
}: AuthUnderlineFieldProps) {
  return (
    <div className="w-full">
      <label htmlFor={id} className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-white sm:text-xs">
        {label}
      </label>
      <div className="relative flex items-center border-b-2 border-white/35 pb-1.5 transition-colors focus-within:border-white">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className="w-full min-w-0 flex-1 bg-transparent py-1 text-sm text-white placeholder:text-white/45 focus:outline-none sm:text-base"
        />
        {rightSlot}
      </div>
    </div>
  );
}
