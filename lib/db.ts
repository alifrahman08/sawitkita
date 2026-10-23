import fs from "fs";
import path from "path";
import {
  UserRecord,
  MemberRecord,
  FarmRecord,
  TbsPriceRecord,
  WeighingTransactionRecord,
  PaymentRecord,
  SavingsAccountRecord,
  SavingsMutationRecord,
  AnnouncementRecord,
  SettingRecord,
  ExpenseRecord,
  AuditLogRecord,
  PaymentMethod,
  PaymentStatus,
  TransactionStatus,
} from "./types";
import {
  initialUsers,
  initialMembers,
  initialFarms,
  initialPrices,
  initialTransactions,
  initialPayments,
  initialSavingsAccounts,
  initialSavingsMutations,
  initialAnnouncements,
  initialSettings,
  initialExpenses,
  initialAuditLogs,
} from "./seed-data";

export interface DatabaseState {
  users: UserRecord[];
  members: MemberRecord[];
  farms: FarmRecord[];
  prices: TbsPriceRecord[];
  transactions: WeighingTransactionRecord[];
  payments: PaymentRecord[];
  savingsAccounts: SavingsAccountRecord[];
  savingsMutations: SavingsMutationRecord[];
  announcements: AnnouncementRecord[];
  settings: SettingRecord[];
  expenses: ExpenseRecord[];
  auditLogs: AuditLogRecord[];
}

const DB_FILE_PATH = path.join(process.cwd(), "prisma", "local-dev-db.json");

function getInitialState(): DatabaseState {
  return {
    users: JSON.parse(JSON.stringify(initialUsers)),
    members: JSON.parse(JSON.stringify(initialMembers)),
    farms: JSON.parse(JSON.stringify(initialFarms)),
    prices: JSON.parse(JSON.stringify(initialPrices)),
    transactions: JSON.parse(JSON.stringify(initialTransactions)),
    payments: JSON.parse(JSON.stringify(initialPayments)),
    savingsAccounts: JSON.parse(JSON.stringify(initialSavingsAccounts)),
    savingsMutations: JSON.parse(JSON.stringify(initialSavingsMutations)),
    announcements: JSON.parse(JSON.stringify(initialAnnouncements)),
    settings: JSON.parse(JSON.stringify(initialSettings)),
    expenses: JSON.parse(JSON.stringify(initialExpenses)),
    auditLogs: JSON.parse(JSON.stringify(initialAuditLogs)),
  };
}

let inMemoryState: DatabaseState | null = null;

function loadDatabase(): DatabaseState {
  if (inMemoryState) {
    return inMemoryState;
  }

  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
      inMemoryState = JSON.parse(raw);
      return inMemoryState!;
    }
  } catch (err) {
    console.warn("Could not read local DB file, initializing default dataset:", err);
  }

  inMemoryState = getInitialState();
  saveDatabase(inMemoryState);
  return inMemoryState;
}

function saveDatabase(state: DatabaseState) {
  try {
    inMemoryState = state;
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(state, null, 2), "utf-8");
  } catch (err) {
    console.error("Error persisting database state to disk:", err);
  }
}

