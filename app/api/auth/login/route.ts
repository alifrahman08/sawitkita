import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, setSessionCookie } from "@/lib/auth";
import { getZodErrorMessage } from "@/lib/validation";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: getZodErrorMessage(result.error) },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const user = await db.users.findByEmail(email);

    if (!user) {
      return NextResponse.json(
        { error: "Email atau kata sandi yang Anda masukkan salah." },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Akun Anda saat ini dinonaktifkan. Hubungi pengurus koperasi." },
        { status: 403 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Email atau kata sandi yang Anda masukkan salah." },
        { status: 401 }
      );
    }

    // Find member record if role is ANGGOTA
    let memberId: string | null = null;
    if (user.role === "ANGGOTA") {
      const member = await db.members.findByUserId(user.id);
      memberId = member ? member.id : null;
    }

    const authUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      memberId,
      phone: user.phone,
    };

    // Set cookie
    await setSessionCookie(authUser);

    // Audit log
    await db.auditLogs.create({
      userId: user.id,
      userName: user.name,
      action: "LOGIN",
      entity: "User",
      entityId: user.id,
      details: `Pengguna ${user.name} (${user.role}) berhasil masuk ke sistem`,
    });

    const redirectUrl =
      user.role === "ANGGOTA" ? "/anggota/dashboard" : "/admin/dashboard";

    return NextResponse.json({
      success: true,
      user: authUser,
      redirectUrl,
    });
  } catch (err: any) {
    console.error("Login route error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal pada server." },
      { status: 500 }
    );
  }
}
