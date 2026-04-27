"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPin, Search, ShieldCheck } from "lucide-react";
import Link from "next/link";

type Affiliate = {
  id: string;
  status: string;
  full_name: string;
  company_name: string;
  postcode: string;
  email: string | null;
  phone: string | null;
  contact_enabled: boolean;
  created_at: string;
};

function badge(status: string) {
  if (status !== "verified") return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-200">
      <ShieldCheck className="h-3.5 w-3.5" />
      Verified Affiliate
    </span>
  );
}

export function DirectoryClient() {
  const [q, setQ] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [postcode, setPostcode] = useState("");
  const [radius, setRadius] = useState("10");
  const [pending, setPending] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Affiliate[]>([]);

  const params = useMemo(() => {
    const sp = new URLSearchParams();
    if (q.trim()) sp.set("q", q.trim());
    if (name.trim()) sp.set("name", name.trim());
    if (company.trim()) sp.set("company", company.trim());
    if (postcode.trim()) sp.set("postcode", postcode.trim());
    if (radius.trim()) sp.set("radius", radius.trim());
    return sp.toString();
  }, [q, name, company, postcode, radius]);

  useEffect(() => {
    let cancelled = false;
    const t = window.setTimeout(async () => {
      setError(null);
      setPending(true);
      try {
        const res = await fetch(`/api/directory?${params}`);
        const json = (await res.json()) as { affiliates?: Affiliate[]; error?: string };
        if (!res.ok) throw new Error(json.error ?? "Unable to load directory");
        if (!cancelled) setItems(json.affiliates ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unable to load directory");
      } finally {
        if (!cancelled) setPending(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [params]);

  const field =
    "mt-2 h-11 w-full rounded-2xl border border-white/15 bg-white/5 px-4 text-sm text-white placeholder:text-white/50 outline-none transition-colors focus:border-white/35 focus:ring-2 focus:ring-white/20";

  return (
    <div className="mx-auto max-w-5xl">
      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Public directory
          </h1>
          <p className="mt-2 text-sm text-white/80">
            Search approved and verified affiliates.
          </p>
        </div>
      </header>

      <section className="mt-8 rounded-3xl border border-white/15 bg-white/8 p-6 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.75)] backdrop-blur-md sm:p-8">
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <label className="text-xs font-semibold tracking-wider text-white uppercase">
              Search
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Name or company…"
                className={`${field} pl-10`}
              />
            </div>
          </div>
          <div className="lg:col-span-3">
            <label className="text-xs font-semibold tracking-wider text-white uppercase">
              Postcode
            </label>
            <input
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="e.g. SW1A 1AA"
              className={field}
            />
          </div>
          <div className="lg:col-span-3">
            <label className="text-xs font-semibold tracking-wider text-white uppercase">
              Radius (miles)
            </label>
            <select
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              className={`${field} [color-scheme:dark]`}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <div className="lg:col-span-6">
            <label className="text-xs font-semibold tracking-wider text-white uppercase">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Filter by name…"
              className={field}
            />
          </div>
          <div className="lg:col-span-6">
            <label className="text-xs font-semibold tracking-wider text-white uppercase">
              Company
            </label>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Filter by company…"
              className={field}
            />
          </div>
        </div>
      </section>

      <section className="mt-8">
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
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-white/15 bg-white/8 p-7 backdrop-blur-md">
            <p className="text-sm text-white/80">No affiliates found.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((a) => (
              <article
                key={a.id}
                className="rounded-3xl border border-white/15 bg-white/8 p-6 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.75)] backdrop-blur-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-lg font-extrabold">
                      {a.full_name}
                    </h2>
                    <p className="mt-1 truncate text-sm text-white/80">
                      {a.company_name}
                    </p>
                    <p className="mt-2 inline-flex items-center gap-2 text-sm text-white/90">
                      <MapPin className="h-4 w-4 text-white/70" />
                      {a.postcode}
                    </p>
                  </div>
                  {badge(a.status)}
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={`/directory/${encodeURIComponent(a.id)}`}
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    View profile
                  </Link>
                  {a.contact_enabled && a.email ? (
                    <a
                      href={`mailto:${encodeURIComponent(a.email)}`}
                      className="inline-flex h-11 flex-1 items-center justify-center rounded-2xl bg-accent-gradient px-4 text-sm font-semibold text-accent-foreground shadow-accent-glow transition-opacity hover:opacity-95"
                    >
                      Contact
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

