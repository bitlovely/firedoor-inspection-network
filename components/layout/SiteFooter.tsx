import Link from "next/link";
import Image from "next/image";

function LogoMark() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-gradient shadow-accent-glow">
      <Image
        src="/logo-mark.svg"
        alt=""
        width={18}
        height={18}
        className="h-[18px] w-[18px]"
        priority
      />
    </span>
  );
}

const contactEmail =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "contact@firedoornetwork.com";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black text-white">
      <div className="container mx-auto px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <LogoMark />
              <span className="font-display text-lg font-bold">
                Fire Door <span className="text-accent">Network</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-white/60">
              The UK network connecting verified fire door surveyors and inspectors with the
              clients who need them.
            </p>
          </div>
          <div>
            <h4 className="font-display text-sm font-bold tracking-wider uppercase">
              For inspectors
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-white/60">
              <li>
                <Link href="/signup" className="transition-colors hover:text-accent">
                  Apply now
                </Link>
              </li>
              <li>
                <Link href="/#how" className="transition-colors hover:text-accent">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/#why" className="transition-colors hover:text-accent">
                  Why join
                </Link>
              </li>
              <li>
                <Link href="/#trust" className="transition-colors hover:text-accent">
                  Trust
                </Link>
              </li>
              <li>
                <Link href="/signin" className="transition-colors hover:text-accent">
                  Member sign in
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm font-bold tracking-wider uppercase">Company</h4>
            <ul className="mt-4 space-y-2 text-sm text-white/60">
              <li>
                <Link href="/terms" className="transition-colors hover:text-accent">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="transition-colors hover:text-accent">
                  Privacy
                </Link>
              </li>
              <li>
                <a
                  href={`mailto:${contactEmail}`}
                  className="transition-colors hover:text-accent"
                >
                  Contact us
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} Fire Door Network. All rights reserved.
          </p>
          <p>Built for surveyors, by people who know the trade.</p>
        </div>
      </div>
    </footer>
  );
}

