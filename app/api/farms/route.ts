import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { getZodErrorMessage } from "@/lib/validation";
import { z } from "zod";

const createFarmSchema = z.object({
  code: z.string().min(2, "Kode kebun wajib diisi"),
  name: z.string().min(2, "Nama kebun wajib diisi"),
  memberId: z.string().min(1, "Pemilik kebun wajib dipilih"),
  areaHectares: z.number().positive("Luas lahan harus lebih besar dari 0 Ha"),
  village: z.string().min(2, "Desa wajib diisi"),
  district: z.string().min(2, "Kecamatan wajib diisi"),
  regency: z.string().min(2, "Kabupaten wajib diisi"),
  plantingYear: z.number().int().min(1970).max(2035).optional().nullable(),
  status: z.enum(["PRODUKTIF", "PEREMAJAAN", "NONAKTIF"]).default("PRODUKTIF"),
  notes: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);

    let memberId = searchParams.get("memberId") || undefined;
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;

    // If logged in as ANGGOTA, restrict to own farms
    if (user.role === "ANGGOTA") {
      memberId = user.memberId || "none";
    }

    const farms = await db.farms.findMany({ memberId, search, status });
    return NextResponse.json({ items: farms, total: farms.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(["SUPER_ADMIN", "ADMIN"]);
    const body = await req.json();

    const result = createFarmSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: getZodErrorMessage(result.error) }, { status: 400 });
    }

    const data = result.data;

    // Check member exists
    const member = await db.members.findById(data.memberId);
    if (!member) {
      return NextResponse.json({ error: "Anggota pemilik kebun tidak valid." }, { status: 400 });
    }

    const newFarm = await db.farms.create({
      code: data.code,
      name: data.name,
      memberId: data.memberId,
      areaHectares: data.areaHectares,
      village: data.village,
      district: data.district,
      regency: data.regency,
      plantingYear: data.plantingYear || null,
      status: data.status,
      notes: data.notes || null,
    });

    await db.auditLogs.create({
      userId: user.id,
      userName: user.name,
      action: "CREATE",
      entity: "Farm",
      entityId: newFarm.id,
      details: `Menambahkan data kebun ${newFarm.name} (${newFarm.code}) untuk anggota ${member.fullName}`,
    });

    return NextResponse.json({ success: true, farm: newFarm }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
