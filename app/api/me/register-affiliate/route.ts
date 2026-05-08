import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  affiliateApplicationFieldSchema,
  assertFileOk,
  BUCKET,
  sanitizeFilename,
} from "@/lib/affiliate-application";
import { sendApplicationReceivedEmail } from "@/lib/email/send-application-received";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_CERT_FILES = 8;
const MAX_SAMPLE_REPORTS = 3;

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

  const uploadedPaths: string[] = [];
  try {
    const formData = await request.formData();

    const full_name =
      (userData.user.user_metadata?.full_name as string | undefined) ??
      userData.user.email ??
      "Inspector";

    const raw = {
      full_name,
      company_name: formData.get("company_name"),
      email: userData.user.email ?? "",
      phone: formData.get("phone"),
      postcode: formData.get("postcode"),
      years_experience: formData.get("years_experience"),
      areas_covered: formData.get("areas_covered"),
      bio: formData.get("bio"),
      services: formData.get("services"),
    };

    const parsed = affiliateApplicationFieldSchema.safeParse({
      full_name: raw.full_name,
      company_name: typeof raw.company_name === "string" ? raw.company_name : "",
      email: raw.email,
      phone: typeof raw.phone === "string" ? raw.phone : "",
      postcode: typeof raw.postcode === "string" ? raw.postcode : "",
      years_experience: raw.years_experience,
      areas_covered: typeof raw.areas_covered === "string" ? raw.areas_covered : "",
    });

    if (!parsed.success) {
      const msg = parsed.error.issues.map((i) => i.message).join("; ");
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    const fields = parsed.data;

    const bio = typeof raw.bio === "string" ? raw.bio.trim() : "";
    const services = typeof raw.services === "string" ? raw.services.trim() : "";
    if (bio.length < 10) {
      return NextResponse.json({ error: "Bio is required" }, { status: 400 });
    }
    if (services.length < 3) {
      return NextResponse.json({ error: "Services is required" }, { status: 400 });
    }

    const certEntries = formData
      .getAll("certifications")
      .filter((v): v is File => v instanceof File && v.size > 0);
    const insuranceEntry = formData.get("insurance");
    const dbsEntry = formData.get("dbs");
    const photoEntry = formData.get("profile_photo");
    const sampleEntries = formData
      .getAll("sample_reports")
      .filter((v): v is File => v instanceof File && v.size > 0);

    if (certEntries.length === 0) {
      return NextResponse.json(
        { error: "Upload at least one certification file" },
        { status: 400 },
      );
    }
    if (certEntries.length > MAX_CERT_FILES) {
      return NextResponse.json(
        { error: `At most ${MAX_CERT_FILES} certification files` },
        { status: 400 },
      );
    }
    if (!(insuranceEntry instanceof File)) {
      return NextResponse.json(
        { error: "Insurance proof file is required" },
        { status: 400 },
      );
    }

    for (let i = 0; i < certEntries.length; i++) {
      const r = assertFileOk(certEntries[i], `Certification ${i + 1}`);
      if (!r.ok) return NextResponse.json({ error: r.message }, { status: 400 });
    }
    const insCheck = assertFileOk(insuranceEntry, "Insurance");
    if (!insCheck.ok) {
      return NextResponse.json({ error: insCheck.message }, { status: 400 });
    }

    let dbsFile: File | null = null;
    if (dbsEntry instanceof File && dbsEntry.size > 0) {
      const dbsCheck = assertFileOk(dbsEntry, "DBS");
      if (!dbsCheck.ok) {
        return NextResponse.json({ error: dbsCheck.message }, { status: 400 });
      }
      dbsFile = dbsEntry;
    }

    let photoFile: File | null = null;
    if (photoEntry instanceof File && photoEntry.size > 0) {
      const photoCheck = assertFileOk(photoEntry, "Photo / logo");
      if (!photoCheck.ok) {
        return NextResponse.json({ error: photoCheck.message }, { status: 400 });
      }
      photoFile = photoEntry;
    }

    if (sampleEntries.length > MAX_SAMPLE_REPORTS) {
      return NextResponse.json(
        { error: `At most ${MAX_SAMPLE_REPORTS} sample reports` },
        { status: 400 },
      );
    }
    for (let i = 0; i < sampleEntries.length; i++) {
      const r = assertFileOk(sampleEntries[i], `Sample report ${i + 1}`);
      if (!r.ok) return NextResponse.json({ error: r.message }, { status: 400 });
    }

    const supabase = createAdminClient();

    // If user already has an application, prevent duplicates.
    const { data: existing } = await supabase
      .from("affiliate_applications")
      .select("id")
      .eq("user_id", userData.user.id)
      .maybeSingle();
    if (existing?.id) {
      return NextResponse.json(
        { error: "Application already submitted" },
        { status: 409 },
      );
    }

    const applicationId = randomUUID();

    const uploadOne = async (file: File, storagePath: string) => {
      const buf = Buffer.from(await file.arrayBuffer());
      const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buf, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
      if (error) throw new Error(error.message);
      uploadedPaths.push(storagePath);
    };

    const certificationPaths: string[] = [];
    for (let i = 0; i < certEntries.length; i++) {
      const file = certEntries[i];
      const name = sanitizeFilename(file.name || `cert-${i}.pdf`);
      const path = `${applicationId}/cert_${i}_${name}`;
      await uploadOne(file, path);
      certificationPaths.push(path);
    }

    const insuranceName = sanitizeFilename(insuranceEntry.name || "insurance.pdf");
    const insurancePath = `${applicationId}/insurance_${insuranceName}`;
    await uploadOne(insuranceEntry, insurancePath);

    let dbsPath: string | null = null;
    if (dbsFile) {
      const dbsName = sanitizeFilename(dbsFile.name || "dbs.pdf");
      dbsPath = `${applicationId}/dbs_${dbsName}`;
      await uploadOne(dbsFile, dbsPath);
    }

    let profilePhotoPath: string | null = null;
    if (photoFile) {
      const name = sanitizeFilename(photoFile.name || "photo.webp");
      profilePhotoPath = `${applicationId}/profile_${name}`;
      await uploadOne(photoFile, profilePhotoPath);
    }

    const sampleReportPaths: string[] = [];
    for (let i = 0; i < sampleEntries.length; i++) {
      const file = sampleEntries[i];
      const name = sanitizeFilename(file.name || `sample-${i}.pdf`);
      const path = `${applicationId}/sample_${i}_${name}`;
      await uploadOne(file, path);
      sampleReportPaths.push(path);
    }

    const { data: inserted, error: insertError } = await supabase
      .from("affiliate_applications")
      .insert({
        id: applicationId,
        user_id: userData.user.id,
        full_name: fields.full_name,
        company_name: fields.company_name,
        email: fields.email,
        phone: fields.phone,
        postcode: fields.postcode,
        years_experience: fields.years_experience,
        areas_covered: fields.areas_covered,
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

    if (insertError) throw new Error(insertError.message);

    try {
      await sendApplicationReceivedEmail({
        to: fields.email,
        applicantName: fields.full_name,
        companyName: fields.company_name,
      });
    } catch (emailErr) {
      console.error("[register-affiliate] confirmation email failed:", emailErr);
    }

    return NextResponse.json({ id: inserted.id }, { status: 201 });
  } catch (e) {
    if (uploadedPaths.length > 0) {
      try {
        const supabase = createAdminClient();
        await supabase.storage.from(BUCKET).remove(uploadedPaths);
      } catch {
        /* best-effort cleanup */
      }
    }
    const message = e instanceof Error ? e.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

