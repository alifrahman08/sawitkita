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
    const body = await req.json();

    const reason = body.reason || "Dibatalkan oleh pengurus";

    const cancelled = await db.transactions.cancel(id, reason);

    await db.auditLogs.create({
      userId: user.id,
      userName: user.name,
      action: "CANCEL",
      entity: "WeighingTransaction",
      entityId: id,
      details: `Membatalkan transaksi timbang ${cancelled.transactionNo}. Alasan: ${reason}`,
    });

    return NextResponse.json({ success: true, transaction: cancelled });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
