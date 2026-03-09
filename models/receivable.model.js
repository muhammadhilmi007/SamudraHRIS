const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * ============================================================
 * COLLECTION: receivables
 * Deskripsi : Data piutang karyawan dengan alur persetujuan
 *             bertingkat dan tracking saldo
 * Relasi    : → employees, → branches, → users (approved_by)
 *             ← receivable_installments, ← receivable_payments
 *             ← financial_journals
 *
 * ATURAN BISNIS:
 *   - amount < 1.000.000   → approval Kepala Cabang
 *     (notifikasi info ke Manager HRD)
 *   - amount >= 1.000.000  → approval Manager HRD
 *   - Tidak boleh punya piutang baru jika masih ada yang AKTIF
 *   - Limit nominal berdasarkan status karyawan
 * ============================================================
 */
const ReceivableSchema = new Schema(
  {
    employee_id: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    branch_id: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
      index: true,
    },
    receivable_number: {
      type: String,
      required: true,
      comment: 'Auto-generate: RCV-[KODE_CABANG]-[YYYYMM]-[URUT_4DIGIT]. Contoh: RCV-JKT-202501-0001',
    },
    amount: {
      type: Number,
      required: [true, 'Nominal piutang wajib diisi'],
      min: [1, 'Nominal piutang harus lebih dari 0'],
    },
    purpose: {
      type: String,
      required: [true, 'Tujuan pengajuan piutang wajib diisi'],
      trim: true,
      maxlength: 1000,
    },
    // ---- Alur Persetujuan ----
    approval_level: {
      type: String,
      required: true,
      enum: ['branch', 'hrd'],
      comment: 'branch = Kepala Cabang (< 1jt), hrd = Manager HRD (>= 1jt)',
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'approved', 'active', 'completed', 'rejected', 'cancelled'],
      default: 'pending',
      index: true,
      comment:
        'pending → approved → active (dicairkan) → completed (lunas) | rejected/cancelled',
    },
    approved_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approved_at: { type: Date, default: null },
    rejection_reason: { type: String, trim: true, default: null },
    hrd_notified_at: {
      type: Date,
      default: null,
      comment: 'Waktu notifikasi info terkirim ke HRD (untuk piutang < 1jt)',
    },
    // ---- Skema Cicilan ----
    installment_count: {
      type: Number,
      required: [true, 'Jumlah cicilan wajib diisi'],
      min: [1, 'Cicilan minimal 1 kali'],
      max: [24, 'Cicilan maksimal 24 kali'],
    },
    installment_amount: {
      type: Number,
      required: true,
      comment: 'Nominal cicilan per periode (diinput sendiri oleh karyawan)',
    },
    payment_method: {
      type: String,
      required: true,
      enum: ['salary_deduction', 'direct_payment', 'mixed'],
      comment: 'salary_deduction=potong gaji, direct_payment=bayar langsung, mixed=kombinasi',
    },
    // ---- Tracking Saldo ----
    paid_amount: {
      type: Number,
      default: 0,
      comment: 'Total yang sudah terbayar',
    },
    remaining_balance: {
      type: Number,
      default: 0,
      comment: 'Sisa saldo piutang = amount - paid_amount',
    },
    // ---- Pencairan ----
    disbursed_at: {
      type: Date,
      default: null,
      comment: 'Tanggal dana dicairkan ke karyawan',
    },
    disbursed_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    disbursement_method: {
      type: String,
      enum: ['cash', 'transfer', null],
      default: null,
    },
    disbursement_proof_url: {
      type: String,
      default: null,
      comment: 'Bukti pencairan',
    },
    // ---- Blacklist ----
    is_blacklisted: {
      type: Boolean,
      default: false,
      comment: 'Otomatis ter-set jika melebihi batas cicilan macet',
    },
    notes: { type: String, trim: true, maxlength: 1000 },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'receivables',
  }
);

ReceivableSchema.index({ employee_id: 1, status: 1 });
ReceivableSchema.index({ branch_id: 1, status: 1 });
ReceivableSchema.index({ receivable_number: 1 }, { unique: true });

// Hook: otomatis hitung remaining_balance
ReceivableSchema.pre('save', function (next) {
  this.remaining_balance = this.amount - this.paid_amount;
  if (this.remaining_balance <= 0 && this.status === 'active') {
    this.status = 'completed';
  }
  next();
});

const Receivable = mongoose.model('Receivable', ReceivableSchema);

/**
 * ============================================================
 * COLLECTION: receivable_installments
 * Deskripsi : Jadwal cicilan per piutang (di-generate otomatis
 *             setelah piutang disetujui)
 * Relasi    : → receivables, → employees,
 *             → payroll_details (jika potong gaji)
 *             ← receivable_payments
 * ============================================================
 */
