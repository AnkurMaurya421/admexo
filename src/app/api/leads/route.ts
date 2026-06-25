import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { classifyLead } from "@/lib/classify";
import { sendLeadEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, company, requirement } = body;

    if (!name || !email || !phone || !requirement) {
      return NextResponse.json(
        { error: "name, email, phone and requirement are required" },
        { status: 400 }
      );
    }

    const { category, priority } = await classifyLead(requirement);

    const { data: lead, error } = await supabaseAdmin
      .from("leads")
      .insert({
        name,
        email,
        phone,
        company: company || null,
        requirement,
        category,
        priority,
      })
      .select()
      .single();

    if (error) throw error;

    // Send the personalized email, then mark it as sent
    await sendLeadEmail(lead, email);

    await supabaseAdmin
      .from("leads")
      .update({ email_sent: true, email_sent_at: new Date().toISOString() })
      .eq("id", lead.id);

    return NextResponse.json({ success: true, leadId: lead.id, category, priority });
  } catch (err: any) {
    console.error("Error creating lead:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
