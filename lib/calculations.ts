/**
 * Core business calculations for SawitKita Cooperatives
 */

export interface TransactionCalculationInput {
  grossWeight: number; // Bruto (kg)
  tareWeight: number; // Tara (kg)
  deductionPercentage?: number; // Potongan (%)
  deductionWeightKg?: number; // Potongan berat manual (kg)
  pricePerKg: number; // Harga TBS per kg
}

export interface TransactionCalculationResult {
  weightAfterTare: number; // Berat setelah tara
  deductionPercentKg: number; // Nilai potongan persen dalam kg
  totalDeductionKg: number; // Total potongan dalam kg
  netWeight: number; // Berat bersih (kg)
  grossAmount: number; // Nilai kotor (Rp)
  isValid: boolean;
  errors: string[];
}

/**
 * Calculates weighing transaction values according to cooperative standard rules.
 */
export function calculateTransaction(
  input: TransactionCalculationInput
): TransactionCalculationResult {
  const errors: string[] = [];

  const gross = Number(input.grossWeight) || 0;
  const tare = Number(input.tareWeight) || 0;
  const deductionPct = Number(input.deductionPercentage) || 0;
  const deductionKg = Number(input.deductionWeightKg) || 0;
  const price = Number(input.pricePerKg) || 0;

  if (gross <= 0) {
    errors.push("Berat bruto harus lebih besar dari 0 kg.");
  }
  if (tare < 0) {
    errors.push("Berat tara tidak boleh bernilai negatif.");
  }
  if (tare >= gross && gross > 0) {
    errors.push("Berat tara tidak boleh melebihi atau sama dengan berat bruto.");
  }
  if (deductionPct < 0 || deductionPct > 100) {
    errors.push("Persentase potongan harus berada di antara 0% dan 100%.");
  }
  if (deductionKg < 0) {
    errors.push("Potongan berat manual tidak boleh bernilai negatif.");
  }
  if (price <= 0) {
    errors.push("Harga TBS per kg harus lebih besar dari 0 Rupiah.");
  }

  // Berat Setelah Tara = Berat Bruto - Berat Tara
  const weightAfterTare = Math.max(0, gross - tare);

  // Potongan Persentase (kg) = Berat Setelah Tara × Persentase Potongan / 100
  const deductionPercentKg = Number(((weightAfterTare * deductionPct) / 100).toFixed(2));

  // Total Potongan (kg)
  const totalDeductionKg = Number((deductionPercentKg + deductionKg).toFixed(2));

  // Berat Bersih = Berat Setelah Tara - Potongan Persentase (kg) - Potongan Berat Tambahan
  const netWeightRaw = weightAfterTare - totalDeductionKg;
  const netWeight = Number(Math.max(0, netWeightRaw).toFixed(2));

  if (totalDeductionKg >= weightAfterTare && weightAfterTare > 0) {
    errors.push("Total potongan tidak boleh melebihi atau sama dengan berat setelah tara.");
  }

  // Nilai Kotor = Berat Bersih × Harga TBS per kg (rounded to integer rupiah)
  const grossAmount = Math.round(netWeight * price);

  return {
    weightAfterTare: Number(weightAfterTare.toFixed(2)),
    deductionPercentKg,
    totalDeductionKg,
    netWeight,
    grossAmount,
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Calculates new savings account balance after mutation
 */
export function calculateSavingsMutation(
  currentBalance: number,
  amount: number,
  type: "SETORAN" | "PENARIKAN" | "KOREKSI"
): { newBalance: number; isValid: boolean; error?: string } {
  const current = Number(currentBalance) || 0;
  const amt = Number(amount) || 0;

  if (amt <= 0) {
    return {
      newBalance: current,
      isValid: false,
      error: "Nominal mutasi simpanan harus lebih besar dari 0.",
    };
  }

  if (type === "SETORAN") {
    return {
      newBalance: Math.round(current + amt),
      isValid: true,
    };
  }

  if (type === "PENARIKAN") {
    if (amt > current) {
      return {
        newBalance: current,
        isValid: false,
        error: `Saldo tidak mencukupi untuk penarikan. Saldo tersedia: Rp ${current.toLocaleString("id-ID")}`,
      };
    }
    return {
      newBalance: Math.round(current - amt),
      isValid: true,
    };
  }

  // Koreksi bisa menambah atau mengurangi sesuai parameter
  return {
    newBalance: Math.round(current + amt),
    isValid: true,
  };
}

/**
 * Allocates payment amount to transaction remaining balance
 */
export function allocatePayment(
  remainingAmount: number,
  payAmount: number
): {
  allocated: number;
  newRemaining: number;
  newStatus: "LUNAS" | "DIBAYAR_SEBAGIAN" | "TERKONFIRMASI";
  isValid: boolean;
  error?: string;
} {
  const remaining = Number(remainingAmount) || 0;
  const payment = Number(payAmount) || 0;

  if (payment <= 0) {
    return {
      allocated: 0,
      newRemaining: remaining,
      newStatus: "TERKONFIRMASI",
      isValid: false,
      error: "Nominal pembayaran harus lebih besar dari 0.",
    };
  }

  if (payment > remaining) {
    return {
      allocated: 0,
      newRemaining: remaining,
      newStatus: "TERKONFIRMASI",
      isValid: false,
      error: `Nominal pembayaran (Rp ${payment.toLocaleString("id-ID")}) melebihi sisa kewajiban transaksi (Rp ${remaining.toLocaleString("id-ID")}).`,
    };
  }

  const newRemaining = Math.max(0, remaining - payment);
  const newStatus = newRemaining === 0 ? "LUNAS" : "DIBAYAR_SEBAGIAN";

  return {
    allocated: payment,
    newRemaining,
    newStatus,
    isValid: true,
  };
}
