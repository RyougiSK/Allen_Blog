import { forwardRef, type TextareaHTMLAttributes } from "react";

const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className = "", ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={`w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-quaternary focus:outline-none focus:ring-2 focus:ring-accent-warm/50 focus:border-accent-warm disabled:opacity-50 font-mono ${className}`}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
export { Textarea };
