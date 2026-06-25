import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// 1x1 transparent GIF, base64-decoded at request time
const PIXEL_GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
  "base64"
);

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const leadId = params.id;

  try {
    const { data: lead } = await supabaseAdmin
      .from("leads")
      .select("open_count")
      .eq("id", leadId)
      .single();

    await supabaseAdmin
      .from("leads")
      .update({
        opened: true,
        opened_at: new Date().toISOString(),
        open_count: (lead?.open_count || 0) + 1,
      })
      .eq("id", leadId);
  } catch (err) {
    // Never fail the pixel response just because logging failed —
    // the email client is waiting on this image to render.
    console.error("Open tracking error:", err);
  }

  return new NextResponse(PIXEL_GIF, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
