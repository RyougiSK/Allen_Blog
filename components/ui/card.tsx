interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] border border-border bg-surface p-6 ${className}`}
    >
      {children}
    </div>
  );
}