const ReceivableInstallmentSchema = new Schema(
  {
    receivable_id: {
      type: Schema.Types.ObjectId,
      ref: 'Receivable',
      required: true,
      index: true,
    },
    employee_id: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    installment_number: {
      type: Number,
      required: true,
      comment: 'Urutan cicilan ke-N',
    },
    due_date: {
      type: Date,
      required: true,
      index: true,
      comment: 'Tanggal jatuh tempo cicilan — Cron Job scan untuk notifikasi H-3',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
      comment: 'Nominal cicilan yang harus dibayar',
    },
    paid_amount: {
      type: Number,
      default: 0,
      comment: 'Nominal yang sudah terbayar',
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'paid', 'overdue', 'partially_paid', 'waived'],
      default: 'pending',
      index: true,
    },
    // ---- Koneksi ke Payroll (jika metode potong gaji) ----
    payroll_detail_id: {
      type: Schema.Types.ObjectId,
      ref: 'PayrollDetail',
      default: null,
      comment: 'Diisi saat cicilan diproses lewat payroll',
    },
    payroll_period_label: {
      type: String,
      default: null,
    },
    // ---- Notifikasi ----
    reminder_sent_at: {
      type: Date,
      default: null,
      comment: 'Waktu notifikasi H-3 dikirim',
    },
    paid_at: { type: Date, default: null },
    overdue_count: {
      type: Number,
      default: 0,
      comment: 'Akumulasi cicilan macet — untuk evaluasi blacklist',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'receivable_installments',
  }
);

ReceivableInstallmentSchema.index({ receivable_id: 1, installment_number: 1 }, { unique: true });
ReceivableInstallmentSchema.index({ due_date: 1, status: 1 }); // *** Cron Job scan jatuh tempo ***
ReceivableInstallmentSchema.index({ employee_id: 1, status: 1 });

const ReceivableInstallment = mongoose.model('ReceivableInstallment', ReceivableInstallmentSchema);

/**
 * ============================================================
 * COLLECTION: receivable_payments
 * Deskripsi : Rekaman setiap pembayaran cicilan
 *             (tunai, transfer, atau potong gaji)
 * Relasi    : → receivables, → receivable_installments,
 *             → employees, → users (recorded_by)
 * ============================================================
 */
const ReceivablePaymentSchema = new Schema(
  {
    receivable_id: {
      type: Schema.Types.ObjectId,
      ref: 'Receivable',
      required: true,
      index: true,
    },
    installment_id: {
      type: Schema.Types.ObjectId,
      ref: 'ReceivableInstallment',
      required: true,
    },
    employee_id: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    payment_number: {
      type: String,
      required: true,
      comment: 'Auto-generate: PMT-[YYYYMM]-[URUT_5DIGIT]',
    },
    amount: {
      type: Number,
      required: [true, 'Nominal pembayaran wajib diisi'],
      min: [1, 'Nominal pembayaran harus > 0'],
    },
    payment_method: {
      type: String,
      required: true,
      enum: ['salary_deduction', 'cash', 'transfer'],
      comment: 'Metode pembayaran cicilan ini',
    },
    payment_date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    bank_name: {
      type: String,
      default: null,
      comment: 'Diisi jika payment_method = transfer',
    },
    bank_ref_number: {
      type: String,
      default: null,
      comment: 'Nomor referensi transfer bank',
    },
    receipt_url: {
      type: String,
      default: null,
      comment: 'URL bukti pembayaran di MinIO/S3',
    },
    notes: { type: String, trim: true, maxlength: 500 },
    recorded_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      comment: 'Kasir atau sistem yang mencatat',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'receivable_payments',
  }
);

ReceivablePaymentSchema.index({ receivable_id: 1, payment_date: -1 });
ReceivablePaymentSchema.index({ payment_number: 1 }, { unique: true });

const ReceivablePayment = mongoose.model('ReceivablePayment', ReceivablePaymentSchema);

/**
 * ============================================================
 * COLLECTION: receivable_settings
 * Deskripsi : Konfigurasi batas piutang per status karyawan
 * Relasi    : → companies
 * ============================================================
 */
const ReceivableSettingSchema = new Schema(
  {
    company_id: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      unique: true,
    },
    // Batas persetujuan (di bawah ini Kepala Cabang, di atas Manager HRD)
    max_amount_branch_approval: {
      type: Number,
      default: 1000000,
      comment: 'Default: 1.000.000. Di bawah nilai ini = approval Kepala Cabang',
    },
    // Limit per status karyawan
    max_amount_kt: {
      type: Number,
      default: 5000000,
      comment: 'Limit piutang Karyawan Tetap',
    },
    max_amount_kl: {
      type: Number,
      default: 2000000,
      comment: 'Limit piutang Karyawan Luar/Lepas',
    },
    max_amount_magang: {
      type: Number,
      default: 500000,
      comment: 'Limit piutang Magang',
    },
    max_installment_count: {
      type: Number,
      default: 24,
      comment: 'Maksimum jumlah cicilan',
    },
    max_overdue_count_blacklist: {
      type: Number,
      default: 3,
      comment: 'Blacklist otomatis jika cicilan macet >= N kali',
    },
    require_clear_before_new: {
      type: Boolean,
      default: true,
      comment: 'Wajib lunasi piutang lama sebelum ajukan baru',
    },
    min_tenure_months_kt: {
      type: Number,
      default: 3,
      comment: 'Minimum masa kerja (bulan) KT untuk bisa ajukan piutang',
    },
    min_tenure_months_kl: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'receivable_settings',
  }
);

const ReceivableSetting = mongoose.model('ReceivableSetting', ReceivableSettingSchema);

module.exports = {
  Receivable,
  ReceivableInstallment,
  ReceivablePayment,
  ReceivableSetting,
};
