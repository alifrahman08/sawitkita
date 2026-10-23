import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../lib/db";
import { calculateTransaction, calculateSavingsMutation, allocatePayment } from "../lib/calculations";
import { signSessionToken, verifySessionToken } from "../lib/auth";

describe("SAWITKITA E2E BUSINESS FLOWS & SYSTEM VALIDATION", () => {
  beforeEach(() => {
    // Re-seed DB to a known baseline
    db.resetToSeed();
  });

  describe("ALUR 1 — ADMIN COMPLETE OPERATIONAL FLOW", () => {
    it("menjalankan alur penuh: Login -> Tambah Anggota -> Tambah Kebun -> Atur Harga TBS -> Buat Transaksi -> Verifikasi -> Catat Pembayaran -> Periksa Laporan", async () => {
      // 1. Login Admin
      const token = await signSessionToken({
        id: "usr-admin-1",
        email: "pengurus@sawitkita.co.id",
        name: "H. Sudirman, S.P.",
        role: "ADMIN",
        memberId: null,
      });
      const decoded = await verifySessionToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.role).toBe("ADMIN");

      // 2. Tambah Anggota Baru
      const uniqueSuffix = Date.now().toString().slice(-4);
      const newMember = await db.members.create({
        memberNo: `AGT-E2E-${uniqueSuffix}`,
        fullName: `Petani Uji Alur 1 ${uniqueSuffix}`,
        nik: `140101990000${uniqueSuffix}`,
        phone: "081299998888",
        address: "Kecamatan Tapung, Kampar, Riau",
        bankName: "BRI",
        bankAccount: "0123-4567-890",
        bankHolder: "Petani Uji Alur 1",
        userId: null,
        status: "AKTIF",
        joinDate: new Date(),
      });
      expect(newMember.id).toBeDefined();
      expect(newMember.fullName).toContain("Petani Uji Alur 1");

      // 3. Tambah Kebun Baru
      const newFarm = await db.farms.create({
        code: `KBN-E2E-${uniqueSuffix}`,
        name: "Kebun Uji Pola Mandiri",
        memberId: newMember.id,
        areaHectares: 4.5,
        village: "Desa Rimba Beringin",
        district: "Tapung Hulu",
        regency: "Kampar",
        plantingYear: 2018,
        status: "PRODUKTIF",
        notes: null,
      });
      expect(newFarm.id).toBeDefined();
      expect(newFarm.memberId).toBe(newMember.id);

      // 4. Atur Harga TBS Aktif
      const newPrice = await db.prices.create({
        pricePerKg: 3050,
        effectiveFrom: new Date(),
        effectiveTo: null,
        status: "AKTIF",
        sourceNotes: "Penetapan Disbun Riau Periode Uji",
        category: "Standar",
        createdById: decoded!.id,
      });
      expect(newPrice.pricePerKg).toBe(3050);

      const activePrice = await db.prices.findCurrentActive();
      expect(activePrice).not.toBeNull();
      expect(Number(activePrice?.pricePerKg)).toBe(3050);

      // 5. Buat Transaksi Timbang
      // Bruto: 6.000 kg, Tara: 1.200 kg => Setelah tara: 4.800 kg
      // Potongan: 3% => 144 kg, Potongan tambahan: 36 kg => Total pot: 180 kg
      // Netto: 4.800 - 180 = 4.620 kg
      // Nilai Kotor: 4.620 * 3.050 = Rp 14.091.000
      const calc = calculateTransaction({
        grossWeight: 6000,
        tareWeight: 1200,
        deductionPercentage: 3,
        deductionWeightKg: 36,
        pricePerKg: 3050,
      });
      expect(calc.isValid).toBe(true);
      expect(calc.netWeight).toBe(4620);
      expect(calc.grossAmount).toBe(14091000);

      const newTrx = await db.transactions.create({
        transactionNo: `TRX-E2E-${uniqueSuffix}`,
        ticketNo: `TKT-E2E-${uniqueSuffix}`,
        memberId: newMember.id,
        farmId: newFarm.id,
        grossWeight: 6000,
        tareWeight: 1200,
        netWeight: calc.netWeight,
        deductionPercentage: 3,
        deductionWeightKg: 36,
        pricePerKg: 3050,
        grossAmount: calc.grossAmount,
        status: "MENUNGGU_VERIFIKASI",
        recordedById: decoded!.id,
        notes: "Uji alur transaksi lengkap",
      });
      expect(newTrx.status).toBe("MENUNGGU_VERIFIKASI");
      expect(newTrx.remainingAmount).toBe(14091000);

      // 6. Verifikasi Transaksi oleh Pengurus
      const verifiedTrx = await db.transactions.updateStatus(newTrx.id, "TERKONFIRMASI", decoded!.id);
      expect(verifiedTrx.status).toBe("TERKONFIRMASI");

      // 7. Catat Pembayaran Petani Penuh
      const payment = await db.payments.create({
        paymentNo: `PAY-E2E-${uniqueSuffix}`,
        memberId: newMember.id,
        paymentDate: new Date(),
        totalAmount: 14091000,
        paymentMethod: "TRANSFER",
        bankReference: `REF-BRI-${uniqueSuffix}`,
        status: "SELESAI",
        processedById: decoded!.id,
        notes: "Pelunasan panen TBS uji",
        allocations: [
          {
            transactionId: newTrx.id,
            allocatedAmount: 14091000,
          },
        ],
      });
      expect(payment.id).toBeDefined();
      expect(payment.totalAmount).toBe(14091000);

      // Verifikasi status transaksi telah menjadi LUNAS
      const updatedTrx = await db.transactions.findById(newTrx.id);
      expect(updatedTrx?.status).toBe("LUNAS");
      expect(updatedTrx?.paidAmount).toBe(14091000);
      expect(updatedTrx?.remainingAmount).toBe(0);

      // 8. Periksa Laporan Hasil Panen
      const stats = await db.stats.getAdminDashboardStats();
      expect(stats.totalActiveMembers).toBeGreaterThan(0);
      expect(stats.totalFarms).toBeGreaterThan(0);
      expect(stats.totalMonthlyNetWeight).toBeGreaterThan(0);
    });
  });

  describe("ALUR 2 — PORTAL ANGGOTA MANDIRI", () => {
    it("anggota dapat login dan hanya melihat data serta keuangannya sendiri", async () => {
      // Login sebagai Petani Pak Budi Santoso
      const token = await signSessionToken({
        id: "usr-petani-01",
        email: "budi@petani.id",
        name: "Budi Santoso (Petani)",
        role: "ANGGOTA",
        memberId: "mbr-001",
      });
      const decoded = await verifySessionToken(token);
      expect(decoded?.role).toBe("ANGGOTA");
      expect(decoded?.memberId).toBe("mbr-001");

      // Cek data transaksi milik petani mbr-001
      const memberTrx = await db.transactions.findMany({
        memberId: decoded!.memberId!,
        page: 1,
        limit: 10,
      });
      expect(memberTrx.items.length).toBeGreaterThan(0);
      memberTrx.items.forEach((trx) => {
        expect(trx.memberId).toBe("mbr-001");
      });

      // Cek riwayat pembayaran milik petani mbr-001
      const memberPayments = await db.payments.findMany({
        memberId: decoded!.memberId!,
        page: 1,
        limit: 10,
      });
      expect(memberPayments.items.length).toBeGreaterThan(0);
      memberPayments.items.forEach((p) => {
        expect(p.memberId).toBe("mbr-001");
      });

      // Cek akun simpanan pribadi
      const savingsAccount = await db.savings.getAccountByMemberId("mbr-001");
      expect(savingsAccount).not.toBeNull();
      expect(savingsAccount?.memberId).toBe("mbr-001");
      expect(savingsAccount?.totalBalance).toBeGreaterThanOrEqual(0);
    });
  });

  describe("ALUR 3 — PEMBAYARAN PARSIAL DAN PELUNASAN BERTAHAP", () => {
    it("mengelola transaksi dengan pembayaran bertahap (DIBAYAR_SEBAGIAN -> LUNAS)", async () => {
      const suffix = Date.now().toString().slice(-4);

      // 1. Buat transaksi baru senilai Rp 9.000.000
      const trx = await db.transactions.create({
        transactionNo: `TRX-PARSIAL-${suffix}`,
        memberId: "mbr-002",
        farmId: "frm-002",
        grossWeight: 4000,
        tareWeight: 1000,
        netWeight: 3000,
        deductionPercentage: 0,
        deductionWeightKg: 0,
        pricePerKg: 3000,
        grossAmount: 9000000,
        status: "TERKONFIRMASI",
        recordedById: "usr-admin-1",
      });
      expect(trx.remainingAmount).toBe(9000000);
      expect(trx.paidAmount).toBe(0);

      // 2. Pembayaran Tahap 1: Rp 4.000.000 (Parsial)
      const pay1 = await db.payments.create({
        paymentNo: `PAY-P1-${suffix}`,
        memberId: "mbr-002",
        paymentDate: new Date(),
        totalAmount: 4000000,
        paymentMethod: "TRANSFER",
        status: "SELESAI",
        processedById: "usr-admin-1",
        allocations: [{ transactionId: trx.id, allocatedAmount: 4000000 }],
      });
      expect(pay1.totalAmount).toBe(4000000);

      // Status harus DIBAYAR_SEBAGIAN, sisa Rp 5.000.000
      const afterP1 = await db.transactions.findById(trx.id);
      expect(afterP1?.status).toBe("DIBAYAR_SEBAGIAN");
      expect(afterP1?.paidAmount).toBe(4000000);
      expect(afterP1?.remainingAmount).toBe(5000000);

      // 3. Pembayaran Tahap 2: Sisa Rp 5.000.000 (Pelunasan)
      const pay2 = await db.payments.create({
        paymentNo: `PAY-P2-${suffix}`,
        memberId: "mbr-002",
        paymentDate: new Date(),
        totalAmount: 5000000,
        paymentMethod: "TUNAI",
        status: "SELESAI",
        processedById: "usr-admin-1",
        allocations: [{ transactionId: trx.id, allocatedAmount: 5000000 }],
      });
      expect(pay2.totalAmount).toBe(5000000);

      // Status harus LUNAS, sisa Rp 0
      const afterP2 = await db.transactions.findById(trx.id);
      expect(afterP2?.status).toBe("LUNAS");
      expect(afterP2?.paidAmount).toBe(9000000);
      expect(afterP2?.remainingAmount).toBe(0);
    });
  });

  describe("ALUR 4 — KEAMANAN & ISOLASI AKSES ANGGOTA", () => {
    it("memastikan isolasi data: query transaksi milik orang lain dicegah", async () => {
      // Misal anggota mbr-001 mencoba query dengan filter mbr-002
      const user = {
        id: "usr-petani-01",
        name: "Budi Santoso",
        role: "ANGGOTA" as const,
        memberId: "mbr-001",
      };

      // Logika isolasi route handler: jika user.role === 'ANGGOTA', enforce user.memberId
      let targetMemberId: string | undefined = "mbr-002"; // coba akses anggota lain
      if (user.role === "ANGGOTA") {
        targetMemberId = user.memberId; // Paksa hanya memberId miliknya
      }

      expect(targetMemberId).toBe("mbr-001");

      const results = await db.transactions.findMany({ memberId: targetMemberId });
      results.items.forEach((item) => {
        expect(item.memberId).toBe("mbr-001");
        expect(item.memberId).not.toBe("mbr-002");
      });
    });
  });

  describe("ALUR 5 — VALIDASI INPUT & BATASAN KEUANGAN", () => {
    it("menolak transaksi jika berat bruto <= 0", () => {
      const calc = calculateTransaction({
        grossWeight: -500,
        tareWeight: 200,
        deductionPercentage: 2,
        pricePerKg: 2800,
      });
      expect(calc.isValid).toBe(false);
      expect(calc.errors).toContain("Berat bruto harus lebih besar dari 0 kg.");
    });

    it("menolak transaksi jika berat tara >= bruto", () => {
      const calc = calculateTransaction({
        grossWeight: 2500,
        tareWeight: 2600,
        deductionPercentage: 2,
        pricePerKg: 2800,
      });
      expect(calc.isValid).toBe(false);
      expect(calc.errors).toContain(
        "Berat tara tidak boleh melebihi atau sama dengan berat bruto."
      );
    });

    it("menolak alokasi pembayaran yang melebihi sisa kewajiban transaksi", () => {
      const remainingAmount = 3000000;
      const attemptAllocated = 3500000; // Lebih besar Rp 500.000

      const result = allocatePayment(remainingAmount, attemptAllocated);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("melebihi sisa kewajiban");
    });

    it("menolak penarikan simpanan jika melebihi saldo sukarela yang tersedia", async () => {
      await expect(
        db.savings.recordMutation({
          memberId: "mem-1",
          type: "PENARIKAN",
          category: "SUKARELA",
          amount: 50000000, // Nominal melebihi saldo sukarela
          createdById: "usr-admin-1",
        })
      ).rejects.toThrow(/tidak mencukupi/i);
    });

    it("menolak penarikan pada kategori Simpanan Pokok dan Wajib sesuai AD/ART koperasi", async () => {
      await expect(
        db.savings.recordMutation({
          memberId: "mem-1",
          type: "PENARIKAN",
          category: "POKOK",
          amount: 50000,
          createdById: "usr-admin-1",
        })
      ).rejects.toThrow(/hanya dapat ditarik saat anggota berhenti/i);

      await expect(
        db.savings.recordMutation({
          memberId: "mem-1",
          type: "PENARIKAN",
          category: "WAJIB",
          amount: 50000,
          createdById: "usr-admin-1",
        })
      ).rejects.toThrow(/hanya dapat ditarik saat anggota berhenti/i);
    });
  });
});
