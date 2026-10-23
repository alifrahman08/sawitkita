import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(["SUPER_ADMIN", "ADMIN"]);
    const { searchParams } = new URL(req.url);

    const type = searchParams.get("type") || "summary";
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const allTrx = await db.transactions.findMany({
      startDate,
      endDate,
      limit: 10000,
    });
    const validTrx = allTrx.items.filter((t) => t.status !== "DIBATALKAN");

    const allPayments = await db.payments.findMany({
      startDate,
      endDate,
      limit: 10000,
    });

    const allSavings = await db.savings.getAllAccounts();
    const allExpenses = await db.expenses.findMany();
    const prices = await db.prices.findMany();

    // 1. TBS Production & Purchase Summary
    const totalNetWeight = validTrx.reduce((acc, t) => acc + Number(t.netWeight), 0);
    const totalGrossAmount = validTrx.reduce((acc, t) => acc + Number(t.grossAmount), 0);
    const totalPaidToFarmers = validTrx.reduce((acc, t) => acc + Number(t.paidAmount), 0);
    const totalPendingPay = validTrx.reduce((acc, t) => acc + Number(t.remainingAmount), 0);

    // 2. Farm Production Aggregates
    const farmMap: Record<string, { code: string; name: string; member: string; netWeight: number; amount: number; count: number }> = {};
    validTrx.forEach((t) => {
      const fId = t.farmId;
      if (!farmMap[fId]) {
        farmMap[fId] = {
          code: t.farm?.code || "-",
          name: t.farm?.name || "-",
          member: t.member?.fullName || "-",
          netWeight: 0,
          amount: 0,
          count: 0,
        };
      }
      farmMap[fId].netWeight += Number(t.netWeight);
      farmMap[fId].amount += Number(t.grossAmount);
      farmMap[fId].count += 1;
    });

    // 3. Member Production Aggregates
    const memberMap: Record<string, { memberNo: string; name: string; netWeight: number; amount: number; paid: number; remaining: number }> = {};
    validTrx.forEach((t) => {
      const mId = t.memberId;
      if (!memberMap[mId]) {
        memberMap[mId] = {
          memberNo: t.member?.memberNo || "-",
          name: t.member?.fullName || "-",
          netWeight: 0,
          amount: 0,
          paid: 0,
          remaining: 0,
        };
      }
      memberMap[mId].netWeight += Number(t.netWeight);
      memberMap[mId].amount += Number(t.grossAmount);
      memberMap[mId].paid += Number(t.paidAmount);
      memberMap[mId].remaining += Number(t.remainingAmount);
    });

    // 4. Savings Totals
    const totalSavingsBalance = allSavings.reduce((acc, s) => acc + Number(s.totalBalance), 0);
    const totalPrincipal = allSavings.reduce((acc, s) => acc + Number(s.principalBalance), 0);
    const totalMandatory = allSavings.reduce((acc, s) => acc + Number(s.mandatoryBalance), 0);
    const totalVoluntary = allSavings.reduce((acc, s) => acc + Number(s.voluntaryBalance), 0);

    // 5. Total Expenses
    const totalExpenses = allExpenses.reduce((acc, e) => acc + Number(e.amount), 0);

    return NextResponse.json({
      summary: {
        totalTransactions: validTrx.length,
        totalNetWeight,
        totalGrossAmount,
        totalPaidToFarmers,
        totalPendingPay,
        totalSavingsBalance,
        totalPrincipal,
        totalMandatory,
        totalVoluntary,
        totalExpenses,
      },
      farmProduction: Object.values(farmMap),
      memberActivity: Object.values(memberMap),
      prices,
      expenses: allExpenses,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
