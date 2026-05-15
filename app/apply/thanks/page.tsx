import Link from "next/link";
import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Application received — Fire Door Network",
  description: "Thank you for applying to Fire Door Network.",
};

type Props = { searchParams: Promise<{ id?: string }> };

export default async function ThanksPage({ searchParams }: Props) {
  const { id } = await searchParams;

  return (
    <main className="container mx-auto max-w-lg px-4 py-16 sm:px-6">
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-accent/15 text-accent">
          <ShieldCheck className="h-7 w-7" strokeWidth={2} />
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold text-primary">
          Application received
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Thanks for applying. Our team will review your documents. Most inspectors hear back
          within a few working days.
        </p>
        {id ? (
          <p className="mt-4 font-mono text-xs text-muted-foreground">
            Reference: <span className="select-all">{id}</span>
          </p>
        ) : null}
        <Link
          href="/"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
