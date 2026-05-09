import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  label?: string;
};

export function Input({ className, error, id, label, name, ...props }: InputProps) {
  const inputId = id ?? name;
  const errorId = error && inputId ? `${inputId}-error` : undefined;

  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700" htmlFor={inputId}>
      {label}
      <input
        aria-describedby={errorId}
        aria-invalid={Boolean(error)}
        id={inputId}
        name={name}
        className={cn(
          "h-11 rounded-md border border-border-soft bg-white px-3 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-blue focus:ring-4 focus:ring-blue-100",
          error && "border-red-300 focus:border-red-500 focus:ring-red-100",
          className,
        )}
        {...props}
      />
      {error ? (
        <span className="text-xs font-medium text-red-600" id={errorId}>
          {error}
        </span>
      ) : null}
    </label>
  );
}
