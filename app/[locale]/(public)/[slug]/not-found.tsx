import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ArticleNotFound() {
  return (
    <div className="mx-auto w-full max-w-[var(--width-content)] px-6 py-20 text-center">
      <h1 className="font-display text-[length:var(--text-display-md)] text-text-primary mb-3">
        Not found
      </h1>
      <p className="text-text-secondary mb-8">
        The article you&apos;re looking for doesn&apos;t exist or isn&apos;t
        published yet.
      </p>
      <Link
        href="/en/writing"
        className="inline-flex items-center gap-1.5 text-[length:var(--text-caption)] text-accent-warm hover:text-accent-warm/80 transition-colors duration-[var(--duration-fast)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to writing
      </Link>
    </div>
  );
}
