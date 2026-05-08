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
  title: "Inspector profile — Fire Door Inspection Network",
  description:
    "Public profile for an approved Fire Door Inspection Network inspector.",
};

export default async function AffiliateProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/directory?profile=${encodeURIComponent(id)}`);
}

