import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ className, id, label, name, ...props }: InputProps) {
  const inputId = id ?? name;

  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700" htmlFor={inputId}>
      {label}
      <input
        id={inputId}
        name={name}
        className={cn(
          "h-11 rounded-md border border-border-soft bg-white px-3 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-blue focus:ring-4 focus:ring-blue-100",
          className,
        )}
        {...props}
      />
    </label>
  );
}

