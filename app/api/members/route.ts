import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { getZodErrorMessage } from "@/lib/validation";
import { z } from "zod";

const createMemberSchema = z.object({
  memberNo: z.string().min(2, "Nomor Anggota wajib diisi"),
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  nik: z.string().optional().nullable(),
  phone: z.string().min(8, "Nomor telepon minimal 8 digit"),
  address: z.string().min(5, "Alamat wajib diisi"),
  bankName: z.string().optional().nullable(),
  bankAccount: z.string().optional().nullable(),
  bankHolder: z.string().optional().nullable(),
  status: z.enum(["AKTIF", "NONAKTIF", "PENDING"]).default("AKTIF"),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const isExport = searchParams.get("export") === "csv";

    // If member is calling, only return their own record if not admin
    if (user.role === "ANGGOTA") {
      if (!user.memberId) {
        return NextResponse.json({ error: "Akun Anda belum terhubung ke data anggota" }, { status: 404 });
      }
      const member = await db.members.findById(user.memberId);
      return NextResponse.json({ items: member ? [member] : [], total: member ? 1 : 0 });
    }

    if (isExport) {
      const allMembers = await db.members.findMany({ search, status, page: 1, limit: 10000 });
      let csv = "No Anggota,Nama Lengkap,NIK,No Telepon,Alamat,Status,Bank,No Rekening,Pemilik Rekening,Jumlah Kebun,Total Netto TBS (kg),Total Nilai (Rp)\n";
      allMembers.items.forEach((m) => {
        csv += `"${m.memberNo}","${m.fullName}","${m.nik || "-"}","${m.phone}","${m.address.replace(/"/g, '""')}","${m.status}","${m.bankName || "-"}","${m.bankAccount || "-"}","${m.bankHolder || "-"}","${m.farmCount}","${m.totalNetWeight}","${m.totalGrossAmount}"\n`;
      });

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="data-anggota-sawitkita-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    const data = await db.members.findMany({ search, status, page, limit });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal mengambil data anggota" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(["SUPER_ADMIN", "ADMIN"]);
    const body = await req.json();

    const result = createMemberSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: getZodErrorMessage(result.error) }, { status: 400 });
    }

    const data = result.data;

    // Check duplicate memberNo
    const existingNo = await db.members.findByMemberNo(data.memberNo);
    if (existingNo) {
      return NextResponse.json({ error: `Nomor Anggota '${data.memberNo}' sudah terdaftar.` }, { status: 400 });
    }

    const newMember = await db.members.create({
      memberNo: data.memberNo,
      fullName: data.fullName,
      nik: data.nik || null,
      phone: data.phone,
      address: data.address,
      joinDate: new Date(),
      status: data.status,
      bankName: data.bankName || null,
      bankAccount: data.bankAccount || null,
      bankHolder: data.bankHolder || null,
      userId: null,
    });

    await db.auditLogs.create({
      userId: user.id,
      userName: user.name,
      action: "CREATE",
      entity: "Member",
      entityId: newMember.id,
      details: `Menambahkan anggota baru ${newMember.fullName} (${newMember.memberNo})`,
    });

    return NextResponse.json({ success: true, member: newMember }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal menambahkan anggota" }, { status: 500 });
  }
}
