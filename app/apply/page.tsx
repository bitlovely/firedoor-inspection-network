import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AffiliateApplicationForm } from "@/components/apply/AffiliateApplicationForm";

export const metadata: Metadata = {
  title: "Become an Affiliate — FireDoor Network",
  description:
    "Apply to join the UK network for verified fire door surveyors and inspectors.",
};

export default function ApplyPage() {
  return (
    <main className="relative min-h-dvh w-full overflow-hidden text-white">
      <div
        className="pointer-events-none absolute inset-0 z-0 select-none"
        aria-hidden
      >
        <Image
          src="/hero-firedoor.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
          quality={80}
        />
        <div className="absolute inset-0 bg-black/68" />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-10 sm:px-6 lg:py-14">
        <header className="mb-8 text-center lg:mb-10">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Become an Affiliate
          </h1>
        </header>
        <AffiliateApplicationForm />
        <div className="mt-10 text-center text-xs text-white sm:text-sm">
          <Link href="/" className="underline-offset-4 hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
