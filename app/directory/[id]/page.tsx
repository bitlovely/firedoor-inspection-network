import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/landing/Header";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { createAdminClient } from "@/lib/supabase/admin";

type AffiliateProfile = {
  id: string;
  status: "approved" | "verified" | string;
  full_name: string;
  company_name: string;
  email: string | null;
  phone: string | null;
  postcode: string;
  years_experience: number;
  areas_covered: string;
  created_at: string;
  profile_photo_path: string | null;
  bio: string | null;
  services: string | null;
  sample_report_paths: unknown;
  verified_insurance: boolean;
  verified_certification: boolean;
  identity_checked: boolean;
  review_count: number;
  review_rating: number | null;
  plan_type?: string | null;
  subscription_status?: string | null;
};

export const metadata: Metadata = {
  title: "Affiliate profile — FireDoor Network",
  description: "Public profile for an approved FireDoor Network affiliate.",
};

export default async function DirectoryAffiliateProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const baseSelect =
    "id,status,full_name,company_name,email,phone,postcode,years_experience,areas_covered,created_at,profile_photo_path,bio,services,sample_report_paths,verified_insurance,verified_certification,identity_checked,review_count,review_rating";
  const planSelect = `${baseSelect},plan_type,subscription_status`;

  let data: unknown = null;
  let error: { message: string } | null = null;

  {
    const r = await supabase
      .from("affiliate_applications")
      .select(planSelect)
      .eq("id", id)
      .in("status", ["approved", "verified"])
      .maybeSingle();
    data = r.data;
    error = r.error ? { message: r.error.message } : null;
  }

  if (error && /plan_type|subscription_status/i.test(error.message)) {
    const r = await supabase
      .from("affiliate_applications")
      .select(baseSelect)
      .eq("id", id)
      .in("status", ["approved", "verified"])
      .maybeSingle();
    data = r.data
      ? {
          ...(r.data as Record<string, unknown>),
          plan_type: "basic",
          subscription_status: "inactive",
        }
      : r.data;
    error = r.error ? { message: r.error.message } : null;
  }

  if (error) throw new Error(error.message);
  if (!data) notFound();

  const p = data as AffiliateProfile;
  const contactEnabled = p.plan_type === "advanced" && p.subscription_status === "active";
  const samples = Array.isArray(p.sample_report_paths)
    ? (p.sample_report_paths.filter((v): v is string => typeof v === "string") as string[])
    : [];

  return (
    <main className="min-h-dvh w-full bg-black text-white">
      <Header />
      <div className="container mx-auto px-4 pb-10 pt-24 sm:px-6 sm:pt-28 lg:pb-14">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/8 text-sm font-semibold text-white/80">
                {p.profile_photo_path ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/public/profile-photo?id=${encodeURIComponent(p.id)}`}
                    alt=""
                    className="h-full w-full rounded-2xl object-cover"
                  />
                ) : (
                  p.full_name
                    .split(" ")
                    .slice(0, 2)
                    .map((s) => s[0]?.toUpperCase())
                    .join("")
                )}
              </div>
              <div>
                <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                  {p.full_name}
                </h1>
                <p className="mt-1 text-white/80">{p.company_name}</p>
              </div>
            </div>
            {contactEnabled && p.email ? (
              <a
                href={`mailto:${encodeURIComponent(p.email)}?subject=${encodeURIComponent(
                  "Request inspection",
                )}`}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-accent-gradient px-6 text-sm font-semibold text-accent-foreground shadow-accent-glow transition-opacity hover:opacity-95"
              >
                Request inspection
              </a>
            ) : (
              <div className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white/80">
                Contact locked (Advanced)
              </div>
            )}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/15 bg-white/8 p-4 text-sm text-white/90">
              <p className="text-xs font-semibold tracking-wider text-white/60 uppercase">
                Trust
              </p>
              <ul className="mt-2 space-y-1">
                <li>{p.verified_insurance ? "✔" : "—"} Verified Insurance</li>
                <li>{p.verified_certification ? "✔" : "—"} Verified Certification</li>
                <li>{p.identity_checked ? "✔" : "—"} Identity Checked</li>
                <li>{p.review_count > 0 ? "✔" : "—"} Reviews</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/8 p-4 text-sm text-white/90">
              <p className="text-xs font-semibold tracking-wider text-white/60 uppercase">
                Summary
              </p>
              <p className="mt-2">
                Experience: <span className="text-white">{p.years_experience}</span> years
              </p>
              <p className="mt-1">
                Areas covered: <span className="text-white">{p.areas_covered}</span>
              </p>
              {p.review_count > 0 && p.review_rating ? (
                <p className="mt-1">
                  Rating: <span className="text-white">{Number(p.review_rating).toFixed(1)}</span>{" "}
                  ({p.review_count})
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <section className="rounded-3xl border border-white/15 bg-white/8 p-7 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.75)] backdrop-blur-md lg:col-span-2 sm:p-9">
              <h2 className="font-display text-lg font-bold">Bio</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-white/90">
                {p.bio ?? ""}
              </p>

              <h2 className="mt-8 font-display text-lg font-bold">Services</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-white/90">
                {p.services ?? ""}
              </p>

              <h2 className="mt-8 font-display text-lg font-bold">Areas covered</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-white/90">{p.areas_covered}</p>

              {samples.length > 0 ? (
                <>
                  <h2 className="mt-8 font-display text-lg font-bold">Sample reports</h2>
                  <ul className="mt-3 space-y-2">
                    {samples.map((_, idx) => (
                      <li key={idx} className="text-sm text-white/80">
                        Sample report {idx + 1}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-white/60">
                    (Downloads coming next — we can enable signed links for these public samples.)
                  </p>
                </>
              ) : null}
            </section>

            <aside className="rounded-3xl border border-white/15 bg-white/8 p-7 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.75)] backdrop-blur-md sm:p-9">
              <h2 className="font-display text-lg font-bold">Contact details</h2>
              <div className="mt-3 space-y-2 text-sm text-white/90">
                <p>
                  <span className="text-white/70">Email:</span>{" "}
                  {contactEnabled ? p.email : "Upgrade required"}
                </p>
                <p>
                  <span className="text-white/70">Phone:</span>{" "}
                  {contactEnabled ? p.phone : "Upgrade required"}
                </p>
                <p>
                  <span className="text-white/70">Postcode:</span> {p.postcode}
                </p>
              </div>

              <div className="mt-6">
                {contactEnabled && p.email ? (
                  <a
                    href={`mailto:${encodeURIComponent(p.email)}`}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-accent-gradient px-4 py-3 text-sm font-semibold text-accent-foreground shadow-accent-glow transition-opacity hover:opacity-95"
                  >
                    Contact via email
                  </a>
                ) : (
                  <Link
                    href="/signup"
                    className="inline-flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    Upgrade to contact
                  </Link>
                )}
              </div>
            </aside>
          </div>

          <div className="mt-10 text-center text-sm">
            <Link
              href="/directory"
              className="text-white underline-offset-4 hover:underline"
            >
              Back to directory
            </Link>
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}

