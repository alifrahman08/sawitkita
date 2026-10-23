import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const payment = await db.payments.findById(id);
    if (!payment) {
      return NextResponse.json({ error: "Data pembayaran tidak ditemukan" }, { status: 404 });
    }

    if (user.role === "ANGGOTA" && user.memberId !== payment.memberId) {
      return NextResponse.json(
        { error: "Akses ditolak: Anda tidak memiliki izin melihat pembayaran anggota lain." },
        { status: 403 }
      );
    }

    return NextResponse.json(payment);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
