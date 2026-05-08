import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import {
  affiliateApplicationFieldSchema,
  assertUploadMetaOk,
  BUCKET,
  MAX_CERT_FILES,
  MAX_SAMPLE_REPORTS,
  sanitizeFilename,
} from "@/lib/affiliate-application";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

const fileMetaSchema = z.object({
  filename: z.string().trim().min(1).max(500),
  size: z.number().int().positive().max(5 * 1024 * 1024),
  mimeType: z.string().max(255).optional(),
});

const prepareBodySchema = z.object({
  certifications: z.array(fileMetaSchema).min(1).max(MAX_CERT_FILES),
  insurance: fileMetaSchema,
  dbs: fileMetaSchema.nullable().optional(),
  profile_photo: fileMetaSchema.nullable().optional(),
  sample_reports: z.array(fileMetaSchema).max(MAX_SAMPLE_REPORTS).default([]),
  company_name: z.string(),
  phone: z.string(),
  postcode: z.string(),
  years_experience: z.union([z.string(), z.number()]),
  areas_covered: z.string(),
  bio: z.string(),
  services: z.string(),
});

export type SignedUploadInstruction = {
  kind: string;
  index?: number;
  storagePath: string;
  token: string;
};

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return NextResponse.json(
      { error: "Missing Supabase public env vars" },
      { status: 500 },
    );
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : "";
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const publicClient = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: userData, error: userErr } = await publicClient.auth.getUser();
  if (userErr || !userData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = userData.user;

  let bodyJson: unknown;
  try {
    bodyJson = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const bodyParse = prepareBodySchema.safeParse(bodyJson);
  if (!bodyParse.success) {
    const msg = bodyParse.error.issues.map((i) => i.message).join("; ");
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  const b = bodyParse.data;

  const full_name =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email ??
    "Affiliate";

  const parsedFields = affiliateApplicationFieldSchema.safeParse({
    full_name,
    company_name: b.company_name,
    email: user.email ?? "",
    phone: b.phone,
    postcode: b.postcode,
    years_experience: b.years_experience,
    areas_covered: b.areas_covered,
  });
  if (!parsedFields.success) {
    const msg = parsedFields.error.issues.map((i) => i.message).join("; ");
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const bio = b.bio.trim();
  const services = b.services.trim();
  if (bio.length < 10) {
    return NextResponse.json({ error: "Bio is required" }, { status: 400 });
  }
  if (services.length < 3) {
    return NextResponse.json({ error: "Services is required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("affiliate_applications")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing?.id) {
    return NextResponse.json(
      { error: "Application already submitted" },
      { status: 409 },
    );
  }

  for (let i = 0; i < b.certifications.length; i++) {
    const f = b.certifications[i];
    const r = assertUploadMetaOk(f.size, f.mimeType, f.filename, `Certification ${i + 1}`);
    if (!r.ok) return NextResponse.json({ error: r.message }, { status: 400 });
  }
  let ins = assertUploadMetaOk(b.insurance.size, b.insurance.mimeType, b.insurance.filename, "Insurance");
  if (!ins.ok) return NextResponse.json({ error: ins.message }, { status: 400 });
  if (b.dbs) {
    ins = assertUploadMetaOk(b.dbs.size, b.dbs.mimeType, b.dbs.filename, "DBS");
    if (!ins.ok) return NextResponse.json({ error: ins.message }, { status: 400 });
  }
  if (b.profile_photo) {
    ins = assertUploadMetaOk(
      b.profile_photo.size,
      b.profile_photo.mimeType,
      b.profile_photo.filename,
      "Photo / logo",
    );
    if (!ins.ok) return NextResponse.json({ error: ins.message }, { status: 400 });
  }
  for (let i = 0; i < b.sample_reports.length; i++) {
    const f = b.sample_reports[i];
    ins = assertUploadMetaOk(f.size, f.mimeType, f.filename, `Sample report ${i + 1}`);
    if (!ins.ok) return NextResponse.json({ error: ins.message }, { status: 400 });
  }

  const applicationId = randomUUID();
  const uploads: SignedUploadInstruction[] = [];

  for (let i = 0; i < b.certifications.length; i++) {
    const name = sanitizeFilename(b.certifications[i].filename || `cert-${i}.pdf`);
    const storagePath = `${applicationId}/cert_${i}_${name}`;
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(storagePath);
    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "Could not prepare certification upload" },
        { status: 500 },
      );
    }
    uploads.push({
      kind: "certification",
      index: i,
      storagePath: data.path,
      token: data.token,
    });
  }

  {
    const name = sanitizeFilename(b.insurance.filename || "insurance.pdf");
    const storagePath = `${applicationId}/insurance_${name}`;
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(storagePath);
    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "Could not prepare insurance upload" },
        { status: 500 },
      );
    }
    uploads.push({ kind: "insurance", storagePath: data.path, token: data.token });
  }

  if (b.dbs) {
    const name = sanitizeFilename(b.dbs.filename || "dbs.pdf");
    const storagePath = `${applicationId}/dbs_${name}`;
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(storagePath);
    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "Could not prepare DBS upload" },
        { status: 500 },
      );
    }
    uploads.push({ kind: "dbs", storagePath: data.path, token: data.token });
  }

  if (b.profile_photo) {
    const name = sanitizeFilename(b.profile_photo.filename || "photo.webp");
    const storagePath = `${applicationId}/profile_${name}`;
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(storagePath);
    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "Could not prepare profile photo upload" },
        { status: 500 },
      );
    }
    uploads.push({ kind: "profile_photo", storagePath: data.path, token: data.token });
  }

  for (let i = 0; i < b.sample_reports.length; i++) {
    const name = sanitizeFilename(b.sample_reports[i].filename || `sample-${i}.pdf`);
    const storagePath = `${applicationId}/sample_${i}_${name}`;
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(storagePath);
    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "Could not prepare sample upload" },
        { status: 500 },
      );
    }
    uploads.push({ kind: "sample_report", index: i, storagePath: data.path, token: data.token });
  }

  return NextResponse.json({ application_id: applicationId, uploads }, { status: 200 });
}
