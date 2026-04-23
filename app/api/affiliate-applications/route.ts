import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  affiliateApplicationFieldSchema,
  assertFileOk,
  BUCKET,
  sanitizeFilename,
} from "@/lib/affiliate-application";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_CERT_FILES = 8;

export async function POST(request: Request) {
  const uploadedPaths: string[] = [];

  try {
    const formData = await request.formData();

    const raw = {
      full_name: formData.get("full_name"),
      company_name: formData.get("company_name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      postcode: formData.get("postcode"),
      years_experience: formData.get("years_experience"),
      areas_covered: formData.get("areas_covered"),
      password: formData.get("password"),
    };

    const parsed = affiliateApplicationFieldSchema.safeParse({
      full_name: typeof raw.full_name === "string" ? raw.full_name : "",
      company_name: typeof raw.company_name === "string" ? raw.company_name : "",
      email: typeof raw.email === "string" ? raw.email : "",
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

    const password =
      typeof raw.password === "string" ? raw.password.trim() : "";
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    const certEntries = formData
      .getAll("certifications")
      .filter((v): v is File => v instanceof File && v.size > 0);
    const insuranceEntry = formData.get("insurance");
    const dbsEntry = formData.get("dbs");

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

    const supabase = createAdminClient();
    const applicationId = randomUUID();

    // Create (or ensure) a Supabase Auth user so they can sign in after applying.
    // Use the *public* email + password the applicant submitted.
    const { data: createdUser, error: createUserError } =
      await supabase.auth.admin.createUser({
        email: fields.email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fields.full_name,
          company_name: fields.company_name,
          application_id: applicationId,
        },
      });

    if (createUserError) {
      const message = createUserError.message || "Unable to create user";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const userId = createdUser.user?.id ?? null;

    const uploadOne = async (file: File, storagePath: string) => {
      const buf = Buffer.from(await file.arrayBuffer());
      const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buf, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
      if (error) {
        throw new Error(error.message);
      }
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

    const { data: inserted, error: insertError } = await supabase
      .from("affiliate_applications")
      .insert({
        id: applicationId,
        user_id: userId,
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
      })
      .select("id")
      .single();

    if (insertError) {
      throw new Error(insertError.message);
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
