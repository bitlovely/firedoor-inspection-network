import type { Metadata } from "next";
import Image from "next/image";
import { SignUpClient } from "./SignUpClient";

export const metadata: Metadata = {
  title: "Sign up — Fire Door Network",
  description: "Create your Fire Door Network inspector account.",
};

export default function SignUpPage() {
  return (
    <main className="relative min-h-dvh w-full overflow-hidden text-white">
      <div className="pointer-events-none absolute inset-0 z-0 select-none" aria-hidden>
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

      <div className="container relative z-10 mx-auto flex min-h-dvh items-center justify-center px-4 py-14 sm:px-6">
        <SignUpClient />
      </div>
    </main>
  );
}
