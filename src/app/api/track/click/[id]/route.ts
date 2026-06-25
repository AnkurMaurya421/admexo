import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const leadId = params.id;
  const { searchParams } = new URL(req.url);
  const destination = searchParams.get("url") || "https://admexo.com";

  try {
    const { data: lead } = await supabaseAdmin
      .from("leads")
      .select("click_count")
      .eq("id", leadId)
      .single();

    await supabaseAdmin
      .from("leads")
      .update({
        clicked: true,
        clicked_at: new Date().toISOString(),
        click_count: (lead?.click_count || 0) + 1,
      })
      .eq("id", leadId);
  } catch (err) {
    console.error("Click tracking error:", err);
  }

  return NextResponse.redirect(destination, { status: 302 });
}
