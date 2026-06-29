import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase-admin";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { data, error } = await getSupabaseAdmin().from("talepler").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id gerekli" }, { status: 400 });
  const { data, error } = await getSupabaseAdmin().from("talepler").update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function GET(req: NextRequest) {
  const musteri_id = req.nextUrl.searchParams.get("musteri_id");
  const sofor_id = req.nextUrl.searchParams.get("sofor_id");
  const firma_id = req.nextUrl.searchParams.get("firma_id");

  let query = getSupabaseAdmin().from("talepler").select("*").order("created_at", { ascending: false });
  if (musteri_id) query = query.eq("musteri_id", musteri_id);
  if (sofor_id) query = query.eq("atanan_sofor", sofor_id);
  if (firma_id) query = query.eq("firma_id", firma_id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
