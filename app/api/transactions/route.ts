import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { calculateTransaction } from "@/lib/calculations";
import { generateReferenceNumber, formatShortDate, formatRupiah, formatKg } from "@/lib/utils";
import { z } from "zod";
import { getZodErrorMessage } from "@/lib/validation";

const createTransactionSchema = z.object({
  memberId: z.string().min(1, "Anggota petani wajib dipilih"),
  farmId: z.string().min(1, "Kebun wajib dipilih"),
  ticketNo: z.string().optional().nullable(),
  date: z.string().optional(),
  grossWeight: z.number().positive("Berat bruto harus lebih besar dari 0 kg"),
  tareWeight: z.number().min(0, "Berat tara tidak boleh negatif"),
  deductionPercentage: z.number().min(0).max(100).default(0),
  deductionWeightKg: z.number().min(0).default(0),
  pricePerKg: z.number().positive("Harga per kg harus lebih besar dari 0").optional(),
  qualityCategory: z.string().default("Standar"),
  notes: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "MENUNGGU_VERIFIKASI"]).default("MENUNGGU_VERIFIKASI"),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);

    let memberId = searchParams.get("memberId") || undefined;
    const farmId = searchParams.get("farmId") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const isExport = searchParams.get("export") === "csv";

    // If ANGGOTA, restrict to own transactions only
    if (user.role === "ANGGOTA") {
      memberId = user.memberId || "none";
    }

    if (isExport) {
      const all = await db.transactions.findMany({
        memberId,
        farmId,
        status,
        search,
        startDate,
        endDate,
        page: 1,
        limit: 10000,
      });

      let csv = "No Transaksi,No Tiket,Tanggal,Petani,Kebun,Bruto (kg),Tara (kg),Pot (%) ,Pot Tambahan (kg),Netto (kg),Harga/kg (Rp),Nilai Kotor (Rp),Sudah Dibayar (Rp),Sisa Hak (Rp),Status,Catatan\n";
      all.items.forEach((t) => {
        csv += `"${t.transactionNo}","${t.ticketNo || "-"}","${formatShortDate(t.date)}","${t.member?.fullName || "-"}","${t.farm?.name || "-"}","${t.grossWeight}","${t.tareWeight}","${t.deductionPercentage}%","${t.deductionWeightKg}","${t.netWeight}","${t.pricePerKg}","${t.grossAmount}","${t.paidAmount}","${t.remainingAmount}","${t.status}","${(t.notes || "").replace(/"/g, '""')}"\n`;
      });

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="transaksi-timbang-sawitkita-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    const data = await db.transactions.findMany({
      memberId,
      farmId,
      status,
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

    const result = createTransactionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: getZodErrorMessage(result.error) }, { status: 400 });
    }

    const data = result.data;

    // Verify member and farm
    const member = await db.members.findById(data.memberId);
    if (!member) {
      return NextResponse.json({ error: "Anggota tidak ditemukan" }, { status: 400 });
    }

    const farm = await db.farms.findById(data.farmId);
    if (!farm) {
      return NextResponse.json({ error: "Kebun tidak ditemukan" }, { status: 400 });
    }

    // Determine price per kg: use active TBS price if not specified
    let pricePerKg = data.pricePerKg;
    if (!pricePerKg) {
      const activePrice = await db.prices.findCurrentActive();
      if (!activePrice) {
        return NextResponse.json(
          { error: "Belum ada harga TBS aktif yang tercatat di sistem. Harap atur harga terlebih dahulu." },
          { status: 400 }
        );
      }
      pricePerKg = Number(activePrice.pricePerKg);
    }

    // Perform authoritative server calculation
    const calc = calculateTransaction({
      grossWeight: data.grossWeight,
      tareWeight: data.tareWeight,
      deductionPercentage: data.deductionPercentage,
      deductionWeightKg: data.deductionWeightKg,
      pricePerKg,
    });

    if (!calc.isValid) {
      return NextResponse.json({ error: calc.errors.join(". ") }, { status: 400 });
    }

    const transactionNo = generateReferenceNumber("TR");
    const ticketNo = data.ticketNo || generateReferenceNumber("TKT");

    const newTransaction = await db.transactions.create({
      transactionNo,
      ticketNo,
      date: data.date ? new Date(data.date) : new Date(),
      memberId: data.memberId,
      farmId: data.farmId,
      grossWeight: data.grossWeight,
      tareWeight: data.tareWeight,
      deductionPercentage: data.deductionPercentage,
      deductionWeightKg: data.deductionWeightKg,
      netWeight: calc.netWeight,
      pricePerKg,
      grossAmount: calc.grossAmount,
      paidAmount: 0,
      remainingAmount: calc.grossAmount,
      qualityCategory: data.qualityCategory,
      notes: data.notes || null,
      recordedById: user.id,
      verifiedById: null,
      verifiedAt: null,
      status: data.status,
    });

    await db.auditLogs.create({
      userId: user.id,
      userName: user.name,
      action: "CREATE",
      entity: "WeighingTransaction",
      entityId: newTransaction.id,
      details: `Mencatat timbang ${transactionNo} untuk ${member.fullName} - Netto ${formatKg(calc.netWeight)}, Nilai ${formatRupiah(calc.grossAmount)}`,
    });

    return NextResponse.json({ success: true, transaction: newTransaction }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
