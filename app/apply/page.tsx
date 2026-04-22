import type { Metadata } from "next";
import { AffiliateApplicationForm } from "@/components/apply/AffiliateApplicationForm";

export const metadata: Metadata = {
  title: "Become an Affiliate — FireDoor Network",
  description:
    "Apply to join the UK network for verified fire door surveyors and inspectors.",
};

export default function ApplyPage() {
  return (
    <main className="relative min-h-dvh w-full text-white">
      <div className="container relative mx-auto px-4 py-10 sm:px-6 lg:py-14">
        <AffiliateApplicationForm />
      </div>
    </main>
  );
}
