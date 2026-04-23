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
  email: string;
  phone: string;
  postcode: string;
  years_experience: number;
  areas_covered: string;
  created_at: string;
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

  const { data, error } = await supabase
    .from("affiliate_applications")
    .select(
      "id,status,full_name,company_name,email,phone,postcode,years_experience,areas_covered,created_at",
    )
    .eq("id", id)
    .in("status", ["approved", "verified"])
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) notFound();

  const p = data as AffiliateProfile;

  return (
    <main className="min-h-dvh w-full bg-black text-white">
      <Header />
      <div className="container mx-auto px-4 pb-10 pt-24 sm:px-6 sm:pt-28 lg:pb-14">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            {p.full_name}
          </h1>
          <p className="mt-2 text-white/80">{p.company_name}</p>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <section className="rounded-3xl border border-white/15 bg-white/8 p-7 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.75)] backdrop-blur-md lg:col-span-2 sm:p-9">
              <h2 className="font-display text-lg font-bold">Coverage area</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-white/90">
                {p.areas_covered}
              </p>

              <h2 className="mt-8 font-display text-lg font-bold">Credentials summary</h2>
              <p className="mt-2 text-sm text-white/80">
                Years of experience: <span className="text-white">{p.years_experience}</span>
              </p>
              <p className="mt-1 text-sm text-white/80">
                Status: <span className="text-white">{p.status}</span>
              </p>
            </section>

            <aside className="rounded-3xl border border-white/15 bg-white/8 p-7 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.75)] backdrop-blur-md sm:p-9">
              <h2 className="font-display text-lg font-bold">Contact details</h2>
              <div className="mt-3 space-y-2 text-sm text-white/90">
                <p>
                  <span className="text-white/70">Email:</span> {p.email}
                </p>
                <p>
                  <span className="text-white/70">Phone:</span> {p.phone}
                </p>
                <p>
                  <span className="text-white/70">Postcode:</span> {p.postcode}
                </p>
              </div>

              <div className="mt-6">
                <a
                  href={`mailto:${encodeURIComponent(p.email)}`}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-accent-gradient px-4 py-3 text-sm font-semibold text-accent-foreground shadow-accent-glow transition-opacity hover:opacity-95"
                >
                  Contact via email
                </a>
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

