import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";
import { getZodErrorMessage } from "@/lib/validation";

const createPriceSchema = z.object({
  pricePerKg: z.number().positive("Harga per kg harus lebih besar dari 0 Rupiah"),
  effectiveFrom: z.string().min(1, "Tanggal berlaku wajib diisi"),
  sourceNotes: z.string().optional().nullable(),
  category: z.string().default("Standar"),
  status: z.enum(["AKTIF", "TERJADWAL"]).default("AKTIF"),
});

export async function GET() {
  try {
    await requireAuth();
    const prices = await db.prices.findMany();
    const currentActive = await db.prices.findCurrentActive();
    return NextResponse.json({ prices, currentActive });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(["SUPER_ADMIN", "ADMIN"]);
    const body = await req.json();

    const result = createPriceSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: getZodErrorMessage(result.error) }, { status: 400 });
    }

    const data = result.data;

    const newPrice = await db.prices.create({
      pricePerKg: data.pricePerKg,
      effectiveFrom: new Date(data.effectiveFrom),
      effectiveTo: null,
      status: data.status,
      sourceNotes: data.sourceNotes || null,
      category: data.category,
      createdById: user.id,
    });

    await db.auditLogs.create({
      userId: user.id,
      userName: user.name,
      action: "UPDATE",
      entity: "TbsPrice",
      entityId: newPrice.id,
      details: `Menetapkan harga TBS baru: Rp ${data.pricePerKg.toLocaleString("id-ID")}/kg efektif ${data.effectiveFrom} (${data.sourceNotes || "-"})`,
    });

    return NextResponse.json({ success: true, price: newPrice }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
