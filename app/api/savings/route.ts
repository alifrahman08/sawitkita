import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { formatRupiah, formatShortDate } from "@/lib/utils";
import { z } from "zod";
import { getZodErrorMessage } from "@/lib/validation";

const recordMutationSchema = z.object({
  memberId: z.string().min(1, "Anggota wajib dipilih"),
  type: z.enum(["SETORAN", "PENARIKAN", "KOREKSI"]),
  category: z.enum(["POKOK", "WAJIB", "SUKARELA"]),
  amount: z.number().positive("Nominal mutasi harus lebih besar dari 0 Rupiah"),
  notes: z.string().optional().nullable(),
  referenceNo: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);

    let memberId = searchParams.get("memberId") || undefined;
    const type = searchParams.get("type") || undefined;
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const view = searchParams.get("view") || "mutations"; // "mutations" or "accounts"
    const isExport = searchParams.get("export") === "csv";

    // If ANGGOTA, restrict to own account
    if (user.role === "ANGGOTA") {
      memberId = user.memberId || "none";
    }

    if (view === "account" && memberId) {
      const account = await db.savings.getAccountByMemberId(memberId);
      return NextResponse.json(account);
    }

    if (view === "accounts") {
      const accounts = await db.savings.getAllAccounts();
      return NextResponse.json({ accounts });
    }

    if (isExport) {
      const mutations = await db.savings.getMutations({ memberId, type, category, search });
      let csv = "No Mutasi,Tanggal,Anggota,Jenis,Kategori,Nominal (Rp),Saldo Setelah (Rp),No Referensi,Keterangan\n";
      mutations.forEach((m) => {
        csv += `"${m.mutationNo}","${formatShortDate(m.mutationDate)}","${m.member?.fullName || "-"}","${m.type}","${m.category}","${m.amount}","${m.balanceAfter}","${m.referenceNo || "-"}","${(m.notes || "").replace(/"/g, '""')}"\n`;
      });

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="mutasi-simpanan-sawitkita-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    const mutations = await db.savings.getMutations({ memberId, type, category, search });
    const accounts = await db.savings.getAllAccounts();

    return NextResponse.json({ mutations, accounts });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(["SUPER_ADMIN", "ADMIN"]);
    const body = await req.json();

    const result = recordMutationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: getZodErrorMessage(result.error) }, { status: 400 });
    }

    const data = result.data;
    const member = await db.members.findById(data.memberId);
    if (!member) {
      return NextResponse.json({ error: "Data anggota tidak ditemukan." }, { status: 400 });
    }

    const res = await db.savings.recordMutation({
      memberId: data.memberId,
      type: data.type,
      category: data.category,
      amount: data.amount,
      notes: data.notes || undefined,
      referenceNo: data.referenceNo || undefined,
      createdById: user.id,
    });

    await db.auditLogs.create({
      userId: user.id,
      userName: user.name,
      action: data.type,
      entity: "SavingsMutation",
      entityId: res.mutation.id,
      details: `${data.type} Simpanan ${data.category} sebesar ${formatRupiah(data.amount)} untuk ${member.fullName} (${res.mutation.mutationNo})`,
    });

    return NextResponse.json({ success: true, ...res }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
