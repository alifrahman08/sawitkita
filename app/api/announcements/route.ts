import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";
import { getZodErrorMessage } from "@/lib/validation";

const createAnnouncementSchema = z.object({
  title: z.string().min(3, "Judul pengumuman minimal 3 karakter"),
  content: z.string().min(5, "Isi pengumuman minimal 5 karakter"),
  targetRole: z.enum(["SEMUA", "PENGURUS", "ANGGOTA"]).default("SEMUA"),
  isPublished: z.boolean().default(true),
});

export async function GET() {
  try {
    const user = await requireAuth();
    const role = user.role === "ANGGOTA" ? "ANGGOTA" : "PENGURUS";
    const announcements = await db.announcements.findMany({
      role: user.role === "SUPER_ADMIN" ? "ALL" : role,
      publishedOnly: user.role === "ANGGOTA",
    });
    return NextResponse.json({ items: announcements });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(["SUPER_ADMIN", "ADMIN"]);
    const body = await req.json();

    const result = createAnnouncementSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: getZodErrorMessage(result.error) }, { status: 400 });
    }

    const data = result.data;

    const newAnnouncement = await db.announcements.create({
      title: data.title,
      content: data.content,
      targetRole: data.targetRole,
      isPublished: data.isPublished,
      publishedAt: new Date(),
      expiresAt: null,
      authorId: user.id,
    });

    await db.auditLogs.create({
      userId: user.id,
      userName: user.name,
      action: "CREATE",
      entity: "Announcement",
      entityId: newAnnouncement.id,
      details: `Membuat pengumuman baru: "${newAnnouncement.title}"`,
    });

    return NextResponse.json({ success: true, announcement: newAnnouncement }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
