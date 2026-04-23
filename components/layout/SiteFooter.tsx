import Link from "next/link";
import Image from "next/image";

function LogoMark() {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-gradient shadow-accent-glow">
      <Image
        src="/logo-mark.svg"
        alt=""
        width={20}
        height={20}
        className="h-5 w-5"
        priority
      />
    </span>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black text-white">
      <div className="container mx-auto px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <LogoMark />
              <span className="font-display text-lg font-bold">
                FireDoor <span className="text-accent">Network</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-white/60">
              The UK network connecting verified fire door surveyors and inspectors with the
              clients who need them.
            </p>
          </div>
          <div>
            <h4 className="font-display text-sm font-bold tracking-wider uppercase">
              For affiliates
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-white/60">
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
                <a href="#" className="transition-colors hover:text-accent">
                  About
                </a>
              </li>
              <li>
                <a href="#trust" className="transition-colors hover:text-accent">
                  Terms
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
        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} FireDoor Network. All rights reserved.</p>
          <p>Built for surveyors, by people who know the trade.</p>
        </div>
      </div>
    </footer>
  );
}

