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

    const trx = await db.transactions.findById(id);
    if (!trx) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
    }

    if (user.role === "ANGGOTA" && user.memberId !== trx.memberId) {
      return NextResponse.json(
        { error: "Akses ditolak: Anda tidak memiliki izin melihat transaksi anggota lain." },
        { status: 403 }
      );
    }

    return NextResponse.json(trx);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(["SUPER_ADMIN", "ADMIN"]);
    const { id } = await params;
    const body = await req.json();

    const trx = await db.transactions.findById(id);
    if (!trx) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
    }

    if (Number(trx.paidAmount) > 0) {
      return NextResponse.json(
        { error: "Transaksi yang sudah memiliki pembayaran tidak dapat diubah." },
        { status: 400 }
      );
    }

    const updated = await db.transactions.update(id, body);

    await db.auditLogs.create({
      userId: user.id,
      userName: user.name,
      action: "UPDATE",
      entity: "WeighingTransaction",
      entityId: id,
      details: `Memperbarui transaksi timbang ${trx.transactionNo}`,
    });

    return NextResponse.json({ success: true, transaction: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
