import { NextResponse } from "next/server";
import { directoryEnquirySchema } from "@/lib/directory-enquiry";
import { sendDirectoryEnquiryEmail } from "@/lib/email/send-directory-enquiry";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: affiliateId } = await params;
  if (!affiliateId) {
    return NextResponse.json({ error: "Missing inspector id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = directoryEnquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid enquiry", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  const { data: inspector, error: lookupError } = await supabase
    .from("affiliate_applications")
    .select("id,status,full_name,company_name,postcode,fdin_pin")
    .eq("id", affiliateId)
    .in("status", ["approved", "verified"])
    .maybeSingle();

  if (lookupError) {
    return NextResponse.json({ error: lookupError.message }, { status: 500 });
  }
  if (!inspector) {
    return NextResponse.json({ error: "Inspector not found" }, { status: 404 });
  }

  const enquiry = parsed.data;
  const { error: insertError } = await supabase.from("directory_enquiries").insert({
    affiliate_application_id: affiliateId,
    enquirer_name: enquiry.name,
    enquirer_email: enquiry.email,
    enquirer_phone: enquiry.phone,
    enquirer_postcode: enquiry.postcode,
    message: enquiry.message,
  });

  if (insertError) {
    if (/directory_enquiries/i.test(insertError.message)) {
      return NextResponse.json(
        {
          error:
            "Enquiries are not configured yet. Run migration 006_directory_enquiries.sql in Supabase.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  try {
    await sendDirectoryEnquiryEmail(
      {
        id: inspector.id,
        full_name: inspector.full_name,
        company_name: inspector.company_name,
        postcode: inspector.postcode,
        fdin_pin: inspector.fdin_pin ?? null,
      },
      {
        name: enquiry.name,
        email: enquiry.email,
        phone: enquiry.phone,
        postcode: enquiry.postcode,
        message: enquiry.message,
      },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to send notification";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
