interface SeparatorProps {
  ornament?: boolean;
  className?: string;
}

export function Separator({ ornament = false, className = "" }: SeparatorProps) {
  return (
    <hr
      className={`border-0 border-t border-border ${ornament ? "ornament-dot" : ""} ${className}`}
    />
  );
}
