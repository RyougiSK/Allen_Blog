import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About the author of this blog.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-6">About</h1>
      <div className="prose-blog prose prose-invert max-w-none">
        <p>
          Welcome to my blog. This is where I write about technology, software
          engineering, and the things I&apos;m learning along the way.
        </p>
        <p>
          This site is built with Next.js and Supabase, designed with a focus on
          clean typography and readability.
        </p>
      </div>
    </div>
  );
}
