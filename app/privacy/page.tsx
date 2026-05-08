import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Fire Door Inspection Network",
  description: "Privacy policy for Fire Door Inspection Network.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh bg-black text-white">
      <div className="container mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
        <p className="mt-3 text-sm text-white/70">
          How Fire Door Inspection Network operates and what it means for users and inspectors.
        </p>

        <div className="mt-10 rounded-3xl border border-white/15 bg-white/5 p-6 text-sm text-white/80">
          <p>
            We provide a digital platform that connects qualified fire door surveyors and
            inspectors with potential clients and business opportunities. The service operates
            as a network and directory where professionals (“Inspectors”) can create profiles,
            submit credentials, and showcase their experience, coverage areas, and
            certifications.
          </p>
          <p className="mt-4">
            Our platform enables Inspectors to apply for inclusion, undergo a verification
            process, and, if approved, be listed in a public directory accessible to users
            seeking fire door inspection and surveying services. The platform also allows users
            to search for Inspectors based on location and other criteria, and to contact them
            directly for potential work opportunities.
          </p>
          <p className="mt-4">
            We act solely as an intermediary platform and do not provide fire door inspection
            services directly. We do not guarantee the quality, accuracy, or legality of
            services provided by Inspectors. Inspectors are independent professionals
            responsible for maintaining their own certifications, insurance, and compliance
            with applicable laws and industry standards.
          </p>
        </div>

        <div className="mt-8">
          <Link href="/" className="text-sm text-white underline-offset-4 hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}

