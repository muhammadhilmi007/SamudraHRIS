/**
 * ============================================================
 * SamudraHRD — Application Constants
 * ============================================================
 * Semua konstanta yang digunakan di seluruh aplikasi.
 * Referensi: PRD v1.0 & SRS v1.0
 * ============================================================
 */

// ============================================================
// Role Pengguna (RBAC)
// ============================================================
const ROLES = Object.freeze({
  ADMIN: 'admin',
  MANAGER_HRD: 'manager_hrd',
  KEPALA_CABANG: 'kepala_cabang',
  STAFF_ADMIN: 'staff_admin',
  KASIR: 'kasir',
});

// ============================================================
// Status Karyawan
// ============================================================
const EMPLOYEE_STATUS = Object.freeze({
  KT: 'KT',   // Karyawan Tetap
  KL: 'KL',   // Karyawan Luar / Lepas
  MAGANG: 'MAGANG',
});

// ============================================================
// Siklus Pembayaran Gaji
// ============================================================
const PAYMENT_CYCLE = Object.freeze({
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
});

// ============================================================
// Metode Absensi
// ============================================================
const ATTENDANCE_METHOD = Object.freeze({
  QR: 'qr',
  BUTTON: 'button',
  MANUAL: 'manual',
  FACE: 'face',
});

// ============================================================
// Status Absensi
// ============================================================
const ATTENDANCE_STATUS = Object.freeze({
  HADIR: 'hadir',
  IZIN: 'izin',
  SAKIT: 'sakit',
  ALPA: 'alpa',
  TERLAMBAT: 'terlambat',
  LIBUR: 'libur',
  PENDING: 'pending',
});

// ============================================================
// Status Payroll
// ============================================================
const PAYROLL_STATUS = Object.freeze({
  DRAFT: 'draft',
  PROCESSING: 'processing',
  REVIEWED: 'reviewed',
  APPROVED: 'approved',
  PAID: 'paid',
  LOCKED: 'locked',
});

// ============================================================
// Status Piutang
// ============================================================
const RECEIVABLE_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
});

// ============================================================
// HTTP Status Codes
// ============================================================
const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
});

// ============================================================
// Approval Level Piutang
// ============================================================
const APPROVAL_LEVEL = Object.freeze({
  BRANCH: 'branch',       // < Rp 1.000.000 → Kepala Cabang
  HRD: 'hrd',             // >= Rp 1.000.000 → Manager HRD
});

// ============================================================
// Batas Approval Piutang (dalam Rupiah)
// ============================================================
const RECEIVABLE_APPROVAL_THRESHOLD = 1000000; // Rp 1.000.000

module.exports = {
  ROLES,
  EMPLOYEE_STATUS,
  PAYMENT_CYCLE,
  ATTENDANCE_METHOD,
  ATTENDANCE_STATUS,
  PAYROLL_STATUS,
  RECEIVABLE_STATUS,
  HTTP_STATUS,
  APPROVAL_LEVEL,
  RECEIVABLE_APPROVAL_THRESHOLD,
};
