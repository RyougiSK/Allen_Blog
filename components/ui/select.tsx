import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className = "", children, ...props }, ref) => {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={`w-full appearance-none rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 pr-9 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-warm/50 focus:border-accent-warm disabled:opacity-50 ${className}`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
    </div>
  );
});

Select.displayName = "Select";
export { Select };
