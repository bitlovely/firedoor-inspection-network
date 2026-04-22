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
import { Header } from "./Header";
import { HeroDoor3D } from "./HeroDoor3D";

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

function LogoMark() {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-gradient shadow-accent-glow">
      <Flame className="h-5 w-5 text-accent-foreground" strokeWidth={2.5} />
    </span>
  );
}

export function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      <section className="relative overflow-hidden bg-hero-gradient pt-24">
        <div className="pointer-events-none absolute inset-0 bg-glow" />
        <div className="container relative mx-auto grid items-center gap-12 px-4 pt-16 pb-24 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:pt-24 lg:pb-32">
          <div className="animate-fade-up lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-semibold tracking-wider text-accent uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              The UK network for fire door professionals
            </div>
            <h1 className="mt-6 font-display text-4xl leading-[1.05] font-extrabold tracking-tight text-balance text-primary-foreground sm:text-5xl lg:text-6xl xl:text-7xl">
              A network that{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-accent">leads to work.</span>
                <span className="absolute right-0 -bottom-1 left-0 h-1 rounded-full bg-accent/60" />
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-balance text-primary-foreground/70 sm:text-xl">
              FireDoor Network connects verified fire door surveyors and inspectors
              with property managers, contractors and clients who need them. No
              noticeboards. No politics. Just real jobs in your area.
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
                href="#directory"
                className="inline-flex h-14 items-center justify-center rounded-lg border border-white/15 px-8 text-base font-semibold text-primary-foreground transition-colors hover:bg-white/10"
              >
                Browse the directory
              </a>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-primary-foreground/60">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-accent" />
                Vetted credentials
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-accent" />
                Insurance verified
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-accent" />
                UK-wide coverage
              </div>
            </div>
          </div>

          <div className="animate-fade-up [animation-delay:150ms] lg:col-span-5">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-accent/20 blur-3xl" />
              <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-lg">
                <HeroDoor3D />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary via-primary/60 to-transparent p-6">
                  <div className="flex items-center gap-3 rounded-xl bg-primary-foreground/95 p-3 backdrop-blur">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        Verified Affiliate
                      </div>
                      <div className="text-sm font-semibold text-primary">
                        FD30 / FD60 certified inspector
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="animate-fade-up absolute top-8 -left-4 rounded-xl border border-border bg-primary-foreground p-4 shadow-lg [animation-delay:400ms] sm:-left-8">
                <div className="font-display text-2xl font-extrabold text-primary">
                  1,200+
                </div>
                <div className="text-xs text-muted-foreground">
                  Inspections last month
                </div>
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
          <div className="mt-16 grid gap-6 md:grid-cols-3 lg:gap-8">
            {howSteps.map((item, t) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="group relative rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40"
                  style={{ animationDelay: `${t * 100}ms` }}
                >
                  <div className="absolute top-6 right-6 font-display text-5xl font-extrabold text-secondary transition-colors group-hover:text-accent/20">
                    {item.step}
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all group-hover:bg-accent-gradient group-hover:shadow-accent-glow">
                    <Icon className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <h3 className="mt-6 font-display text-xl font-bold text-primary">
                    {item.title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="why" className="relative overflow-hidden bg-secondary/40 py-24 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold tracking-wider text-accent uppercase">
              Why join
            </div>
            <h2 className="mt-4 font-display text-3xl leading-tight font-extrabold tracking-tight text-balance text-primary sm:text-4xl lg:text-5xl">
              We&apos;re not another trade body.
              <span className="block text-accent">
                We&apos;re a route to revenue.
              </span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Built by people who actually inspect doors — for people who actually
              inspect doors.
            </p>
          </div>
          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {whyItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-xl border border-border/60 bg-background p-6 transition-all hover:border-accent/30 hover:shadow-md"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <Icon className="h-5 w-5" strokeWidth={2.25} />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-primary">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="trust" className="relative overflow-hidden bg-primary py-24 text-primary-foreground lg:py-32">
        <div className="pointer-events-none absolute inset-0 bg-glow opacity-50" />
        <div className="container relative mx-auto px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold tracking-wider text-accent uppercase">
                Trust & compliance
              </div>
              <h2 className="mt-4 font-display text-3xl leading-tight font-extrabold tracking-tight text-balance sm:text-4xl lg:text-5xl">
                The badge that means something.
              </h2>
              <p className="mt-4 text-lg text-primary-foreground/70">
                Becoming a Verified Affiliate isn&apos;t automatic. We check, we
                approve, we vouch. That&apos;s why clients pick names from our
                directory.
              </p>
              <div className="mt-8 inline-flex items-center gap-3 rounded-xl bg-accent-gradient p-4 shadow-accent-glow">
                <ShieldCheck
                  className="h-6 w-6 text-accent-foreground"
                  strokeWidth={2.5}
                />
                <div>
                  <div className="text-xs font-semibold tracking-wider text-accent-foreground/80 uppercase">
                    FireDoor Network
                  </div>
                  <div className="font-display text-lg font-bold text-accent-foreground">
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
                    className="flex gap-5 rounded-xl border border-white/10 bg-white/5 p-6 transition-all hover:border-accent/40 hover:bg-white/[0.07]"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
                      <Icon className="h-5 w-5" strokeWidth={2.25} />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-primary-foreground/70">
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
          <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-hero-gradient p-10 sm:p-14 lg:p-20">
            <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
            <div className="relative max-w-3xl">
              <h2 className="font-display text-3xl leading-tight font-extrabold tracking-tight text-balance text-primary-foreground sm:text-4xl lg:text-5xl">
                Ready to turn your certifications into a queue of clients?
              </h2>
              <p className="mt-4 max-w-2xl text-lg text-primary-foreground/70">
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
                  className="inline-flex h-14 items-center justify-center rounded-lg border border-white/15 px-8 text-base font-semibold text-primary-foreground transition-colors hover:bg-white/10"
                >
                  Talk to the team
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-14 sm:px-6">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2">
                <LogoMark />
                <span className="font-display text-lg font-bold">
                  FireDoor <span className="text-accent">Network</span>
                </span>
              </Link>
              <p className="mt-4 max-w-sm text-sm text-primary-foreground/60">
                The UK network connecting verified fire door surveyors and
                inspectors with the clients who need them.
              </p>
            </div>
            <div>
              <h4 className="font-display text-sm font-bold tracking-wider uppercase">
                For affiliates
              </h4>
              <ul className="mt-4 space-y-2 text-sm text-primary-foreground/60">
                <li>
                  <Link href="/apply" className="transition-colors hover:text-accent">
                    Apply now
                  </Link>
                </li>
                <li>
                  <a href="#how" className="transition-colors hover:text-accent">
                    How it works
                  </a>
                </li>
                <li>
                  <a href="#why" className="transition-colors hover:text-accent">
                    Why join
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-accent">
                    Member sign in
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-display text-sm font-bold tracking-wider uppercase">
                Company
              </h4>
              <ul className="mt-4 space-y-2 text-sm text-primary-foreground/60">
                <li>
                  <a href="#" className="transition-colors hover:text-accent">
                    About
                  </a>
                </li>
                <li>
                  <a href="#trust" className="transition-colors hover:text-accent">
                    Compliance
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-accent">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-accent">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col justify-between gap-4 border-t border-white/5 pt-8 text-xs text-primary-foreground/50 sm:flex-row">
            <p>© {new Date().getFullYear()} FireDoor Network. All rights reserved.</p>
            <p>Built for surveyors, by people who know the trade.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
