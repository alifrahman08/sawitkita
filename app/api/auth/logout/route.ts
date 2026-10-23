import { NextResponse } from "next/server";
import { clearSessionCookie, getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (user) {
      await db.auditLogs.create({
        userId: user.id,
        userName: user.name,
        action: "LOGOUT",
        entity: "User",
        entityId: user.id,
        details: `Pengguna ${user.name} keluar dari sistem`,
      });
    }

    await clearSessionCookie();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Gagal memproses keluar" }, { status: 500 });
  }
}
