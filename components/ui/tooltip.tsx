interface TooltipProps {
  label: string;
  children: React.ReactNode;
  side?: "top" | "bottom";
}

export function Tooltip({ label, children, side = "top" }: TooltipProps) {
  return (
    <div className="relative group/tooltip inline-flex">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[var(--radius-sm)] bg-bg-tertiary border border-border px-2 py-1 text-[length:var(--text-micro)] text-text-secondary opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-[var(--duration-fast)] z-50 ${
          side === "top" ? "bottom-full mb-2" : "top-full mt-2"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
