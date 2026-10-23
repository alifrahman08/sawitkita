import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { MemberLayoutClient } from "@/components/anggota/member-layout-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "SawitKita — Portal Mandiri Petani",
  description: "Pantau Hasil Timbang, Pembayaran TBS, dan Simpanan Koperasi",
};

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // If user is Admin or Super Admin, allow access or redirect
  return <MemberLayoutClient initialUser={user}>{children}</MemberLayoutClient>;
}
