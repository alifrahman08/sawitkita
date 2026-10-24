import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 Starting Supabase database seeding from prisma/local-dev-db.json...");
  
  const raw = fs.readFileSync(path.join(process.cwd(), "prisma", "local-dev-db.json"), "utf-8");
  const data = JSON.parse(raw);

  // 1. Users
  console.log(`- Seeding ${data.users.length} Users...`);
  for (const u of data.users) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {},
      create: {
        id: u.id,
        email: u.email,
        name: u.name,
        phone: u.phone,
        passwordHash: u.passwordHash,
        role: u.role,
        isActive: u.isActive,
        createdAt: new Date(u.createdAt),
        updatedAt: new Date(u.updatedAt),
      },
    });
  }

  // 2. Members
  console.log(`- Seeding ${data.members.length} Members...`);
  for (const m of data.members) {
    await prisma.member.upsert({
      where: { id: m.id },
      update: {},
      create: {
        id: m.id,
        memberNo: m.memberNo,
        fullName: m.fullName,
        nik: m.nik,
        phone: m.phone,
        address: m.address,
        joinDate: new Date(m.joinDate),
        status: m.status,
        bankName: m.bankName,
        bankAccount: m.bankAccount,
        bankHolder: m.bankHolder,
        userId: m.userId,
        createdAt: new Date(m.createdAt),
        updatedAt: new Date(m.updatedAt),
      },
    });
  }

  // 3. Farms
  console.log(`- Seeding ${data.farms.length} Farms...`);
  for (const f of data.farms) {
    await prisma.farm.upsert({
      where: { id: f.id },
      update: {},
      create: {
        id: f.id,
        code: f.code,
        name: f.name,
        memberId: f.memberId,
        areaHectares: f.areaHectares,
        village: f.village,
        district: f.district,
        regency: f.regency,
        plantingYear: f.plantingYear,
        status: f.status,
        notes: f.notes,
        createdAt: new Date(f.createdAt),
        updatedAt: new Date(f.updatedAt),
      },
    });
  }

  // 4. Prices
  console.log(`- Seeding ${data.prices.length} TBS Prices...`);
  for (const p of data.prices) {
    await prisma.tbsPrice.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        pricePerKg: p.pricePerKg,
        effectiveFrom: new Date(p.effectiveFrom),
        effectiveTo: p.effectiveTo ? new Date(p.effectiveTo) : null,
        status: p.status,
        sourceNotes: p.sourceNotes,
        category: p.category || "Standar",
        createdById: p.createdById,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      },
    });
  }

  // 5. Transactions
  console.log(`- Seeding ${data.transactions.length} Transactions...`);
  for (const t of data.transactions) {
    await prisma.weighingTransaction.upsert({
      where: { id: t.id },
      update: {},
      create: {
        id: t.id,
        transactionNo: t.transactionNo,
        ticketNo: t.ticketNo,
        date: new Date(t.date),
        memberId: t.memberId,
        farmId: t.farmId,
        grossWeight: t.grossWeight,
        tareWeight: t.tareWeight,
        deductionPercentage: t.deductionPercentage,
        deductionWeightKg: t.deductionWeightKg,
        netWeight: t.netWeight,
        pricePerKg: t.pricePerKg,
        grossAmount: t.grossAmount,
        paidAmount: t.paidAmount,
        remainingAmount: t.remainingAmount,
        qualityCategory: t.qualityCategory || "Standar",
        notes: t.notes,
        recordedById: t.recordedById,
        verifiedById: t.verifiedById,
        verifiedAt: t.verifiedAt ? new Date(t.verifiedAt) : null,
        cancellationReason: t.cancellationReason,
        status: t.status,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
      },
    });
  }

  // 6. Payments and Allocations
  console.log(`- Seeding ${data.payments.length} Payments & Allocations...`);
  for (const py of data.payments) {
    await prisma.payment.upsert({
      where: { id: py.id },
      update: {},
      create: {
        id: py.id,
        paymentNo: py.paymentNo,
        memberId: py.memberId,
        paymentDate: new Date(py.paymentDate),
        totalAmount: py.totalAmount,
        paymentMethod: py.paymentMethod,
        bankReference: py.bankReference,
        proofUrl: py.proofUrl,
        status: py.status,
        notes: py.notes,
        createdById: py.createdById,
        verifiedById: py.verifiedById,
        verifiedAt: py.verifiedAt ? new Date(py.verifiedAt) : null,
        createdAt: new Date(py.createdAt),
        updatedAt: new Date(py.updatedAt),
      },
    });

    if (py.allocations && Array.isArray(py.allocations)) {
      for (const alc of py.allocations) {
        await prisma.paymentAllocation.upsert({
          where: { id: alc.id },
          update: {},
          create: {
            id: alc.id,
            paymentId: alc.paymentId,
            transactionId: alc.transactionId,
            allocatedAmount: alc.allocatedAmount,
            createdAt: new Date(alc.createdAt),
          },
        });
      }
    }
  }

  // 7. Savings Accounts
  console.log(`- Seeding ${data.savingsAccounts.length} Savings Accounts...`);
  for (const s of data.savingsAccounts) {
    await prisma.savingsAccount.upsert({
      where: { id: s.id },
      update: {},
      create: {
        id: s.id,
        memberId: s.memberId,
        principalBalance: s.principalBalance,
        mandatoryBalance: s.mandatoryBalance,
        voluntaryBalance: s.voluntaryBalance,
        totalBalance: s.totalBalance,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
      },
    });
  }

  // 8. Savings Mutations
  console.log(`- Seeding ${data.savingsMutations.length} Savings Mutations...`);
  for (const sm of data.savingsMutations) {
    await prisma.savingsMutation.upsert({
      where: { id: sm.id },
      update: {},
      create: {
        id: sm.id,
        mutationNo: sm.mutationNo,
        savingsAccountId: sm.savingsAccountId,
        memberId: sm.memberId,
        mutationDate: new Date(sm.mutationDate),
        type: sm.type,
        category: sm.category,
        amount: sm.amount,
        balanceAfter: sm.balanceAfter,
        referenceNo: sm.referenceNo,
        notes: sm.notes,
        createdById: sm.createdById,
        createdAt: new Date(sm.createdAt),
      },
    });
  }

  // 9. Announcements
  console.log(`- Seeding ${data.announcements.length} Announcements...`);
  for (const a of data.announcements) {
    await prisma.announcement.upsert({
      where: { id: a.id },
      update: {},
      create: {
        id: a.id,
        title: a.title,
        content: a.content,
        targetRole: a.targetRole,
        isPublished: a.isPublished,
        publishedAt: new Date(a.publishedAt),
        expiresAt: a.expiresAt ? new Date(a.expiresAt) : null,
        authorId: a.authorId,
        createdAt: new Date(a.createdAt),
        updatedAt: new Date(a.updatedAt),
      },
    });
  }

  // 10. Settings
  console.log(`- Seeding ${data.settings.length} Settings...`);
  for (const st of data.settings) {
    await prisma.cooperativeSetting.upsert({
      where: { id: st.id },
      update: {},
      create: {
        id: st.id,
        key: st.key,
        value: st.value,
        description: st.description,
        updatedAt: new Date(st.updatedAt),
      },
    });
  }

  // 11. Expenses
  console.log(`- Seeding ${data.expenses.length} Expenses...`);
  for (const exp of data.expenses) {
    await prisma.expense.upsert({
      where: { id: exp.id },
      update: {},
      create: {
        id: exp.id,
        expenseNo: exp.expenseNo,
        date: new Date(exp.date),
        category: exp.category,
        amount: exp.amount,
        description: exp.description,
        proofUrl: exp.proofUrl,
        createdById: exp.createdById,
        createdAt: new Date(exp.createdAt),
        updatedAt: new Date(exp.updatedAt),
      },
    });
  }

  // 12. Audit Logs
  console.log(`- Seeding ${data.auditLogs.length} Audit Logs...`);
  for (const log of data.auditLogs) {
    await prisma.auditLog.upsert({
      where: { id: log.id },
      update: {},
      create: {
        id: log.id,
        userId: log.userId,
        userName: log.userName,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        details: log.details,
        ipAddress: log.ipAddress,
        createdAt: new Date(log.createdAt),
      },
    });
  }

  console.log("✅ Supabase seeding completed successfully!");
}

seed()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
