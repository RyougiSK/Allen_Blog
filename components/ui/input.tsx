import { forwardRef, type InputHTMLAttributes } from "react";

const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className = "", ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-quaternary focus:outline-none focus:ring-2 focus:ring-accent-warm/50 focus:border-accent-warm disabled:opacity-50 ${className}`}
      {...props}
    />
  );
});

Input.displayName = "Input";
export { Input };
