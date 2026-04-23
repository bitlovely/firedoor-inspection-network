"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function AffiliateApplicationForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      const res = await fetch("/api/affiliate-applications", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as { id?: string; error?: string };

      if (!res.ok) {
        setError(data.error ?? "Submission failed");
        return;
      }
      if (data.id) {
        router.push(`/apply/thanks?id=${encodeURIComponent(data.id)}`);
        return;
      }
      setError("Unexpected response");
    } catch {
      setError("Network error — please try again");
    } finally {
      setPending(false);
    }
  }

  const field =
    "mt-1.5 min-h-12 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/60 outline-none transition-colors focus:border-white/35 focus:ring-2 focus:ring-white/20 sm:px-4";

  /** Native `<select>`: match inputs; keep dropdown options dark where supported. */
  const selectField =
    "mt-1.5 min-h-12 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-white/35 focus:ring-2 focus:ring-white/20 sm:px-4 [color-scheme:dark] [&>option]:bg-black [&>option]:text-white";

  const card =
    "rounded-3xl border border-white/15 bg-white/8 p-7 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.75)] backdrop-blur-md sm:p-9";

  return (
    <form onSubmit={onSubmit} className="grid gap-8 text-white lg:grid-cols-12 lg:gap-10">
      {error ? (
        <div
          role="alert"
          className="lg:col-span-12 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}

      <div className={`${card} space-y-8 lg:col-span-6`}>
        <section className="space-y-4">
          <h2 className="font-display text-lg font-bold text-white">About you</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="full_name" className="text-sm font-medium text-white">
                Full name <span className="text-accent">*</span>
              </label>
              <input
                id="full_name"
                name="full_name"
                required
                autoComplete="name"
                className={field}
              />
            </div>
            <div>
              <label htmlFor="company_name" className="text-sm font-medium text-white">
                Company name <span className="text-accent">*</span>
              </label>
              <input
                id="company_name"
                name="company_name"
                required
                autoComplete="organization"
                className={field}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-white">
                Email <span className="text-accent">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className={field}
              />
            </div>
            <div>
              <label htmlFor="phone" className="text-sm font-medium text-white">
                Phone <span className="text-accent">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                className={field}
              />
            </div>
          </div>
          <div>
            <label htmlFor="postcode" className="text-sm font-medium text-white">
              Location (postcode) <span className="text-accent">*</span>
            </label>
            <input
              id="postcode"
              name="postcode"
              required
              autoComplete="postal-code"
              placeholder="e.g. SW1A 1AA"
              className={field}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-lg font-bold text-white">Experience & coverage</h2>
          <div>
            <label htmlFor="years_experience" className="text-sm font-medium text-white">
              Years of experience <span className="text-accent">*</span>
            </label>
            <select
              id="years_experience"
              name="years_experience"
              required
              defaultValue=""
              className={selectField}
            >
              <option value="" disabled>
                Select…
              </option>
              {Array.from({ length: 51 }, (_, i) => (
                <option key={i} value={i}>
                  {i} {i === 1 ? "year" : "years"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="areas_covered" className="text-sm font-medium text-white">
              Areas you cover <span className="text-accent">*</span>
            </label>
            <textarea
              id="areas_covered"
              name="areas_covered"
              required
              rows={4}
              placeholder="Postcodes, counties, or radius you work (e.g. M25, West Midlands within 40 miles…)"
              className={field}
            />
          </div>
        </section>
      </div>

      <div className={`${card} flex flex-col gap-8 lg:col-span-6`}>
        <section className="space-y-4">
          <h2 className="font-display text-lg font-bold text-white">Documents</h2>
          <p className="text-sm text-white/75">
            PDF, JPEG, PNG, or WebP. Max 5MB per file. Certifications: upload one or more files.
          </p>
          <div>
            <label htmlFor="certifications" className="text-sm font-medium text-white">
              Certifications <span className="text-accent">*</span>
            </label>
            <input
              id="certifications"
              name="certifications"
              type="file"
              required
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
              className={`${field} file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white`}
            />
          </div>
          <div>
            <label htmlFor="insurance" className="text-sm font-medium text-white">
              Insurance proof <span className="text-accent">*</span>
            </label>
            <input
              id="insurance"
              name="insurance"
              type="file"
              required
              accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
              className={`${field} file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white`}
            />
          </div>
          <div>
            <label htmlFor="dbs" className="text-sm font-medium text-white">
              DBS check (optional)
            </label>
            <input
              id="dbs"
              name="dbs"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
              className={`${field} file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white`}
            />
          </div>
        </section>

        <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-accent-gradient px-8 text-sm font-semibold text-accent-foreground shadow-accent-glow transition-opacity hover:opacity-95 disabled:opacity-60"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              "Submit application"
            )}
          </button>
          <p className="text-xs text-white/70">
            By submitting you confirm the information is accurate. Our team will review your
            documents before approval.
          </p>
        </div>
      </div>
    </form>
  );
}
