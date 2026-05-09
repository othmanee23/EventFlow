import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "blue" | "green" | "amber" | "gray";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variants: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-700",
  blue: "bg-blue-100 text-blue-800",
  green: "bg-emerald-100 text-emerald-800",
  amber: "bg-amber-100 text-amber-800",
  gray: "bg-slate-200 text-slate-700",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn("inline-flex items-center rounded-md px-2 py-1 text-xs font-medium", variants[variant], className)}
      {...props}
    />
  );
}

