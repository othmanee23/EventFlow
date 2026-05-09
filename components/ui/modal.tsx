import type { HTMLAttributes, ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ModalProps = HTMLAttributes<HTMLDivElement> & {
  open: boolean;
  onClose?: () => void;
  title: string;
  children: ReactNode;
};

export function Modal({ children, className, onClose, open, title, ...props }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onClick={onClose}>
      <section
        aria-modal="true"
        className={cn("w-full max-w-xl rounded-md bg-white shadow-xl", className)}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        {...props}
      >
        <header className="flex items-center justify-between border-b border-border-soft px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
          <button
            aria-label="Close modal"
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </header>
        <div className="p-5">{children}</div>
      </section>
    </div>
  );
}
