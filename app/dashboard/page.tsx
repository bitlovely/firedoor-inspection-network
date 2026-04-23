"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/browser";
import {
  Download,
  MapPin,
} from "lucide-react";

type Application = {
  id: string;
  status: "pending" | "approved" | "rejected" | "verified" | string;
  full_name: string;
  company_name: string;
  email: string;
  phone: string;
  postcode: string;
  years_experience: number;
  areas_covered: string;
  created_at: string;
  certification_paths: unknown;
  insurance_path: string;
  dbs_path: string | null;
};

function toArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
  return [];
}

function statusBadge(status: string) {
  const base =
    "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide";
  switch (status) {
    case "approved":
      return `${base} border-emerald-400/30 bg-emerald-400/10 text-emerald-200`;
    case "verified":
      return `${base} border-cyan-400/30 bg-cyan-400/10 text-cyan-200`;
    case "rejected":
      return `${base} border-rose-400/30 bg-rose-400/10 text-rose-200`;
    case "pending":
      return `${base} border-amber-400/30 bg-amber-400/10 text-amber-200`;
    default:
      return `${base} border-white/20 bg-white/5 text-white/90`;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserClient(), []);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [app, setApp] = useState<Application | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError(null);
      setPending(true);

      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        router.push("/signin");
        return;
      }

      try {
        const res = await fetch("/api/me/application", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = (await res.json()) as
          | { application: Application }
          | { error: string };
        if (!res.ok) {
          throw new Error("error" in json ? json.error : "Unable to load dashboard");
        }
        if (!("application" in json)) {
          throw new Error("Unable to load dashboard");
        }
        if (!cancelled) setApp(json.application);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        if (!cancelled) setPending(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  async function downloadDoc(path: string) {
    setDownloading(path);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        router.push("/signin");
        return;
      }
      const res = await fetch("/api/me/application/doc-url", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ path }),
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) {
        throw new Error(json.error ?? "Unable to download document");
      }
      window.open(json.url, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(null);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/signin");
  }

  return (
    <main className="relative min-h-dvh w-full overflow-hidden bg-black text-white">
      <div className="container relative z-10 mx-auto px-4 py-10 sm:px-6 lg:py-14">
        <header className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                Affiliate dashboard
              </h1>
              <p className="mt-2 text-sm text-white/80">
                Your application status, profile details, and documents.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={signOut}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-accent-gradient px-6 text-sm font-semibold text-accent-foreground shadow-accent-glow transition-opacity hover:opacity-95"
              >
                Sign out
              </button>
              <Link
                href="/"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white hover:bg-white/10"
              >
                Back to home
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-auto mt-8 max-w-5xl space-y-6">
            {pending ? (
              <div className="rounded-3xl border border-white/15 bg-white/8 p-7 backdrop-blur-md">
                <p className="text-sm text-white/80">Loading…</p>
              </div>
            ) : error ? (
              <div
                role="alert"
                className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {error}
              </div>
            ) : app ? (
              <div className="grid gap-6 lg:grid-cols-12">
                <section
                  className="rounded-3xl border border-white/15 bg-white/8 p-6 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.75)] backdrop-blur-md lg:col-span-7 sm:p-8"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold tracking-wider text-white uppercase">
                        Status
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <span className={statusBadge(app.status)}>{app.status}</span>
                        {(app.status === "approved" || app.status === "verified") && (
                          <Link
                            href={`/directory/${encodeURIComponent(app.id)}`}
                            className="text-sm text-white underline-offset-4 hover:underline"
                          >
                            View public profile
                          </Link>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold tracking-wider text-white uppercase">
                        Application ID
                      </p>
                      <p className="mt-2 font-mono text-xs text-white/80">{app.id}</p>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs font-semibold tracking-wider text-white uppercase">
                        Name
                      </p>
                      <p className="mt-1 text-sm text-white/90">{app.full_name}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs font-semibold tracking-wider text-white uppercase">
                        Company
                      </p>
                      <p className="mt-1 text-sm text-white/90">{app.company_name}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs font-semibold tracking-wider text-white uppercase">
                        Email
                      </p>
                      <p className="mt-1 text-sm text-white/90">{app.email}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs font-semibold tracking-wider text-white uppercase">
                        Phone
                      </p>
                      <p className="mt-1 text-sm text-white/90">{app.phone}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs font-semibold tracking-wider text-white uppercase">
                        Location
                      </p>
                      <p className="mt-1 inline-flex items-center gap-2 text-sm text-white/90">
                        <MapPin className="h-4 w-4 text-white/70" />
                        {app.postcode}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs font-semibold tracking-wider text-white uppercase">
                        Experience
                      </p>
                      <p className="mt-1 text-sm text-white/90">{app.years_experience} years</p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-semibold tracking-wider text-white uppercase">
                      Coverage area
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-white/90">
                      {app.areas_covered}
                    </p>
                  </div>
                </section>

                <section
                  className="rounded-3xl border border-white/15 bg-white/8 p-6 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.75)] backdrop-blur-md lg:col-span-5 sm:p-8"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold tracking-wider text-white uppercase">
                        Documents
                      </p>
                      <p className="mt-1 text-sm text-white/80">
                        Download your uploaded files.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    {toArray(app.certification_paths).map((path, idx) => (
                      <button
                        key={path}
                        type="button"
                        onClick={() => downloadDoc(path)}
                        disabled={downloading === path}
                        className="inline-flex w-full items-center justify-between gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white hover:bg-white/10 disabled:opacity-60"
                      >
                        <span className="truncate">Certification {idx + 1}</span>
                        <Download className="h-4 w-4 shrink-0" />
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => downloadDoc(app.insurance_path)}
                      disabled={downloading === app.insurance_path}
                      className="inline-flex w-full items-center justify-between gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white hover:bg-white/10 disabled:opacity-60"
                    >
                      <span className="truncate">Insurance</span>
                      <Download className="h-4 w-4 shrink-0" />
                    </button>
                    {app.dbs_path ? (
                      <button
                        type="button"
                        onClick={() => downloadDoc(app.dbs_path!)}
                        disabled={downloading === app.dbs_path}
                        className="inline-flex w-full items-center justify-between gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white hover:bg-white/10 disabled:opacity-60"
                      >
                        <span className="truncate">DBS</span>
                        <Download className="h-4 w-4 shrink-0" />
                      </button>
                    ) : null}
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
                    Downloads are secure links that expire quickly.
                  </div>
                </section>
              </div>
            ) : (
              <div className="rounded-3xl border border-white/15 bg-white/8 p-7 backdrop-blur-md">
                <p className="text-sm text-white/80">No application found.</p>
              </div>
            )}
        </div>
      </div>
    </main>
  );
}

