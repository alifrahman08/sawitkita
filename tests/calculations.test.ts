import { describe, it, expect } from "vitest";
import {
  calculateTransaction,
  calculateSavingsMutation,
  allocatePayment,
} from "../lib/calculations";

describe("Logika Bisnis Penimbangan TBS SawitKita", () => {
  it("menghitung berat bersih dan nilai transaksi dengan benar", () => {
    // Bruto: 5.000 kg, Tara: 1.000 kg => Setelah tara = 4.000 kg
    // Potongan: 3% => 120 kg
    // Potongan berat manual: 30 kg => Total potongan = 150 kg
    // Berat bersih = 4.000 - 150 = 3.850 kg
    // Harga: Rp 2.850 / kg => Nilai kotor = 3.850 * 2.850 = Rp 10.972.500
    const result = calculateTransaction({
      grossWeight: 5000,
      tareWeight: 1000,
      deductionPercentage: 3,
      deductionWeightKg: 30,
      pricePerKg: 2850,
    });

    expect(result.isValid).toBe(true);
    expect(result.weightAfterTare).toBe(4000);
    expect(result.deductionPercentKg).toBe(120);
    expect(result.totalDeductionKg).toBe(150);
    expect(result.netWeight).toBe(3850);
    expect(result.grossAmount).toBe(10972500);
  });

  it("menolak jika berat tara melebihi atau sama dengan bruto", () => {
    const result = calculateTransaction({
      grossWeight: 2000,
      tareWeight: 2100,
      deductionPercentage: 0,
      deductionWeightKg: 0,
      pricePerKg: 2500,
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Berat tara tidak boleh melebihi atau sama dengan berat bruto."
    );
  });

  it("menolak jika berat bruto bernilai negatif atau nol", () => {
    const result = calculateTransaction({
      grossWeight: 0,
      tareWeight: 100,
      deductionPercentage: 2,
      pricePerKg: 2500,
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Berat bruto harus lebih besar dari 0 kg.");
  });

  it("menolak jika persentase potongan tidak masuk akal (> 100% atau < 0%)", () => {
    const result = calculateTransaction({
      grossWeight: 3000,
      tareWeight: 1000,
      deductionPercentage: 105,
      pricePerKg: 2500,
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Persentase potongan harus berada di antara 0% dan 100%."
    );
  });

  it("menolak jika harga TBS per kg kurang dari atau sama dengan 0", () => {
    const result = calculateTransaction({
      grossWeight: 3000,
      tareWeight: 1000,
      deductionPercentage: 2,
      pricePerKg: 0,
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Harga TBS per kg harus lebih besar dari 0 Rupiah.");
  });
});

describe("Logika Bisnis Mutasi Simpanan Koperasi", () => {
  it("menambah saldo dengan benar saat setoran", () => {
    const res = calculateSavingsMutation(500000, 250000, "SETORAN");
    expect(res.isValid).toBe(true);
    expect(res.newBalance).toBe(750000);
  });

  it("mengurangi saldo dengan benar saat penarikan", () => {
    const res = calculateSavingsMutation(1000000, 400000, "PENARIKAN");
    expect(res.isValid).toBe(true);
    expect(res.newBalance).toBe(600000);
  });

  it("mencegah penarikan yang melebihi saldo simpanan tersedia", () => {
    const res = calculateSavingsMutation(300000, 500000, "PENARIKAN");
    expect(res.isValid).toBe(false);
    expect(res.newBalance).toBe(300000);
    expect(res.error).toBeDefined();
  });
});

describe("Logika Alokasi Pembayaran Petani", () => {
  it("mengalokasikan pembayaran parsial dan mengubah status menjadi DIBAYAR_SEBAGIAN", () => {
    const remaining = 10000000;
    const payment = 4000000;
    const res = allocatePayment(remaining, payment);

    expect(res.isValid).toBe(true);
    expect(res.allocated).toBe(4000000);
    expect(res.newRemaining).toBe(6000000);
    expect(res.newStatus).toBe("DIBAYAR_SEBAGIAN");
  });

  it("mengalokasikan pembayaran penuh dan mengubah status menjadi LUNAS", () => {
    const remaining = 5000000;
    const payment = 5000000;
    const res = allocatePayment(remaining, payment);

    expect(res.isValid).toBe(true);
    expect(res.allocated).toBe(5000000);
    expect(res.newRemaining).toBe(0);
    expect(res.newStatus).toBe("LUNAS");
  });

  it("mencegah pembayaran yang melebihi sisa kewajiban", () => {
    const remaining = 2000000;
    const payment = 2500000;
    const res = allocatePayment(remaining, payment);

    expect(res.isValid).toBe(false);
    expect(res.error).toBeDefined();
  });
});
