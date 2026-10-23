export type Role = "SUPER_ADMIN" | "ADMIN" | "ANGGOTA";
export type MemberStatus = "AKTIF" | "NONAKTIF" | "PENDING";
export type FarmStatus = "PRODUKTIF" | "PEREMAJAAN" | "NONAKTIF";
export type PriceStatus = "AKTIF" | "TERJADWAL" | "KEDALUWARSA";
export type TransactionStatus =
  | "DRAFT"
  | "MENUNGGU_VERIFIKASI"
  | "TERKONFIRMASI"
  | "SIAP_DIBAYAR"
  | "DIBAYAR_SEBAGIAN"
  | "LUNAS"
  | "DIBATALKAN";
export type PaymentMethod = "TRANSFER" | "TUNAI";
export type PaymentStatus = "DRAFT" | "DIVERIFIKASI" | "DIBATALKAN";
export type SavingsType = "SETORAN" | "PENARIKAN" | "KOREKSI";
export type SavingsCategory = "POKOK" | "WAJIB" | "SUKARELA";
export type AnnouncementTarget = "SEMUA" | "PENGURUS" | "ANGGOTA";

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  passwordHash: string;
  role: Role;
  isActive: boolean;
  avatarUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemberRecord {
  id: string;
  memberNo: string;
  fullName: string;
  nik: string | null;
  phone: string;
  address: string;
  joinDate: Date;
  status: MemberStatus;
  bankName: string | null;
  bankAccount: string | null;
  bankHolder: string | null;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface FarmRecord {
  id: string;
  code: string;
  name: string;
  memberId: string;
  areaHectares: number;
  village: string;
  district: string;
  regency: string;
  plantingYear: number | null;
  status: FarmStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface TbsPriceRecord {
  id: string;
  pricePerKg: number;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  status: PriceStatus;
  sourceNotes: string | null;
  category: string | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeighingTransactionRecord {
  id: string;
  transactionNo: string;
  ticketNo: string | null;
  date: Date;
  memberId: string;
  farmId: string;
  grossWeight: number;
  tareWeight: number;
  deductionPercentage: number;
  deductionWeightKg: number;
  netWeight: number;
  pricePerKg: number;
  grossAmount: number;
  paidAmount: number;
  remainingAmount: number;
  qualityCategory: string | null;
  notes: string | null;
  recordedById: string | null;
  verifiedById: string | null;
  verifiedAt: Date | null;
  status: TransactionStatus;
  cancellationReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentAllocationRecord {
  id: string;
  paymentId: string;
  transactionId: string;
  allocatedAmount: number;
  createdAt: Date;
}

export interface PaymentRecord {
  id: string;
  paymentNo: string;
  memberId: string;
  paymentDate: Date;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  bankReference: string | null;
  proofUrl: string | null;
  status: PaymentStatus;
  notes: string | null;
  createdById: string | null;
  verifiedById: string | null;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  allocations: PaymentAllocationRecord[];
}

export interface SavingsAccountRecord {
  id: string;
  memberId: string;
  principalBalance: number;
  mandatoryBalance: number;
  voluntaryBalance: number;
  totalBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SavingsMutationRecord {
  id: string;
  mutationNo: string;
  savingsAccountId: string;
  memberId: string;
  mutationDate: Date;
  type: SavingsType;
  category: SavingsCategory;
  amount: number;
  balanceAfter: number;
  referenceNo: string | null;
  notes: string | null;
  createdById: string | null;
  createdAt: Date;
}

export interface AnnouncementRecord {
  id: string;
  title: string;
  content: string;
  targetRole: AnnouncementTarget;
  isPublished: boolean;
  publishedAt: Date;
  expiresAt: Date | null;
  authorId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SettingRecord {
  id: string;
  key: string;
  value: string;
  description: string | null;
  updatedAt: Date;
}

export interface ExpenseRecord {
  id: string;
  expenseNo: string;
  date: Date;
  category: string;
  amount: number;
  description: string;
  proofUrl: string | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLogRecord {
  id: string;
  userId: string | null;
  userName: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  details: string;
  ipAddress: string | null;
  createdAt: Date;
}
