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

    const farm = await db.farms.findById(id);
    if (!farm) {
      return NextResponse.json({ error: "Kebun tidak ditemukan" }, { status: 404 });
    }

    if (user.role === "ANGGOTA" && user.memberId !== farm.memberId) {
      return NextResponse.json(
        { error: "Akses ditolak: Anda tidak memiliki izin melihat kebun milik anggota lain." },
        { status: 403 }
      );
    }

    return NextResponse.json(farm);
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

    const updated = await db.farms.update(id, body);

    await db.auditLogs.create({
      userId: user.id,
      userName: user.name,
      action: "UPDATE",
      entity: "Farm",
      entityId: id,
      details: `Memperbarui data kebun ${updated.name} (${updated.code})`,
    });

    return NextResponse.json({ success: true, farm: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(["SUPER_ADMIN", "ADMIN"]);
    const { id } = await params;

    const farm = await db.farms.findById(id);
    if (!farm) {
      return NextResponse.json({ error: "Kebun tidak ditemukan" }, { status: 404 });
    }

    await db.farms.softDelete(id);

    await db.auditLogs.create({
      userId: user.id,
      userName: user.name,
      action: "DELETE",
      entity: "Farm",
      entityId: id,
      details: `Menonaktifkan kebun ${farm.name} (${farm.code})`,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
