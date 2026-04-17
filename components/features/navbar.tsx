import Link from "next/link";
import { PenLine } from "lucide-react";

export function Navbar() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight hover:text-accent transition-colors">
          Blog
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm text-muted hover:text-foreground transition-colors">
            Posts
          </Link>
          <Link href="/about" className="text-sm text-muted hover:text-foreground transition-colors">
            About
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
          >
            <PenLine className="h-3.5 w-3.5" />
            Write
          </Link>
        </nav>
      </div>
    </header>
  );
}
