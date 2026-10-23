import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth();

    if (user.role === "ANGGOTA") {
      if (!user.memberId) {
        return NextResponse.json({ error: "Akun belum terhubung ke data anggota" }, { status: 404 });
      }
      const memberStats = await db.stats.getMemberDashboardStats(user.memberId);
      const recentTrx = await db.transactions.findMany({
        memberId: user.memberId,
        limit: 5,
      });
      const recentPayments = await db.payments.findMany({
        memberId: user.memberId,
        limit: 5,
      });
      const announcements = await db.announcements.findMany({
        role: "ANGGOTA",
        publishedOnly: true,
      });

      return NextResponse.json({
        type: "MEMBER",
        stats: memberStats,
        recentTransactions: recentTrx.items,
        recentPayments: recentPayments.items,
        announcements: announcements.slice(0, 3),
      });
    }

    // Admin / Super Admin
    const adminStats = await db.stats.getAdminDashboardStats();
    const recentTrx = await db.transactions.findMany({ limit: 6 });
    const recentPayments = await db.payments.findMany({ limit: 5 });
    const currentPrice = await db.prices.findCurrentActive();
    const priceHistory = await db.prices.findMany();
    const auditLogs = await db.auditLogs.findMany(6);

    // Chart Data for harvest weights and values (by day or transaction)
    const chartData = recentTrx.items.slice(0, 10).reverse().map((t) => ({
      date: new Date(t.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
      netto: Number(t.netWeight),
      nilai: Number(t.grossAmount),
      petani: t.member?.fullName || "Petani",
    }));

    return NextResponse.json({
      type: "ADMIN",
      stats: adminStats,
      recentTransactions: recentTrx.items,
      recentPayments: recentPayments.items,
      currentPrice,
      priceHistory,
      auditLogs,
      chartData,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
