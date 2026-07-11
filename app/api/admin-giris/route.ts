import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { sifre } = await req.json();
  const dogru = process.env.ADMIN_SIFRE;
  if (!dogru) return NextResponse.json({ error: "ADMIN_SIFRE tanımlı değil" }, { status: 500 });
  if (sifre !== dogru) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true });
}
