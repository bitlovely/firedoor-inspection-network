import Link from "next/link";

export const metadata = {
  title: "Terms — Fire Door Network",
  description: "Terms for using Fire Door Network.",
};

export default function TermsPage() {
  return (
    <main className="min-h-dvh bg-black text-white">
      <div className="container mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Terms</h1>
        <p className="mt-3 text-sm text-white/70">
          Placeholder terms page. Replace this content with your official terms.
        </p>

        <div className="mt-10 rounded-3xl border border-white/15 bg-white/5 p-6 text-sm text-white/80">
          <p>
            If you need help drafting Terms and a Privacy Policy specific to your business, tell
            me your company name, contact email, and whether you process payments or handle
            sensitive documents.
          </p>
        </div>

        <div className="mt-8">
          <Link href="/" className="text-sm text-white underline-offset-4 hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}

