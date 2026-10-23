import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const settings = await db.settings.getAll();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });
    return NextResponse.json({ settings, settingsMap });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(["SUPER_ADMIN"]);
    const body = await req.json();

    for (const [key, val] of Object.entries(body)) {
      if (typeof val === "string") {
        await db.settings.update(key, val);
      }
    }

    await db.auditLogs.create({
      userId: user.id,
      userName: user.name,
      action: "UPDATE",
      entity: "CooperativeSetting",
      details: `Memperbarui konfigurasi sistem koperasi`,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
