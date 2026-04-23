import Link from "next/link";
import {
  ArrowRight,
  Award,
  Briefcase,
  ClipboardCheck,
  FileCheck,
  Flame,
  Lock,
  MapPin,
  Scale,
  Shield,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { Header } from "./Header";
import { HeroNetworkBackground } from "./HeroNetworkBackground";
import { SiteFooter } from "@/components/layout/SiteFooter";

const howSteps = [
  {
    icon: ClipboardCheck,
    step: "01",
    title: "Apply in minutes",
    description:
      "Upload your certifications, insurance and DBS. We verify everything so clients don't have to.",
  },
  {
    icon: UserCheck,
    step: "02",
    title: "Get verified",
    description:
      "Once approved, your profile goes live with a 'Verified Affiliate' badge and full coverage map.",
  },
  {
    icon: Briefcase,
    step: "03",
    title: "Win work",
    description:
      "Property managers and contractors find you in our searchable directory and contact you directly.",
  },
] as const;

const whyItems = [
  {
    icon: TrendingUp,
    title: "Real leads, not lip service",
    description:
      "Unlike trade associations, we send work your way — not just a logo for your van.",
  },
  {
    icon: MapPin,
    title: "Cover your patch",
    description:
      "Define your radius. Get matched with jobs only in areas you actually want to travel to.",
  },
  {
    icon: Users,
    title: "Trusted by clients",
    description:
      "Property managers know our verified badge means insurance, certification and DBS — checked.",
  },
  {
    icon: Award,
    title: "Stand out professionally",
    description:
      "A clean, public profile that shows your credentials, coverage and contact in seconds.",
  },
  {
    icon: Zap,
    title: "Zero faff to join",
    description:
      "No interviews, no membership panels. Apply online, upload docs, get verified.",
  },
  {
    icon: Shield,
    title: "Compliance-first",
    description:
      "Built around BS 8214, Regulation 10 and the Fire Safety Act. Clients trust the network.",
  },
] as const;

const trustItems = [
  {
    icon: FileCheck,
    title: "Document verification",
    description:
      "Every certification, insurance policy and DBS is reviewed by our admin team before approval.",
  },
  {
    icon: Scale,
    title: "Compliance aligned",
    description:
      "Affiliate criteria mirror the requirements of the Fire Safety (England) Regulations 2022.",
  },
  {
    icon: Lock,
    title: "Your data, secure",
    description:
      "Documents stored on encrypted infrastructure. Never shared without your permission.",
  },
] as const;

export function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      <section className="relative overflow-hidden bg-black pt-28 sm:pt-32">
        <HeroNetworkBackground />
        <div className="pointer-events-none absolute inset-0 bg-glow opacity-40" />
        <div className="container relative mx-auto flex items-center justify-center px-4 pt-16 pb-24 sm:px-6 lg:pt-24 lg:pb-32">
          <div className="animate-fade-up w-full max-w-3xl text-center">
            <div className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold tracking-wider text-white/80 uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              The UK network for fire door professionals
            </div>
            <h1 className="mt-6 font-display text-4xl leading-[1.05] font-extrabold tracking-tight text-balance text-white sm:text-5xl lg:text-6xl xl:text-7xl">
              A network that{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-white">leads to work.</span>
                <span className="absolute right-0 -bottom-1 left-0 h-1 rounded-full bg-white/35" />
              </span>
            </h1>
            <p className="mt-6 mx-auto max-w-2xl text-lg text-balance text-white/70 sm:text-xl">
              FireDoor Network connects verified fire door surveyors and inspectors
              with property managers, contractors and clients who need them. No
              noticeboards. No politics. Just real jobs in your area.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/apply"
                className="group inline-flex h-14 items-center justify-center gap-2 rounded-lg bg-accent-gradient px-8 text-base font-semibold text-accent-foreground shadow-accent-glow transition-opacity hover:opacity-95"
              >
                Become an Affiliate
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#directory"
                className="inline-flex h-14 items-center justify-center rounded-lg border border-white/20 bg-transparent px-8 text-base font-semibold text-white transition-colors hover:bg-white/10"
              >
                Browse the directory
              </a>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-white/70" />
                Vetted credentials
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-white/70" />
                Insurance verified
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-white/70" />
                UK-wide coverage
              </div>
            </div>
          </div>
        </div>
        <div className="-mt-1 relative h-12 rounded-t-[2rem] bg-background lg:rounded-t-[3rem]" />
      </section>

      <section id="how" className="bg-background py-24 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold tracking-wider text-accent uppercase">
              How it works
            </div>
            <h2 className="mt-4 font-display text-3xl leading-tight font-extrabold tracking-tight text-balance text-primary sm:text-4xl lg:text-5xl">
              Three steps from application to your first lead.
            </h2>
          </div>
          <div className="relative mt-16">
            {/* connectors (desktop) */}
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 hidden h-full w-full md:block"
              viewBox="0 0 1000 280"
              preserveAspectRatio="none"
            >
              <defs>
                <marker
                  id="how-arrow"
                  markerWidth="10"
                  markerHeight="10"
                  refX="8"
                  refY="5"
                  orient="auto"
                >
                  <path d="M0,0 L10,5 L0,10 Z" fill="rgba(0,0,0,0.28)" />
                </marker>
              </defs>
              <path
                d="M 210 70 C 360 25, 430 25, 530 88"
                fill="none"
                stroke="rgba(0,0,0,0.18)"
                strokeWidth="2"
                markerEnd="url(#how-arrow)"
              />
              <path
                d="M 560 170 C 620 215, 710 235, 820 212"
                fill="none"
                stroke="rgba(0,0,0,0.18)"
                strokeWidth="2"
                markerEnd="url(#how-arrow)"
              />
            </svg>

            <div className="grid gap-10 md:grid-cols-3 md:gap-8">
              {howSteps.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.step} className="relative">
                    <div className="flex items-start gap-5 md:flex-col md:gap-4">
                      <div className="flex shrink-0 items-center gap-4 md:w-full md:justify-start">
                        <div className="font-display text-3xl font-extrabold text-primary/70">
                          {item.step}.
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-black/10 bg-white shadow-[0_10px_30px_-20px_rgba(0,0,0,0.35)]">
                          <Icon className="h-6 w-6 text-primary" strokeWidth={2} />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="font-display text-lg font-bold text-primary">
                          {item.title}
                        </div>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="why" className="relative overflow-hidden bg-[#f3f4f6] py-24 lg:py-32">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#e5e7eb] via-[#f3f4f6] to-[#f3f4f6]" />
        <div className="container relative mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_30px_90px_-60px_rgba(0,0,0,0.35)]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-16 -right-8 select-none text-[220px] leading-none font-display font-extrabold text-black/[0.06] sm:text-[280px]"
            >
              ?
            </div>
            <div className="grid gap-8 px-8 py-10 sm:px-12 sm:py-12 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-1 text-xs font-semibold tracking-wider text-black/70 uppercase">
                  Why join
                </div>
                <h2 className="mt-4 font-display text-3xl leading-tight font-extrabold tracking-tight text-balance text-black sm:text-4xl lg:text-5xl">
                  We&apos;re not another trade body.
                  <span className="block text-black/70">
                    We&apos;re a route to revenue.
                  </span>
                </h2>
              </div>
              <div className="space-y-4 text-sm leading-relaxed text-black/70 lg:col-span-6 lg:pt-2">
                <p>
                  Built by people who actually inspect doors — for people who
                  actually inspect doors.
                </p>
                <p>
                  Get discovered by clients who need compliant fire door work and
                  contact you directly.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 border-t border-black/10 md:grid-cols-3">
              {whyItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="border-r border-b border-black/10 p-6 last:border-r-0 md:[&:nth-child(3n)]:border-r-0 [&:nth-last-child(-n+2)]:border-b-0 md:[&:nth-last-child(-n+3)]:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white">
                        <Icon className="h-5 w-5 text-black/70" strokeWidth={2} />
                      </div>
                      <div className="font-display text-base font-bold text-black">
                        {item.title}
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-black/70">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section
        id="trust"
        className="relative overflow-hidden bg-black py-24 text-white lg:py-32"
      >
        <div className="pointer-events-none absolute inset-0 bg-glow opacity-35" />
        <div className="pointer-events-none absolute inset-0 opacity-25 [background:radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_55%),radial-gradient(circle_at_70%_70%,rgba(255,106,26,0.14),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-18 [background-image:url('/trust-bg.svg')] [background-size:cover] [background-position:center] mix-blend-screen" />
        <div className="container relative mx-auto px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider text-white/80 uppercase">
                Trust & compliance
              </div>
              <h2 className="mt-4 font-display text-3xl leading-tight font-extrabold tracking-tight text-balance sm:text-4xl lg:text-5xl">
                The badge that means something.
              </h2>
              <p className="mt-4 text-lg text-white">
                Becoming a Verified Affiliate isn&apos;t automatic. We check, we
                approve, we vouch. That&apos;s why clients pick names from our
                directory.
              </p>
              <div className="mt-8 inline-flex items-center gap-3 rounded-xl bg-white/10 p-4 ring-1 ring-white/20 backdrop-blur-md">
                <ShieldCheck className="h-6 w-6 text-white" strokeWidth={2.5} />
                <div>
                  <div className="text-xs font-semibold tracking-wider text-white uppercase">
                    FireDoor Network
                  </div>
                  <div className="font-display text-lg font-bold text-white">
                    Verified Affiliate
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4 lg:col-span-7">
              {trustItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex gap-5 rounded-xl border border-white/20 bg-white/8 p-6 backdrop-blur-md transition-all hover:border-white/30 hover:bg-white/12"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white ring-1 ring-white/20">
                      <Icon className="h-5 w-5 text-white/80" strokeWidth={2.25} />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-white">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="directory" className="bg-background py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black p-10 text-white shadow-[0_30px_90px_-60px_rgba(0,0,0,0.55)] sm:p-14 lg:p-20">
            <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
            <div className="relative max-w-3xl">
              <h2 className="font-display text-3xl leading-tight font-extrabold tracking-tight text-balance sm:text-4xl lg:text-5xl">
                Ready to turn your certifications into a queue of clients?
              </h2>
              <p className="mt-4 max-w-2xl text-lg text-white/75">
                Apply today. Most affiliates are verified within 48 hours and listed
                in the public directory the same week.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/apply"
                  className="group inline-flex h-14 items-center justify-center gap-2 rounded-lg bg-accent-gradient px-8 text-base font-semibold text-accent-foreground shadow-accent-glow transition-opacity hover:opacity-95"
                >
                  Become an Affiliate
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href="#"
                  className="inline-flex h-14 items-center justify-center rounded-lg border border-white/20 px-8 text-base font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Talk to the team
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
