"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const nav = [
  { label: "How it works", href: "#how" },
  { label: "Why join", href: "#why" },
  { label: "Trust", href: "#trust" },
  { label: "Directory", href: "#directory" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="container mx-auto px-4 pt-4 sm:px-6">
        <div className="menu-water relative overflow-hidden rounded-2xl bg-primary/55 backdrop-blur-md shadow-[0_18px_45px_-18px_rgba(0,0,0,0.45)] ring-1 ring-white/12">
          <nav className="flex h-14 items-center justify-between px-3 sm:px-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-primary-foreground transition-opacity hover:opacity-90"
            >
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
              <span className="font-display text-base font-bold tracking-tight sm:text-lg">
                FireDoor <span className="text-accent">Network</span>
              </span>
            </Link>

            <div className="hidden items-center gap-8 md:flex">
              {nav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm font-semibold text-primary-foreground/85 underline-offset-8 transition-colors hover:text-primary-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <a
                href="#"
                className="rounded-lg px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-white/10"
              >
                Sign in
              </a>
              <Link
                href="/apply"
                className="rounded-lg bg-accent-gradient px-4 py-2 text-sm font-semibold text-accent-foreground shadow-accent-glow transition-opacity hover:opacity-95"
              >
                Become an Affiliate
              </Link>
            </div>

            <button
              type="button"
              className="rounded-xl p-2 text-primary-foreground transition-colors hover:bg-white/10 md:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </nav>

          {open ? (
            <div className="border-t border-white/12 bg-primary/55 backdrop-blur-md md:hidden">
              <div className="flex flex-col gap-4 px-4 py-4">
                {nav.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="text-sm font-semibold text-primary-foreground/90"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
                <Link
                  href="/apply"
                  className="w-full rounded-lg bg-accent-gradient py-3 text-center text-sm font-semibold text-accent-foreground shadow-accent-glow transition-opacity hover:opacity-95"
                  onClick={() => setOpen(false)}
                >
                  Become an Affiliate
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <style jsx>{`
        .menu-water::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.55;
          mix-blend-mode: screen;
          background-image: linear-gradient(
              110deg,
              rgba(255, 255, 255, 0) 0%,
              rgba(255, 255, 255, 0.08) 18%,
              rgba(255, 106, 26, 0.1) 38%,
              rgba(255, 255, 255, 0.06) 52%,
              rgba(255, 255, 255, 0) 70%
            ),
            radial-gradient(
              120% 90% at 0% 50%,
              rgba(255, 255, 255, 0.06),
              rgba(255, 255, 255, 0) 60%
            );
          background-size: 220% 100%, 120% 100%;
          background-position: 0% 50%, 0% 50%;
          animation: menu-water-flow 7.5s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .menu-water::before {
            animation: none;
            opacity: 0.35;
          }
        }

        @keyframes menu-water-flow {
          0% {
            background-position: 0% 50%, 0% 50%;
          }
          100% {
            background-position: 100% 50%, 120% 50%;
          }
        }
      `}</style>
    </header>
  );
}
