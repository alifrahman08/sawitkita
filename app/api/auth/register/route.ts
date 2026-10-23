import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { getZodErrorMessage } from "@/lib/validation";
import { z } from "zod";

const registerSchema = z.object({
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().min(8, "Nomor telepon minimal 8 digit"),
  nik: z.string().min(16, "NIK harus 16 digit").max(16, "NIK harus 16 digit"),
  address: z.string().min(5, "Alamat wajib diisi"),
  password: z.string().min(6, "Kata sandi minimal 6 karakter"),
  bankName: z.string().optional().nullable(),
  bankAccount: z.string().optional().nullable(),
  bankHolder: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: getZodErrorMessage(result.error) }, { status: 400 });
    }

    const data = result.data;

    // Check if email already registered
    const existingUser = await db.users.findByEmail(data.email);
    if (existingUser) {
      return NextResponse.json(
        { error: "Alamat email ini sudah terdaftar. Silakan masuk atau gunakan email lain." },
        { status: 400 }
      );
    }

    // Auto-generate Member ID: ANG-XXX
    const allMembers = await db.members.findMany({ limit: 1000 });
    const count = allMembers.total + 1;
    const memberNo = `ANG-${String(count).padStart(3, "0")}`;

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create User record
    const userId = `usr-${Date.now()}`;
    const newUser = {
      id: userId,
      email: data.email,
      name: data.fullName,
      phone: data.phone,
      passwordHash,
      role: "ANGGOTA" as const,
      isActive: true,
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.users.create(newUser);

    // Create Member record linked to User
    const newMember = await db.members.create({
      memberNo,
      fullName: data.fullName,
      nik: data.nik,
      phone: data.phone,
      address: data.address,
      joinDate: new Date(),
      status: "AKTIF",
      bankName: data.bankName || null,
      bankAccount: data.bankAccount || null,
      bankHolder: data.bankHolder || data.fullName,
      userId: newUser.id,
    });

    const authUser = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      memberId: newMember.id,
      phone: newUser.phone,
    };

    // Auto-login session cookie
    await setSessionCookie(authUser);

    // Audit log
    await db.auditLogs.create({
      userId: newUser.id,
      userName: newUser.name,
      action: "REGISTER",
      entity: "Member",
      entityId: newMember.id,
      details: `Pendaftaran anggota petani mandiri baru: ${newMember.fullName} (${newMember.memberNo})`,
    });

    return NextResponse.json(
      {
        success: true,
        user: authUser,
        member: newMember,
        redirectUrl: "/anggota/dashboard",
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal mendaftar" }, { status: 500 });
  }
}
