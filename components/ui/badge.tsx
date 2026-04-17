type Variant = "default" | "success" | "warning";

interface BadgeProps {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  default: "bg-surface border-border text-muted",
  success: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  warning: "bg-amber-400/10 text-amber-400 border-amber-400/20",
};

export function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
