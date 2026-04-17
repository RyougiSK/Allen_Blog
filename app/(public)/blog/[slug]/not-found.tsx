import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PostNotFound() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-20 text-center">
      <h1 className="text-2xl font-bold tracking-tight mb-2">Post not found</h1>
      <p className="text-muted mb-6">The post you&apos;re looking for doesn&apos;t exist or isn&apos;t published.</p>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent/80 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to posts
      </Link>
    </div>
  );
}
