"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/browser";
import { authPrimaryButtonClassName } from "@/components/auth/authPrimaryButtonClassName";

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
};

export default function DashboardPage() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserClient(), []);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [app, setApp] = useState<Application | null>(null);

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

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/signin");
  }

  return (
    <main className="relative min-h-dvh w-full bg-black text-white">
      <div className="container mx-auto px-4 py-10 sm:px-6 lg:py-14">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-white/80">
            Your affiliate application status and profile access.
          </p>

          <div className="mt-8 rounded-3xl border border-white/15 bg-white/8 p-7 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.75)] backdrop-blur-md sm:p-9">
            {pending ? (
              <p className="text-sm text-white/80">Loading…</p>
            ) : error ? (
              <div
                role="alert"
                className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {error}
              </div>
            ) : app ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold tracking-wider text-white uppercase">
                      Status
                    </p>
                    <p className="mt-1 text-lg font-semibold">{app.status}</p>
                  </div>
                  {(app.status === "approved" || app.status === "verified") && (
                    <Link
                      href={`/affiliates/${encodeURIComponent(app.id)}`}
                      className="text-sm text-white underline-offset-4 hover:underline"
                    >
                      View public profile
                    </Link>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold tracking-wider text-white uppercase">
                      Name
                    </p>
                    <p className="mt-1 text-sm text-white/90">{app.full_name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-wider text-white uppercase">
                      Company
                    </p>
                    <p className="mt-1 text-sm text-white/90">{app.company_name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-wider text-white uppercase">
                      Email
                    </p>
                    <p className="mt-1 text-sm text-white/90">{app.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-wider text-white uppercase">
                      Phone
                    </p>
                    <p className="mt-1 text-sm text-white/90">{app.phone}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold tracking-wider text-white uppercase">
                    Coverage
                  </p>
                  <p className="mt-1 text-sm text-white/90">{app.areas_covered}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-white/80">No application found.</p>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" className={authPrimaryButtonClassName} onClick={signOut}>
                Sign out
              </button>
              <Link href="/" className="text-sm text-white underline-offset-4 hover:underline">
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