export const db = {
  resetToSeed() {
    inMemoryState = getInitialState();
    saveDatabase(inMemoryState);
    return true;
  },

  // USERS
  users: {
    async findByEmail(email: string): Promise<UserRecord | null> {
      const state = loadDatabase();
      return state.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
    },
    async findById(id: string): Promise<UserRecord | null> {
      const state = loadDatabase();
      return state.users.find((u) => u.id === id) || null;
    },
    async findMany(): Promise<UserRecord[]> {
      const state = loadDatabase();
      return state.users;
    },
    async create(user: UserRecord): Promise<UserRecord> {
      const state = loadDatabase();
      state.users.push(user);
      saveDatabase(state);
      return user;
    },
  },

  // MEMBERS
  members: {
    async findMany(options?: {
      search?: string;
      status?: string;
      page?: number;
      limit?: number;
    }) {
      const state = loadDatabase();
      let list = state.members.filter((m) => !m.deletedAt);

      if (options?.search) {
        const q = options.search.toLowerCase();
        list = list.filter(
          (m) =>
            m.fullName.toLowerCase().includes(q) ||
            m.memberNo.toLowerCase().includes(q) ||
            (m.nik && m.nik.includes(q)) ||
            m.phone.includes(q)
        );
      }

      if (options?.status && options.status !== "ALL") {
        list = list.filter((m) => m.status === options.status);
      }

      const total = list.length;
      const page = options?.page || 1;
      const limit = options?.limit || 20;
      const startIndex = (page - 1) * limit;
      const paginated = list.slice(startIndex, startIndex + limit);

      const items = paginated.map((m) => {
        const farms = state.farms.filter((f) => f.memberId === m.id && !f.deletedAt);
        const transactions = state.transactions.filter((t) => t.memberId === m.id);
        const totalNetWeight = transactions.reduce((acc, t) => acc + Number(t.netWeight), 0);
        const totalGrossAmount = transactions.reduce((acc, t) => acc + Number(t.grossAmount), 0);
        return {
          ...m,
          farmCount: farms.length,
          farms,
          totalNetWeight,
          totalGrossAmount,
        };
      });

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    },

    async findById(id: string) {
      const state = loadDatabase();
      const member = state.members.find((m) => m.id === id && !m.deletedAt);
      if (!member) return null;

      const farms = state.farms.filter((f) => f.memberId === member.id && !f.deletedAt);
      const savings = state.savingsAccounts.find((s) => s.memberId === member.id) || null;
      const transactions = state.transactions.filter((t) => t.memberId === member.id);

      return {
        ...member,
        farms,
        savings,
        transactions,
      };
    },

    async findByUserId(userId: string): Promise<MemberRecord | null> {
      const state = loadDatabase();
      const member = state.members.find((m) => m.userId === userId && !m.deletedAt);
      return member || null;
    },

    async findByMemberNo(memberNo: string): Promise<MemberRecord | null> {
      const state = loadDatabase();
      return state.members.find((m) => m.memberNo === memberNo && !m.deletedAt) || null;
    },

    async create(data: Omit<MemberRecord, "id" | "createdAt" | "updatedAt">): Promise<MemberRecord> {
      const state = loadDatabase();
      const id = `mbr-${Date.now()}`;
      const newMember: MemberRecord = {
        ...data,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      state.members.push(newMember);

      // Auto-create savings account
      state.savingsAccounts.push({
        id: `sav-${Date.now()}`,
        memberId: id,
        principalBalance: 0,
        mandatoryBalance: 0,
        voluntaryBalance: 0,
        totalBalance: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      saveDatabase(state);
      return newMember;
    },

    async update(id: string, data: Partial<MemberRecord>): Promise<MemberRecord> {
      const state = loadDatabase();
      const idx = state.members.findIndex((m) => m.id === id);
      if (idx === -1) throw new Error("Anggota tidak ditemukan");

      state.members[idx] = {
        ...state.members[idx],
        ...data,
        updatedAt: new Date(),
      };
      saveDatabase(state);
      return state.members[idx];
    },

    async softDelete(id: string): Promise<MemberRecord> {
      const state = loadDatabase();
      const idx = state.members.findIndex((m) => m.id === id);
      if (idx === -1) throw new Error("Anggota tidak ditemukan");

      state.members[idx].deletedAt = new Date();
      state.members[idx].status = "NONAKTIF";
      saveDatabase(state);
      return state.members[idx];
    },
  },

  // FARMS
  farms: {
    async findMany(options?: { memberId?: string; search?: string; status?: string }) {
      const state = loadDatabase();
      let list = state.farms.filter((f) => !f.deletedAt);

      if (options?.memberId) {
        list = list.filter((f) => f.memberId === options.memberId);
      }

      if (options?.status && options.status !== "ALL") {
        list = list.filter((f) => f.status === options.status);
      }

      if (options?.search) {
        const q = options.search.toLowerCase();
        list = list.filter(
          (f) =>
            f.name.toLowerCase().includes(q) ||
            f.code.toLowerCase().includes(q) ||
            f.village.toLowerCase().includes(q) ||
            f.district.toLowerCase().includes(q)
        );
      }

      return list.map((f) => {
        const member = state.members.find((m) => m.id === f.memberId);
        const transactions = state.transactions.filter((t) => t.farmId === f.id);
        const totalNetWeight = transactions.reduce((acc, t) => acc + Number(t.netWeight), 0);
        return {
          ...f,
          memberName: member ? member.fullName : "Tidak diketahui",
          memberNo: member ? member.memberNo : "-",
          transactionCount: transactions.length,
          totalNetWeight,
        };
      });
    },

    async findById(id: string) {
      const state = loadDatabase();
      const farm = state.farms.find((f) => f.id === id && !f.deletedAt);
      if (!farm) return null;
      const member = state.members.find((m) => m.id === farm.memberId);
      return {
        ...farm,
        member,
      };
    },

    async create(data: Omit<FarmRecord, "id" | "createdAt" | "updatedAt">): Promise<FarmRecord> {
      const state = loadDatabase();
      const id = `frm-${Date.now()}`;
      const newFarm: FarmRecord = {
        ...data,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      state.farms.push(newFarm);
      saveDatabase(state);
      return newFarm;
    },

    async update(id: string, data: Partial<FarmRecord>): Promise<FarmRecord> {
      const state = loadDatabase();
      const idx = state.farms.findIndex((f) => f.id === id);
      if (idx === -1) throw new Error("Data kebun tidak ditemukan");

      state.farms[idx] = {
        ...state.farms[idx],
        ...data,
        updatedAt: new Date(),
      };
      saveDatabase(state);
      return state.farms[idx];
    },

    async softDelete(id: string): Promise<FarmRecord> {
      const state = loadDatabase();
      const idx = state.farms.findIndex((f) => f.id === id);
      if (idx === -1) throw new Error("Data kebun tidak ditemukan");

      state.farms[idx].deletedAt = new Date();
      state.farms[idx].status = "NONAKTIF";
      saveDatabase(state);
      return state.farms[idx];
    },
  },

  // PRICES
  prices: {
    async findCurrentActive(): Promise<TbsPriceRecord> {
      const state = loadDatabase();
      const active = state.prices
        .filter((p) => p.status === "AKTIF")
        .sort((a, b) => new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime());
      return active[0] || state.prices[0];
    },

    async findMany(): Promise<TbsPriceRecord[]> {
      const state = loadDatabase();
      return [...state.prices].sort(
        (a, b) => new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime()
      );
    },

    async create(data: Omit<TbsPriceRecord, "id" | "createdAt" | "updatedAt">): Promise<TbsPriceRecord> {
      const state = loadDatabase();
      if (data.status === "AKTIF") {
        state.prices.forEach((p) => {
          if (p.status === "AKTIF") {
            p.status = "KEDALUWARSA";
            p.effectiveTo = new Date(data.effectiveFrom);
          }
        });
      }

      const id = `prc-${Date.now()}`;
      const newPrice: TbsPriceRecord = {
        ...data,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      state.prices.unshift(newPrice);
      saveDatabase(state);
      return newPrice;
    },
  },

  // TRANSACTIONS
  transactions: {
    async findMany(options?: {
      search?: string;
      memberId?: string;
      farmId?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    }) {
      const state = loadDatabase();
      let list = [...state.transactions];

      if (options?.memberId) {
        list = list.filter((t) => t.memberId === options.memberId);
      }

      if (options?.farmId) {
        list = list.filter((t) => t.farmId === options.farmId);
      }

      if (options?.status && options.status !== "ALL") {
        list = list.filter((t) => t.status === options.status);
      }

      if (options?.startDate) {
        const start = new Date(options.startDate);
        list = list.filter((t) => new Date(t.date) >= start);
      }

      if (options?.endDate) {
        const end = new Date(options.endDate);
        end.setHours(23, 59, 59, 999);
        list = list.filter((t) => new Date(t.date) <= end);
      }

      if (options?.search) {
        const q = options.search.toLowerCase();
        list = list.filter((t) => {
          const member = state.members.find((m) => m.id === t.memberId);
          return (
            t.transactionNo.toLowerCase().includes(q) ||
            (t.ticketNo && t.ticketNo.toLowerCase().includes(q)) ||
            (member && member.fullName.toLowerCase().includes(q))
          );
        });
      }

      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const total = list.length;
      const page = options?.page || 1;
      const limit = options?.limit || 20;
      const startIndex = (page - 1) * limit;
      const paginated = list.slice(startIndex, startIndex + limit);

      const items = paginated.map((t) => {
        const member = state.members.find((m) => m.id === t.memberId);
        const farm = state.farms.find((f) => f.id === t.farmId);
        return {
          ...t,
          member,
          farm,
        };
      });

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    },

    async findById(id: string) {
      const state = loadDatabase();
      const transaction = state.transactions.find((t) => t.id === id);
      if (!transaction) return null;

      const member = state.members.find((m) => m.id === transaction.memberId);
      const farm = state.farms.find((f) => f.id === transaction.farmId);
      const recordedBy = state.users.find((u) => u.id === transaction.recordedById);
      const verifiedBy = state.users.find((u) => u.id === transaction.verifiedById);

      const payments = state.payments.filter((p) =>
        p.allocations.some((a) => a.transactionId === transaction.id)
      );

      return {
        ...transaction,
        member,
        farm,
        recordedBy,
        verifiedBy,
        payments,
      };
    },

    async create(
      data: Omit<WeighingTransactionRecord, "id" | "createdAt" | "updatedAt" | "paidAmount" | "remainingAmount" | "date" | "ticketNo" | "notes" | "qualityCategory" | "verifiedById" | "verifiedAt" | "cancellationReason"> & {
        paidAmount?: number;
        remainingAmount?: number;
        date?: Date;
        ticketNo?: string | null;
        notes?: string | null;
        qualityCategory?: string | null;
        verifiedById?: string | null;
        verifiedAt?: Date | null;
        cancellationReason?: string | null;
      }
    ): Promise<WeighingTransactionRecord> {
      const state = loadDatabase();
      const id = `trx-${Date.now()}`;
      const newTransaction: WeighingTransactionRecord = {
        id,
        transactionNo: data.transactionNo,
        ticketNo: data.ticketNo ?? null,
        date: data.date ?? new Date(),
        memberId: data.memberId,
        farmId: data.farmId,
        grossWeight: data.grossWeight,
        tareWeight: data.tareWeight,
        deductionPercentage: data.deductionPercentage,
        deductionWeightKg: data.deductionWeightKg,
        netWeight: data.netWeight,
        pricePerKg: data.pricePerKg,
        grossAmount: data.grossAmount,
        paidAmount: data.paidAmount ?? 0,
        remainingAmount: data.remainingAmount ?? data.grossAmount,
        qualityCategory: data.qualityCategory ?? "Standar",
        notes: data.notes ?? null,
        recordedById: data.recordedById,
        verifiedById: data.verifiedById ?? null,
        verifiedAt: data.verifiedAt ?? null,
        status: data.status,
        cancellationReason: data.cancellationReason ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      state.transactions.unshift(newTransaction);
      saveDatabase(state);
      return newTransaction;
    },

    async update(
      id: string,
      data: Partial<WeighingTransactionRecord>
    ): Promise<WeighingTransactionRecord> {
      const state = loadDatabase();
      const idx = state.transactions.findIndex((t) => t.id === id);
      if (idx === -1) throw new Error("Transaksi tidak ditemukan");

      state.transactions[idx] = {
        ...state.transactions[idx],
        ...data,
        updatedAt: new Date(),
      };
      saveDatabase(state);
      return state.transactions[idx];
    },

    async updateStatus(
      id: string,
      status: TransactionStatus,
      userId?: string
    ): Promise<WeighingTransactionRecord> {
      const state = loadDatabase();
      const idx = state.transactions.findIndex((t) => t.id === id);
      if (idx === -1) throw new Error("Transaksi tidak ditemukan");

      state.transactions[idx].status = status;
      if (status === "TERKONFIRMASI" && userId) {
        state.transactions[idx].verifiedById = userId;
        state.transactions[idx].verifiedAt = new Date();
      }
      state.transactions[idx].updatedAt = new Date();
      saveDatabase(state);
      return state.transactions[idx];
    },

    async verify(id: string, verifiedById: string): Promise<WeighingTransactionRecord> {
      const state = loadDatabase();
      const idx = state.transactions.findIndex((t) => t.id === id);
      if (idx === -1) throw new Error("Transaksi tidak ditemukan");

      state.transactions[idx].status = "TERKONFIRMASI";
      state.transactions[idx].verifiedById = verifiedById;
      state.transactions[idx].verifiedAt = new Date();
      state.transactions[idx].updatedAt = new Date();

      saveDatabase(state);
      return state.transactions[idx];
    },

    async cancel(id: string, reason: string): Promise<WeighingTransactionRecord> {
      const state = loadDatabase();
      const idx = state.transactions.findIndex((t) => t.id === id);
      if (idx === -1) throw new Error("Transaksi tidak ditemukan");

      if (Number(state.transactions[idx].paidAmount) > 0) {
        throw new Error("Transaksi yang sudah dibayar tidak dapat dibatalkan.");
      }

      state.transactions[idx].status = "DIBATALKAN";
      state.transactions[idx].notes =
        (state.transactions[idx].notes || "") + ` [DIBATALKAN: ${reason}]`;
      state.transactions[idx].updatedAt = new Date();

      saveDatabase(state);
      return state.transactions[idx];
    },
  },

  // PAYMENTS
  payments: {
    async findMany(options?: {
      search?: string;
      memberId?: string;
      status?: string;
      method?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    }) {
      const state = loadDatabase();
      let list = [...state.payments];

      if (options?.memberId) {
        list = list.filter((p) => p.memberId === options.memberId);
      }

      if (options?.status && options.status !== "ALL") {
        list = list.filter((p) => p.status === options.status);
      }

      if (options?.method && options.method !== "ALL") {
        list = list.filter((p) => p.paymentMethod === options.method);
      }

      if (options?.startDate) {
        const start = new Date(options.startDate);
        list = list.filter((p) => new Date(p.paymentDate) >= start);
      }

      if (options?.endDate) {
        const end = new Date(options.endDate);
        end.setHours(23, 59, 59, 999);
        list = list.filter((p) => new Date(p.paymentDate) <= end);
      }

      if (options?.search) {
        const q = options.search.toLowerCase();
        list = list.filter((p) => {
          const member = state.members.find((m) => m.id === p.memberId);
          return (
            p.paymentNo.toLowerCase().includes(q) ||
            (p.bankReference && p.bankReference.toLowerCase().includes(q)) ||
            (member && member.fullName.toLowerCase().includes(q))
          );
        });
      }

      list.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

      const total = list.length;
      const page = options?.page || 1;
      const limit = options?.limit || 20;
      const startIndex = (page - 1) * limit;
      const paginated = list.slice(startIndex, startIndex + limit);

      const items = paginated.map((p) => {
        const member = state.members.find((m) => m.id === p.memberId);
        return {
          ...p,
          member,
        };
      });

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    },

    async findById(id: string) {
      const state = loadDatabase();
      const payment = state.payments.find((p) => p.id === id);
      if (!payment) return null;

      const member = state.members.find((m) => m.id === payment.memberId);
      const createdBy = state.users.find((u) => u.id === payment.createdById);
      const verifiedBy = state.users.find((u) => u.id === payment.verifiedById);

      const allocationsWithDetails = payment.allocations.map((a) => {
        const transaction = state.transactions.find((t) => t.id === a.transactionId);
        return {
          ...a,
          transaction,
        };
      });

      return {
        ...payment,
        member,
        createdBy,
        verifiedBy,
        allocations: allocationsWithDetails,
      };
    },

    async create(data: {
      memberId: string;
      totalAmount: number;
      paymentMethod: PaymentMethod;
      paymentNo?: string;
      paymentDate?: Date;
      status?: PaymentStatus | string;
      bankReference?: string;
      proofUrl?: string;
      notes?: string;
      createdById?: string;
      processedById?: string;
      allocations: { transactionId: string; allocatedAmount: number }[];
    }): Promise<PaymentRecord> {
      const state = loadDatabase();
      const id = `pay-${Date.now()}`;
      const now = data.paymentDate || new Date();
      const paymentNo =
        data.paymentNo ||
        `BYR-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;

      for (const alloc of data.allocations) {
        const trx = state.transactions.find((t) => t.id === alloc.transactionId);
        if (!trx) throw new Error(`Transaksi ID ${alloc.transactionId} tidak ditemukan.`);

        const currentPaid = Number(trx.paidAmount) || 0;
        const gross = Number(trx.grossAmount) || 0;
        const newPaid = currentPaid + Number(alloc.allocatedAmount);
        const newRemaining = Math.max(0, gross - newPaid);

        trx.paidAmount = newPaid;
        trx.remainingAmount = newRemaining;
        trx.status = newRemaining === 0 ? "LUNAS" : "DIBAYAR_SEBAGIAN";
        trx.updatedAt = new Date();
      }

      const userId = data.createdById || data.processedById || "usr-system";

      const paymentStatus: PaymentStatus =
        data.status === "DIBATALKAN" || data.status === "BATAL"
          ? "DIBATALKAN"
          : data.status === "DRAFT"
            ? "DRAFT"
            : "DIVERIFIKASI";

      const newPayment: PaymentRecord = {
        id,
        paymentNo,
        memberId: data.memberId,
        paymentDate: now,
        totalAmount: data.totalAmount,
        paymentMethod: data.paymentMethod,
        bankReference: data.bankReference || null,
        proofUrl: data.proofUrl || null,
        status: paymentStatus,
        notes: data.notes || null,
        createdById: userId,
        verifiedById: userId,
        verifiedAt: now,
        createdAt: now,
        updatedAt: now,
        allocations: data.allocations.map((a, idx) => ({
          id: `alc-${Date.now()}-${idx}`,
          paymentId: id,
          transactionId: a.transactionId,
          allocatedAmount: a.allocatedAmount,
          createdAt: now,
        })),
      };

      state.payments.unshift(newPayment);
      saveDatabase(state);
      return newPayment;
    },
  },

  // SAVINGS
  savings: {
    async getAccountByMemberId(memberId: string) {
      const state = loadDatabase();
      let account = state.savingsAccounts.find((s) => s.memberId === memberId);
      if (!account) {
        account = {
          id: `sav-${Date.now()}`,
          memberId,
          principalBalance: 0,
          mandatoryBalance: 0,
          voluntaryBalance: 0,
          totalBalance: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        state.savingsAccounts.push(account);
        saveDatabase(state);
      }

      const member = state.members.find((m) => m.id === memberId);
      const mutations = state.savingsMutations
        .filter((m) => m.memberId === memberId)
        .sort((a, b) => new Date(b.mutationDate).getTime() - new Date(a.mutationDate).getTime());

      return {
        ...account,
        member,
        mutations,
      };
    },

    async getAllAccounts() {
      const state = loadDatabase();
      return state.savingsAccounts.map((acc) => {
        const member = state.members.find((m) => m.id === acc.memberId);
        return {
          ...acc,
          member,
        };
      });
    },

    async getMutations(options?: {
      memberId?: string;
      type?: string;
      category?: string;
      search?: string;
    }) {
      const state = loadDatabase();
      let list = [...state.savingsMutations];

      if (options?.memberId) {
        list = list.filter((m) => m.memberId === options.memberId);
      }

      if (options?.type && options.type !== "ALL") {
        list = list.filter((m) => m.type === options.type);
      }

      if (options?.category && options.category !== "ALL") {
        list = list.filter((m) => m.category === options.category);
      }

      if (options?.search) {
        const q = options.search.toLowerCase();
        list = list.filter((m) => {
          const member = state.members.find((mem) => mem.id === m.memberId);
          return (
            m.mutationNo.toLowerCase().includes(q) ||
            (member && member.fullName.toLowerCase().includes(q))
          );
        });
      }

      list.sort((a, b) => new Date(b.mutationDate).getTime() - new Date(a.mutationDate).getTime());

      return list.map((mut) => {
        const member = state.members.find((m) => m.id === mut.memberId);
        return {
          ...mut,
          member,
        };
      });
    },

    async recordMutation(data: {
      memberId: string;
      type: "SETORAN" | "PENARIKAN" | "KOREKSI";
      category: "POKOK" | "WAJIB" | "SUKARELA";
      amount: number;
      notes?: string;
      referenceNo?: string;
      createdById: string;
    }) {
      const state = loadDatabase();
      let account = state.savingsAccounts.find((s) => s.memberId === data.memberId);
      if (!account) {
        account = {
          id: `sav-${Date.now()}`,
          memberId: data.memberId,
          principalBalance: 0,
          mandatoryBalance: 0,
          voluntaryBalance: 0,
          totalBalance: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        state.savingsAccounts.push(account);
      }

      const amount = Number(data.amount);
      let catKey: "principalBalance" | "mandatoryBalance" | "voluntaryBalance" = "voluntaryBalance";
      if (data.category === "POKOK") catKey = "principalBalance";
      else if (data.category === "WAJIB") catKey = "mandatoryBalance";

      if (data.type === "PENARIKAN") {
        if (data.category === "POKOK" || data.category === "WAJIB") {
          throw new Error(
            `Simpanan ${data.category.toLowerCase()} hanya dapat ditarik saat anggota berhenti dari keanggotaan koperasi.`
          );
        }
        const currentCategoryBalance = Number(account[catKey]) || 0;
        if (amount > currentCategoryBalance) {
          throw new Error(
            `Saldo simpanan ${data.category.toLowerCase()} tidak mencukupi untuk penarikan. Saldo tersedia: Rp ${currentCategoryBalance.toLocaleString("id-ID")}`
          );
        }
        account[catKey] = currentCategoryBalance - amount;
      } else {
        account[catKey] = (Number(account[catKey]) || 0) + amount;
      }

      account.totalBalance =
        Number(account.principalBalance) +
        Number(account.mandatoryBalance) +
        Number(account.voluntaryBalance);
      account.updatedAt = new Date();

      const mutationId = `mut-${Date.now()}`;
      const now = new Date();
      const mutationNo = `MUT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newMutation: SavingsMutationRecord = {
        id: mutationId,
        mutationNo,
        savingsAccountId: account.id,
        memberId: data.memberId,
        mutationDate: now,
        type: data.type,
        category: data.category,
        amount,
        balanceAfter: account.totalBalance,
        referenceNo: data.referenceNo || null,
        notes: data.notes || null,
        createdById: data.createdById,
        createdAt: now,
      };

      state.savingsMutations.unshift(newMutation);
      saveDatabase(state);
      return { mutation: newMutation, account };
    },
  },

  // ANNOUNCEMENTS
  announcements: {
    async findMany(options?: { role?: string; publishedOnly?: boolean }): Promise<AnnouncementRecord[]> {
      const state = loadDatabase();
      let list = [...state.announcements];

      if (options?.publishedOnly) {
        list = list.filter((a) => a.isPublished);
      }

      if (options?.role && options.role !== "ALL") {
        list = list.filter((a) => a.targetRole === "SEMUA" || a.targetRole === options.role);
      }

      list.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      return list;
    },

    async create(
      data: Omit<AnnouncementRecord, "id" | "createdAt" | "updatedAt">
    ): Promise<AnnouncementRecord> {
      const state = loadDatabase();
      const id = `ann-${Date.now()}`;
      const newAnn: AnnouncementRecord = {
        ...data,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      state.announcements.unshift(newAnn);
      saveDatabase(state);
      return newAnn;
    },

    async update(id: string, data: Partial<AnnouncementRecord>): Promise<AnnouncementRecord> {
      const state = loadDatabase();
      const idx = state.announcements.findIndex((a) => a.id === id);
      if (idx === -1) throw new Error("Pengumuman tidak ditemukan");

      state.announcements[idx] = {
        ...state.announcements[idx],
        ...data,
        updatedAt: new Date(),
      };
      saveDatabase(state);
      return state.announcements[idx];
    },

    async delete(id: string): Promise<boolean> {
      const state = loadDatabase();
      state.announcements = state.announcements.filter((a) => a.id !== id);
      saveDatabase(state);
      return true;
    },
  },

  // SETTINGS
  settings: {
    async getAll(): Promise<SettingRecord[]> {
      const state = loadDatabase();
      return state.settings;
    },

    async getByKey(key: string): Promise<string | null> {
      const state = loadDatabase();
      const item = state.settings.find((s) => s.key === key);
      return item ? item.value : null;
    },

    async update(key: string, value: string): Promise<boolean> {
      const state = loadDatabase();
      const idx = state.settings.findIndex((s) => s.key === key);
      if (idx !== -1) {
        state.settings[idx].value = value;
        state.settings[idx].updatedAt = new Date();
      } else {
        state.settings.push({
          id: `set-${Date.now()}`,
          key,
          value,
          description: null,
          updatedAt: new Date(),
        });
      }
      saveDatabase(state);
      return true;
    },
  },

  // AUDIT LOGS
  auditLogs: {
    async findMany(limit = 100): Promise<AuditLogRecord[]> {
      const state = loadDatabase();
      return [...state.auditLogs]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
    },

    async create(data: {
      userId?: string | null;
      userName?: string | null;
      action: string;
      entity: string;
      entityId?: string | null;
      details: string;
      ipAddress?: string | null;
    }): Promise<AuditLogRecord> {
      const state = loadDatabase();
      const newLog: AuditLogRecord = {
        id: `log-${Date.now()}`,
        userId: data.userId || null,
        userName: data.userName || "Sistem",
        action: data.action,
        entity: data.entity,
        entityId: data.entityId || null,
        details: data.details,
        ipAddress: data.ipAddress || "127.0.0.1",
        createdAt: new Date(),
      };
      state.auditLogs.unshift(newLog);
      saveDatabase(state);
      return newLog;
    },
  },

  // EXPENSES
  expenses: {
    async findMany(): Promise<ExpenseRecord[]> {
      const state = loadDatabase();
      return [...state.expenses].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    },

    async create(data: {
      category: string;
      amount: number;
      description: string;
      createdById: string;
    }): Promise<ExpenseRecord> {
      const state = loadDatabase();
      const now = new Date();
      const expenseNo = `BIAYA-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newExpense: ExpenseRecord = {
        id: `exp-${Date.now()}`,
        expenseNo,
        date: now,
        category: data.category,
        amount: data.amount,
        description: data.description,
        proofUrl: null,
        createdById: data.createdById,
        createdAt: now,
        updatedAt: now,
      };

      state.expenses.unshift(newExpense);
      saveDatabase(state);
      return newExpense;
    },
  },

  // STATS
  stats: {
    async getAdminDashboardStats() {
      const state = loadDatabase();
      const members = state.members.filter((m) => !m.deletedAt);
      const activeMembers = members.filter((m) => m.status === "AKTIF");
      const farms = state.farms.filter((f) => !f.deletedAt);

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      const monthlyTransactions = state.transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      });

      const totalMonthlyNetWeight = monthlyTransactions.reduce(
        (acc, t) => acc + (t.status !== "DIBATALKAN" ? Number(t.netWeight) : 0),
        0
      );

      const totalMonthlyGrossAmount = monthlyTransactions.reduce(
        (acc, t) => acc + (t.status !== "DIBATALKAN" ? Number(t.grossAmount) : 0),
        0
      );

      const totalPaid = state.payments
        .filter((p) => p.status === "DIVERIFIKASI")
        .reduce((acc, p) => acc + Number(p.totalAmount), 0);

      const totalPendingPayment = state.transactions
        .filter((t) => t.status !== "DIBATALKAN" && t.status !== "DRAFT")
        .reduce((acc, t) => acc + Number(t.remainingAmount), 0);

      const totalSavings = state.savingsAccounts.reduce(
        (acc, s) => acc + Number(s.totalBalance),
        0
      );

      const pendingVerificationCount = state.transactions.filter(
        (t) => t.status === "MENUNGGU_VERIFIKASI"
      ).length;

      return {
        totalActiveMembers: activeMembers.length,
        totalFarms: farms.length,
        totalMonthlyNetWeight,
        totalMonthlyGrossAmount,
        totalPaid,
        totalPendingPayment,
        totalSavings,
        pendingVerificationCount,
      };
    },

    async getMemberDashboardStats(memberId: string) {
      const state = loadDatabase();
      const member = state.members.find((m) => m.id === memberId);
      const farms = state.farms.filter((f) => f.memberId === memberId && !f.deletedAt);
      const transactions = state.transactions.filter((t) => t.memberId === memberId);
      const validTransactions = transactions.filter((t) => t.status !== "DIBATALKAN");

      const totalNetWeight = validTransactions.reduce((acc, t) => acc + Number(t.netWeight), 0);
      const totalGrossAmount = validTransactions.reduce(
        (acc, t) => acc + Number(t.grossAmount),
        0
      );
      const totalPaidReceived = validTransactions.reduce(
        (acc, t) => acc + Number(t.paidAmount),
        0
      );
      const totalRemaining = validTransactions.reduce(
        (acc, t) => acc + Number(t.remainingAmount),
        0
      );

      const savings = state.savingsAccounts.find((s) => s.memberId === memberId) || {
        totalBalance: 0,
        principalBalance: 0,
        mandatoryBalance: 0,
        voluntaryBalance: 0,
      };

      const activePrice = state.prices.find((p) => p.status === "AKTIF") || state.prices[0];

      return {
        member,
        totalFarms: farms.length,
        totalTransactions: validTransactions.length,
        totalNetWeight,
        totalGrossAmount,
        totalPaidReceived,
        totalRemaining,
        savings,
        activePrice,
      };
    },
  },
};
