import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(["SUPER_ADMIN", "ADMIN"]);
    const { id } = await params;

    const trx = await db.transactions.findById(id);
    if (!trx) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
    }

    if (trx.status !== "MENUNGGU_VERIFIKASI" && trx.status !== "DRAFT") {
      return NextResponse.json(
        { error: `Transaksi ini sudah berstatus ${trx.status} dan tidak dapat diverifikasi ulang.` },
        { status: 400 }
      );
    }

    const verified = await db.transactions.verify(id, user.id);

    await db.auditLogs.create({
      userId: user.id,
      userName: user.name,
      action: "VERIFY",
      entity: "WeighingTransaction",
      entityId: id,
      details: `Verifikasi penimbangan TBS ${trx.transactionNo} (Status: TERKONFIRMASI)`,
    });

    return NextResponse.json({ success: true, transaction: verified });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
