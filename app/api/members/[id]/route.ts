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

    // Anggota role can only view their own record
    if (user.role === "ANGGOTA" && user.memberId !== id) {
      return NextResponse.json(
        { error: "Akses ditolak: Anda tidak memiliki izin melihat data anggota lain." },
        { status: 403 }
      );
    }

    const member = await db.members.findById(id);
    if (!member) {
      return NextResponse.json({ error: "Anggota tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(member);
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

    const updated = await db.members.update(id, body);

    await db.auditLogs.create({
      userId: user.id,
      userName: user.name,
      action: "UPDATE",
      entity: "Member",
      entityId: id,
      details: `Memperbarui data anggota ${updated.fullName} (${updated.memberNo})`,
    });

    return NextResponse.json({ success: true, member: updated });
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

    const member = await db.members.findById(id);
    if (!member) {
      return NextResponse.json({ error: "Anggota tidak ditemukan" }, { status: 404 });
    }

    await db.members.softDelete(id);

    await db.auditLogs.create({
      userId: user.id,
      userName: user.name,
      action: "DELETE",
      entity: "Member",
      entityId: id,
      details: `Menonaktifkan data anggota ${member.fullName} (${member.memberNo})`,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
