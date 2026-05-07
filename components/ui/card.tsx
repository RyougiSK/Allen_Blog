interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] border border-border/60 bg-bg-tertiary p-8 ${className}`}
    >
      {children}
    </div>
  );
}
