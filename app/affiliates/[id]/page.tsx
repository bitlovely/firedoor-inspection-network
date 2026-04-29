import type { Metadata } from "next";
import { redirect } from "next/navigation";

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
  title: "Affiliate profile — FireDoor Inspection Network",
  description:
    "Public profile for an approved FireDoor Inspection Network affiliate.",
};

export default async function AffiliateProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/directory?profile=${encodeURIComponent(id)}`);
}

