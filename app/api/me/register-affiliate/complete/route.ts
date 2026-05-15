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
import { sendApplicationReceivedEmail } from "@/lib/email/send-application-received";
import { createUniqueFdinPin } from "@/lib/fdin-pin";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

const fileMetaSchema = z.object({
  filename: z.string().trim().min(1).max(500),
  size: z.number().int().positive().max(5 * 1024 * 1024),
  mimeType: z.string().max(255).optional(),
});

const completeBodySchema = z.object({
  application_id: z.uuid(),
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

async function removeApplicationPrefix(supabase: ReturnType<typeof createAdminClient>, applicationId: string) {
  const { data: list } = await supabase.storage.from(BUCKET).list(applicationId, {
    limit: 200,
  });
  const names = (list ?? []).map((o) => `${applicationId}/${o.name}`);
  if (names.length > 0) {
    await supabase.storage.from(BUCKET).remove(names);
  }
}

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

  const bodyParse = completeBodySchema.safeParse(bodyJson);
  if (!bodyParse.success) {
    const msg = bodyParse.error.issues.map((i) => i.message).join("; ");
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  const b = bodyParse.data;

  const applicationId = b.application_id;

  const full_name =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email ??
    "Inspector";

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

  const certificationPaths: string[] = [];
  for (let i = 0; i < b.certifications.length; i++) {
    const name = sanitizeFilename(b.certifications[i].filename || `cert-${i}.pdf`);
    certificationPaths.push(`${applicationId}/cert_${i}_${name}`);
  }

  const insurancePath = `${applicationId}/insurance_${sanitizeFilename(b.insurance.filename || "insurance.pdf")}`;
  let dbsPath: string | null = null;
  if (b.dbs) {
    dbsPath = `${applicationId}/dbs_${sanitizeFilename(b.dbs.filename || "dbs.pdf")}`;
  }
  let profilePhotoPath: string | null = null;
  if (b.profile_photo) {
    profilePhotoPath = `${applicationId}/profile_${sanitizeFilename(b.profile_photo.filename || "photo.webp")}`;
  }
  const sampleReportPaths: string[] = [];
  for (let i = 0; i < b.sample_reports.length; i++) {
    const name = sanitizeFilename(b.sample_reports[i].filename || `sample-${i}.pdf`);
    sampleReportPaths.push(`${applicationId}/sample_${i}_${name}`);
  }

  const expectedPaths = [
    ...certificationPaths,
    insurancePath,
    ...(dbsPath ? [dbsPath] : []),
    ...(profilePhotoPath ? [profilePhotoPath] : []),
    ...sampleReportPaths,
  ];

  const expectedBasenames = new Set(expectedPaths.map((p) => p.slice(applicationId.length + 1)));

  const { data: listFiles, error: listErr } = await supabase.storage.from(BUCKET).list(applicationId, {
    limit: 200,
  });
  if (listErr) {
    return NextResponse.json({ error: listErr.message }, { status: 500 });
  }
  const present = new Set((listFiles ?? []).map((o) => o.name));
  for (const base of expectedBasenames) {
    if (!present.has(base)) {
      return NextResponse.json(
        {
          error: `Missing uploaded file (${base}). Please retry upload or confirm each file finished uploading.`,
        },
        { status: 400 },
      );
    }
  }

  const fdinPin = await createUniqueFdinPin(supabase);

  const { data: inserted, error: insertError } = await supabase
    .from("affiliate_applications")
    .insert({
      id: applicationId,
      fdin_pin: fdinPin,
      user_id: user.id,
      full_name: parsedFields.data.full_name,
      company_name: parsedFields.data.company_name,
      email: parsedFields.data.email,
      phone: parsedFields.data.phone,
      postcode: parsedFields.data.postcode,
      years_experience: parsedFields.data.years_experience,
      areas_covered: parsedFields.data.areas_covered,
      certification_paths: certificationPaths,
      insurance_path: insurancePath,
      dbs_path: dbsPath,
      bio,
      services,
      profile_photo_path: profilePhotoPath,
      sample_report_paths: sampleReportPaths,
      status: "pending",
    })
    .select("id")
    .single();

  if (insertError) {
    await removeApplicationPrefix(supabase, applicationId);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  try {
    await sendApplicationReceivedEmail({
      to: parsedFields.data.email,
      applicantName: parsedFields.data.full_name,
      companyName: parsedFields.data.company_name,
      fdinPin,
    });
  } catch (emailErr) {
    console.error("[register-affiliate/complete] confirmation email failed:", emailErr);
  }

  return NextResponse.json({ id: inserted!.id }, { status: 201 });
}
