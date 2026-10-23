import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../lib/db";

describe("Database Repository Operations & Business Flows", () => {
  beforeEach(() => {
    db.resetToSeed();
  });

  it("dapat membaca data anggota awal dan mencari berdasarkan nama", async () => {
    const res = await db.members.findMany({ search: "Budi" });
    expect(res.total).toBeGreaterThanOrEqual(1);
    expect(res.items[0].fullName).toContain("Budi");
  });

  it("dapat menambahkan anggota baru dan otomatis membuat rekening simpanan", async () => {
    const newMember = await db.members.create({
      memberNo: "ANG-999",
      fullName: "Ahmad Dahlan",
      nik: "1401021234567899",
      phone: "081299998888",
      address: "Desa Rimbo Panjang, Kampar",
      joinDate: new Date(),
      status: "AKTIF",
      bankName: "BRI",
      bankAccount: "1122334455",
      bankHolder: "Ahmad Dahlan",
      userId: null,
    });

    expect(newMember.id).toBeDefined();
    const fetched = await db.members.findById(newMember.id);
    expect(fetched?.fullName).toBe("Ahmad Dahlan");
    expect(fetched?.savings).toBeDefined();
    expect(Number(fetched?.savings?.totalBalance)).toBe(0);
  });

  it("dapat mengambil harga TBS yang sedang aktif", async () => {
    const activePrice = await db.prices.findCurrentActive();
    expect(activePrice).toBeDefined();
    expect(activePrice?.status).toBe("AKTIF");
    expect(Number(activePrice?.pricePerKg)).toBe(2850);
  });

  it("mencatat transaksi timbang baru dan mengubah sisa hak pembayaran", async () => {
    const newTrx = await db.transactions.create({
      transactionNo: "TR-TEST-001",
      ticketNo: "TKT-TEST-01",
      date: new Date(),
      memberId: "mbr-001",
      farmId: "frm-001",
      grossWeight: 5000,
      tareWeight: 1000,
      deductionPercentage: 3,
      deductionWeightKg: 0,
      netWeight: 3880,
      pricePerKg: 2850,
      grossAmount: 11058000,
      paidAmount: 0,
      remainingAmount: 11058000,
      qualityCategory: "Standar",
      notes: "Pengujian transaksi",
      recordedById: "usr-pengurus-01",
      verifiedById: null,
      verifiedAt: null,
      status: "MENUNGGU_VERIFIKASI",
    });

    expect(newTrx.id).toBeDefined();
    expect(newTrx.status).toBe("MENUNGGU_VERIFIKASI");

    // Verifikasi transaksi
    const verified = await db.transactions.verify(newTrx.id, "usr-superadmin-01");
    expect(verified.status).toBe("TERKONFIRMASI");
    expect(verified.verifiedById).toBe("usr-superadmin-01");
  });

  it("memproses pembayaran dan mengupdate status transaksi", async () => {
    // Check initial remaining of trx-002
    const trx = await db.transactions.findById("trx-002");
    expect(trx).toBeDefined();
    const prevRemaining = Number(trx?.remainingAmount);
    expect(prevRemaining).toBe(6672500);

    // Make partial payment of Rp 3.000.000
    const payment = await db.payments.create({
      memberId: "mbr-002",
      totalAmount: 3000000,
      paymentMethod: "TRANSFER",
      bankReference: "REF-TEST-001",
      notes: "Pembayaran tahap 2",
      createdById: "usr-pengurus-01",
      allocations: [
        {
          transactionId: "trx-002",
          allocatedAmount: 3000000,
        },
      ],
    });

    expect(payment.id).toBeDefined();
    const updatedTrx = await db.transactions.findById("trx-002");
    expect(Number(updatedTrx?.paidAmount)).toBe(13000000);
    expect(Number(updatedTrx?.remainingAmount)).toBe(3672500);
    expect(updatedTrx?.status).toBe("DIBAYAR_SEBAGIAN");
  });

  it("mengelola setoran dan penarikan simpanan anggota dengan aman", async () => {
    const accBefore = await db.savings.getAccountByMemberId("mbr-001");
    const initSukarela = Number(accBefore.voluntaryBalance);

    // Setoran sukarela
    await db.savings.recordMutation({
      memberId: "mbr-001",
      type: "SETORAN",
      category: "SUKARELA",
      amount: 500000,
      notes: "Tambah tabungan",
      createdById: "usr-pengurus-01",
    });

    const accAfterDeposit = await db.savings.getAccountByMemberId("mbr-001");
    expect(Number(accAfterDeposit.voluntaryBalance)).toBe(initSukarela + 500000);

    // Penarikan sukarela
    await db.savings.recordMutation({
      memberId: "mbr-001",
      type: "PENARIKAN",
      category: "SUKARELA",
      amount: 200000,
      notes: "Tarik tabungan",
      createdById: "usr-pengurus-01",
    });

    const accAfterWithdraw = await db.savings.getAccountByMemberId("mbr-001");
    expect(Number(accAfterWithdraw.voluntaryBalance)).toBe(initSukarela + 300000);

    // Coba tarik melebihi saldo sukarela -> harus throw error
    await expect(
      db.savings.recordMutation({
        memberId: "mbr-001",
        type: "PENARIKAN",
        category: "SUKARELA",
        amount: 999999999,
        createdById: "usr-pengurus-01",
      })
    ).rejects.toThrow(/Saldo simpanan.*tidak mencukupi/);
  });

  it("menghitung statistik dashboard pengurus dengan data nyata", async () => {
    const stats = await db.stats.getAdminDashboardStats();
    expect(stats.totalActiveMembers).toBeGreaterThanOrEqual(4);
    expect(stats.totalFarms).toBeGreaterThanOrEqual(5);
    expect(stats.totalMonthlyNetWeight).toBeGreaterThan(0);
    expect(stats.totalMonthlyGrossAmount).toBeGreaterThan(0);
    expect(stats.totalPaid).toBeGreaterThan(0);
    expect(stats.totalPendingPayment).toBeGreaterThan(0);
  });
});
