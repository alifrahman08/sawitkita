import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { formatRupiah, formatShortDate } from "@/lib/utils";
import { z } from "zod";
import { getZodErrorMessage } from "@/lib/validation";

const createPaymentSchema = z.object({
  memberId: z.string().min(1, "Anggota penerima pembayaran wajib dipilih"),
  paymentMethod: z.enum(["TRANSFER", "TUNAI"]).default("TRANSFER"),
  bankReference: z.string().optional().nullable(),
  proofUrl: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  allocations: z
    .array(
      z.object({
        transactionId: z.string().min(1),
        allocatedAmount: z.number().positive("Jumlah alokasi harus lebih dari 0"),
      })
    )
    .min(1, "Minimal harus memilih satu transaksi untuk dibayarkan"),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);

    let memberId = searchParams.get("memberId") || undefined;
    const status = searchParams.get("status") || undefined;
    const method = searchParams.get("method") || undefined;
    const search = searchParams.get("search") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const isExport = searchParams.get("export") === "csv";

    // If ANGGOTA, restrict to own payments
    if (user.role === "ANGGOTA") {
      memberId = user.memberId || "none";
    }

    if (isExport) {
      const all = await db.payments.findMany({
        memberId,
        status,
        method,
        search,
        startDate,
        endDate,
        page: 1,
        limit: 10000,
      });

      let csv = "No Pembayaran,Tanggal,Anggota,Metode,No Referensi,Total Bayar (Rp),Status,Catatan\n";
      all.items.forEach((p) => {
        csv += `"${p.paymentNo}","${formatShortDate(p.paymentDate)}","${p.member?.fullName || "-"}","${p.paymentMethod}","${p.bankReference || "-"}","${p.totalAmount}","${p.status}","${(p.notes || "").replace(/"/g, '""')}"\n`;
      });

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="pembayaran-petani-sawitkita-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    const data = await db.payments.findMany({
      memberId,
      status,
      method,
      search,
      startDate,
      endDate,
      page,
      limit,
    });

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(["SUPER_ADMIN", "ADMIN"]);
    const body = await req.json();

    const result = createPaymentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: getZodErrorMessage(result.error) }, { status: 400 });
    }

    const data = result.data;

    // Verify member
    const member = await db.members.findById(data.memberId);
    if (!member) {
      return NextResponse.json({ error: "Data anggota tidak ditemukan." }, { status: 400 });
    }

    // Validate allocations against transactions
    let totalAllocated = 0;
    for (const alloc of data.allocations) {
      const trx = await db.transactions.findById(alloc.transactionId);
      if (!trx) {
        return NextResponse.json({ error: `Transaksi ID ${alloc.transactionId} tidak ditemukan.` }, { status: 400 });
      }

      if (trx.memberId !== data.memberId) {
        return NextResponse.json(
          { error: `Transaksi ${trx.transactionNo} bukan milik anggota yang dipilih.` },
          { status: 400 }
        );
      }

      if (trx.status === "DIBATALKAN" || trx.status === "DRAFT" || trx.status === "MENUNGGU_VERIFIKASI") {
        return NextResponse.json(
          { error: `Transaksi ${trx.transactionNo} berstatus ${trx.status} dan belum dapat dibayar.` },
          { status: 400 }
        );
      }

      const remaining = Number(trx.remainingAmount);
      if (alloc.allocatedAmount > remaining) {
        return NextResponse.json(
          {
            error: `Alokasi pembayaran Rp ${alloc.allocatedAmount.toLocaleString("id-ID")} untuk ${trx.transactionNo} melebihi sisa kewajiban (${formatRupiah(remaining)}).`,
          },
          { status: 400 }
        );
      }

      totalAllocated += alloc.allocatedAmount;
    }

    // Execute payment creation & allocation
    const payment = await db.payments.create({
      memberId: data.memberId,
      totalAmount: totalAllocated,
      paymentMethod: data.paymentMethod,
      bankReference: data.bankReference || undefined,
      proofUrl: data.proofUrl || undefined,
      notes: data.notes || undefined,
      createdById: user.id,
      allocations: data.allocations,
    });

    await db.auditLogs.create({
      userId: user.id,
      userName: user.name,
      action: "CREATE",
      entity: "Payment",
      entityId: payment.id,
      details: `Pencatatan pembayaran ${payment.paymentNo} sebesar ${formatRupiah(totalAllocated)} untuk ${member.fullName} (${data.paymentMethod})`,
    });

    return NextResponse.json({ success: true, payment }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
