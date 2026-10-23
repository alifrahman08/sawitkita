import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminLayoutClient } from "@/components/admin/admin-layout-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "SawitKita — Panel Manajemen Koperasi",
  description: "Sistem Manajemen Koperasi Kelapa Sawit",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "ANGGOTA") {
    redirect("/anggota/dashboard");
  }

  return <AdminLayoutClient initialUser={user}>{children}</AdminLayoutClient>;
}
