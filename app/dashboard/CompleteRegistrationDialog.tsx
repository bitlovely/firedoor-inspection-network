"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Loader2, UploadCloud, Image as ImageIcon } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/browser";

type Props = {
  open: boolean;
  onClose: () => void;
  onCompleted: () => void;
};

export function CompleteRegistrationDialog({ open, onClose, onCompleted }: Props) {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) setError(null);
  }, [open]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setError("Please sign in again.");
        return;
      }

      // Be resilient: in some environments `currentTarget` may not be an actual HTMLFormElement.
      // Try to locate the nearest <form> from the event target.
      const target = e.target;
      const formEl =
        e.currentTarget instanceof HTMLFormElement
          ? e.currentTarget
          : target instanceof HTMLFormElement
            ? target
            : target instanceof HTMLElement
              ? target.closest("form")
              : null;

      if (!formEl) {
        throw new Error("Form not found");
      }

      const fd = new FormData(formEl);
      const res = await fetch("/api/me/register-affiliate", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const json = (await res.json().catch(() => null)) as
        | { id?: string; error?: string }
        | null;
      if (!res.ok) {
        setError(json?.error ?? `Submission failed (HTTP ${res.status})`);
        return;
      }
      if (!json?.id) {
        setError("Unexpected response — please try again.");
        return;
      }
      onCompleted();
      onClose();
    } catch (e) {
      const msg =
        e instanceof Error && e.message
          ? e.message
          : "Network error — please try again";
      setError(
        `${msg}. (If this persists, check server logs for /api/me/register-affiliate.)`,
      );
    } finally {
      setPending(false);
    }
  }

  const field =
    "mt-1.5 min-h-12 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/60 outline-none transition-colors focus:border-white/35 focus:ring-2 focus:ring-white/20 sm:px-4";

  const selectField =
    "mt-1.5 min-h-12 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-white/35 focus:ring-2 focus:ring-white/20 sm:px-4 [color-scheme:dark] [&>option]:bg-black [&>option]:text-white";

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative mx-auto flex min-h-dvh max-w-3xl items-start px-4 py-6 sm:py-10">
        <div className="w-full overflow-hidden rounded-3xl border border-white/15 bg-black text-white shadow-[0_30px_90px_-60px_rgba(0,0,0,0.75)]">
          <div className="flex items-start justify-between gap-4 border-b border-white/10 p-6 sm:p-7">
            <div>
              <h2 className="font-display text-xl font-extrabold tracking-tight">
                Complete registration
              </h2>
              <p className="mt-1 text-sm text-white/70">
                Add your company details and upload your documents to be verified.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-white/80 hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form
            onSubmit={onSubmit}
            className="max-h-[calc(100dvh-9rem)] space-y-6 overflow-y-auto p-6 sm:max-h-[calc(100dvh-10.5rem)] sm:p-7"
          >
            {error ? (
              <div
                role="alert"
                className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {error}
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="company_name" className="text-sm font-medium text-white">
                  Company name <span className="text-accent">*</span>
                </label>
                <input id="company_name" name="company_name" required className={field} />
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
              <label htmlFor="bio" className="text-sm font-medium text-white">
                Bio <span className="text-accent">*</span>
              </label>
              <textarea
                id="bio"
                name="bio"
                required
                rows={4}
                className={field}
                placeholder="A short intro about you and your experience…"
              />
            </div>

            <div>
              <label htmlFor="services" className="text-sm font-medium text-white">
                Services <span className="text-accent">*</span>
              </label>
              <textarea
                id="services"
                name="services"
                required
                rows={3}
                className={field}
                placeholder="e.g. Fire door inspections, condition surveys, compliance reports…"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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
                className={field}
                placeholder="Postcodes, counties, or radius you work…"
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">Documents</p>
              <p className="mt-1 text-xs text-white/70">
                PDF, JPEG, PNG, or WebP. Max 5MB per file.
              </p>

              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="profile_photo" className="text-sm font-medium text-white">
                    Photo / logo (optional)
                  </label>
                  <input
                    id="profile_photo"
                    name="profile_photo"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    className={`${field} file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white`}
                  />
                  <p className="mt-2 text-xs text-white/60">
                    Upload a logo or profile photo to show on your public page.
                  </p>
                </div>
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
                <div>
                  <label htmlFor="sample_reports" className="text-sm font-medium text-white">
                    Sample reports (optional)
                  </label>
                  <input
                    id="sample_reports"
                    name="sample_reports"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                    className={`${field} file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white`}
                  />
                  <p className="mt-2 text-xs text-white/60">
                    Upload 1–3 examples (redacted) to help clients trust your work.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={pending}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent-gradient px-8 text-sm font-semibold text-accent-foreground shadow-accent-glow transition-opacity hover:opacity-95 disabled:opacity-60"
              >
                {pending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-4 w-4" />
                    Submit registration
                  </>
                )}
              </button>
              <p className="text-xs text-white/60">
                We’ll review your documents before listing you.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

