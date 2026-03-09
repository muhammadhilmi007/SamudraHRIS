const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * ============================================================
 * COLLECTION: payrolls
 * Deskripsi : Header batch payroll per periode per cabang
 * Relasi    : → companies, → branches, → users
 *             ← payroll_details, ← salary_slips
 *             ← financial_journals
 * ============================================================
 */
const PayrollSchema = new Schema(
  {
    company_id: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    branch_id: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
      index: true,
    },
    payroll_number: {
      type: String,
      required: true,
      comment: 'Auto-generate: PAY-[KODE_CABANG]-[YYYYMM]-[SIKLUS]. Contoh: PAY-JKT-202501-BLN',
    },
    period_start: {
      type: Date,
      required: [true, 'Tanggal awal periode wajib diisi'],
    },
    period_end: {
      type: Date,
      required: [true, 'Tanggal akhir periode wajib diisi'],
    },
    period_label: {
      type: String,
      comment: 'Label tampilan, misal: "Januari 2025" atau "Minggu 1 - Januari 2025"',
    },
    cycle_type: {
      type: String,
      required: true,
      enum: ['daily', 'weekly', 'monthly'],
      comment: 'Siklus pembayaran yang diproses dalam payroll ini',
    },
    status: {
      type: String,
      required: true,
      enum: ['draft', 'processing', 'reviewed', 'approved', 'paid', 'locked'],
      default: 'draft',
      index: true,
      comment: 'draft → processing → reviewed → approved → paid → locked',
    },
    // ---- Ringkasan Finansial ----
    total_employees: { type: Number, default: 0 },
    total_gross_amount: { type: Number, default: 0 },
    total_deductions: {
      type: Number,
      default: 0,
      comment: 'Total potongan (hanya piutang)',
    },
    total_net_amount: { type: Number, default: 0 },
    total_overtime_pay: { type: Number, default: 0 },
    total_bonus: { type: Number, default: 0 },
    // ---- Alur Persetujuan ----
    processed_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    processed_at: { type: Date, default: null },
    reviewed_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewed_at: { type: Date, default: null },
    approved_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approved_at: { type: Date, default: null },
    paid_at: { type: Date, default: null },
    paid_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // ---- Lock ----
    is_locked: {
      type: Boolean,
      default: false,
      comment: 'True = tidak dapat diubah. Hanya Admin yang bisa unlock dengan alasan',
    },
    locked_at: { type: Date, default: null },
    locked_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    unlock_history: [
      {
        unlocked_by: { type: Schema.Types.ObjectId, ref: 'User' },
        reason: { type: String },
        unlocked_at: { type: Date },
        _id: false,
      },
    ],
    notes: { type: String, trim: true, maxlength: 1000 },
    bank_export_url: {
      type: String,
      default: null,
      comment: 'URL file export format transfer bank (BCA/Mandiri/BRI)',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'payrolls',
  }
);

PayrollSchema.index({ company_id: 1, branch_id: 1, period_start: -1 });
PayrollSchema.index({ branch_id: 1, status: 1 });
PayrollSchema.index({ payroll_number: 1 }, { unique: true });

const Payroll = mongoose.model('Payroll', PayrollSchema);

/**
 * ============================================================
 * COLLECTION: payroll_details
 * Deskripsi : Rincian gaji per karyawan per payroll
 *             *** INTI KALKULASI PAYROLL ***
 * Relasi    : → payrolls, → employees, → salary_configs
 *             ← salary_slips, ← receivable_installments
 * ============================================================
 */
const PayrollDetailSchema = new Schema(
  {
    payroll_id: {
      type: Schema.Types.ObjectId,
      ref: 'Payroll',
      required: true,
      index: true,
    },
    employee_id: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    salary_config_id: {
      type: Schema.Types.ObjectId,
      ref: 'SalaryConfig',
      required: true,
      comment: 'Snapshot config gaji yang digunakan untuk payroll ini',
    },

    // ---- 9 Komponen Pendapatan ----
    base_salary: {
      type: Number,
      default: 0,
      comment: '1. Gaji Pokok',
    },
    tenure_allowance: {
      type: Number,
      default: 0,
      comment: '2. Tunjangan Lama Kerja',
    },
    position_allowance: {
      type: Number,
      default: 0,
      comment: '3. Tunjangan Jabatan',
    },
    performance_allowance: {
      type: Number,
      default: 0,
      comment: '4. Tunjangan Kinerja',
    },
    daily_pay: {
      type: Number,
      default: 0,
      comment: '5. Harian (daily_rate × present_days)',
    },
    meal_allowance: {
      type: Number,
      default: 0,
      comment: '6. Uang Makan (nominal × hari memenuhi syarat)',
    },
    fuel_allowance: {
      type: Number,
      default: 0,
      comment: '7. BBM',
    },
    overtime_pay: {
      type: Number,
      default: 0,
      comment: '8. Lembur (total_overtime_hours × rate_per_hour)',
    },
    bonus: {
      type: Number,
      default: 0,
      comment: '9. Bonus',
    },
    other_allowances: {
      type: Number,
      default: 0,
      comment: 'Tunjangan tambahan ad-hoc',
    },

    // ---- Kalkulasi Total ----
    gross_amount: {
      type: Number,
      default: 0,
      comment: 'Total sebelum potongan',
    },

    // ---- Potongan (HANYA Piutang) ----
    receivable_deduction: {
      type: Number,
      default: 0,
      comment: 'Total cicilan piutang yang dipotong dari gaji periode ini',
    },
    other_deductions: {
      type: Number,
      default: 0,
      comment: 'Potongan insidental lainnya',
    },

    net_amount: {
      type: Number,
      default: 0,
      comment: 'Gaji bersih = gross_amount - receivable_deduction - other_deductions',
    },

    // ---- Data Kehadiran ----
    working_days: {
      type: Number,
      default: 0,
      comment: 'Total hari kerja dalam periode',
    },
    present_days: {
      type: Number,
      default: 0,
    },
    absent_days: { type: Number, default: 0 },
    late_days: { type: Number, default: 0 },
    leave_days: { type: Number, default: 0 },
    total_overtime_hours: { type: Number, default: 0 },
    meal_eligible_days: {
      type: Number,
      default: 0,
      comment: 'Hari yang memenuhi syarat uang makan',
    },

    // ---- Prorata ----
    is_prorata: {
      type: Boolean,
      default: false,
      comment: 'True jika ada mutasi atau masuk/resign di tengah periode',
    },
    prorata_notes: {
      type: String,
      default: null,
      comment: 'Contoh: "14 hari × config Cabang JKT + 16 hari × config Cabang SBY"',
    },
    prorata_segments: [
      {
        branch_id: { type: Schema.Types.ObjectId, ref: 'Branch' },
        days: { type: Number },
        gross_amount: { type: Number },
        salary_config_id: { type: Schema.Types.ObjectId, ref: 'SalaryConfig' },
        _id: false,
      },
    ],

    payment_status: {
      type: String,
      enum: ['pending', 'paid', 'cancelled'],
      default: 'pending',
    },
    paid_at: { type: Date, default: null },
    notes: { type: String, trim: true, maxlength: 500 },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'payroll_details',
  }
);

PayrollDetailSchema.index({ payroll_id: 1, employee_id: 1 }, { unique: true });
PayrollDetailSchema.index({ employee_id: 1, created_at: -1 });

const PayrollDetail = mongoose.model('PayrollDetail', PayrollDetailSchema);

/**
 * ============================================================
 * COLLECTION: salary_slips
 * Deskripsi : Slip gaji PDF per karyawan per payroll
 * Relasi    : → payroll_details, → employees, → payrolls
 * ============================================================
 */
const SalarySlipSchema = new Schema(
  {
    payroll_id: {
      type: Schema.Types.ObjectId,
      ref: 'Payroll',
      required: true,
      index: true,
    },
    payroll_detail_id: {
      type: Schema.Types.ObjectId,
      ref: 'PayrollDetail',
      required: true,
    },
    employee_id: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    slip_number: {
      type: String,
      required: true,
      comment: 'Auto-generate: SLP-[employee_code]-[YYYYMM]-[SIKLUS]',
    },
    period_label: {
      type: String,
      comment: 'Label periode untuk tampilan di slip, misal: "Januari 2025"',
    },
    pdf_url: {
      type: String,
      required: true,
      comment: 'URL file PDF di MinIO/S3: payslips/[year]/[month]/[slip_number].pdf',
    },
    // ---- Status Pengiriman ----
    is_sent_telegram: { type: Boolean, default: false },
    telegram_sent_at: { type: Date, default: null },
    is_sent_email: { type: Boolean, default: false },
    email_sent_at: { type: Date, default: null },
    // ---- Metadata ----
    generated_at: { type: Date, default: Date.now },
    generated_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    collection: 'salary_slips',
  }
);

SalarySlipSchema.index({ employee_id: 1, generated_at: -1 });
SalarySlipSchema.index({ payroll_id: 1 });
SalarySlipSchema.index({ slip_number: 1 }, { unique: true });

const SalarySlip = mongoose.model('SalarySlip', SalarySlipSchema);

/**
 * ============================================================
 * COLLECTION: salary_components
 * Deskripsi : Master komponen gaji perusahaan
 *             Dapat dikustomisasi per perusahaan
 * Relasi    : → companies
 * ============================================================
 */
const SalaryComponentSchema = new Schema(
  {
    company_id: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      maxlength: 20,
      comment: 'GAJI_POKOK, TJ_JABATAN, UG_MAKAN, BBM, LEMBUR, BONUS, PO_PIUTANG, dll.',
    },
    type: {
      type: String,
      required: true,
      enum: ['allowance', 'deduction', 'earning'],
      comment: 'allowance=tunjangan, deduction=potongan, earning=pendapatan lain',
    },
    calculation_type: {
      type: String,
      required: true,
      enum: ['fixed', 'percentage', 'formula', 'attendance_based'],
    },
    default_value: { type: Number, default: 0 },
    formula: {
      type: String,
      default: null,
      comment: 'Formula kalkulasi jika calculation_type = formula',
    },
    is_always_shown: {
      type: Boolean,
      default: false,
      comment: 'Tampil di slip gaji meskipun nilainya 0',
    },
    display_order: {
      type: Number,
      default: 99,
      comment: 'Urutan tampilan di slip gaji',
    },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'salary_components',
  }
);

SalaryComponentSchema.index({ company_id: 1, code: 1 }, { unique: true });

const SalaryComponent = mongoose.model('SalaryComponent', SalaryComponentSchema);

/**
 * ============================================================
 * COLLECTION: financial_journals
 * Deskripsi : Jurnal akuntansi otomatis untuk payroll & piutang
 *             Setiap transaksi payroll/piutang menghasilkan
 *             entry debit/kredit
 * Relasi    : → companies, → payrolls, → receivables, → users
 * ============================================================
 */
const FinancialJournalSchema = new Schema(
  {
    company_id: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    payroll_id: {
      type: Schema.Types.ObjectId,
      ref: 'Payroll',
      default: null,
    },
    receivable_id: {
      type: Schema.Types.ObjectId,
      ref: 'Receivable',
      default: null,
    },
    journal_number: {
      type: String,
      required: true,
      comment: 'Auto-generate: JRN-[YYYYMM]-[URUT_5DIGIT]',
    },
    journal_date: {
      type: Date,
      required: true,
      index: true,
    },
    journal_type: {
      type: String,
      required: true,
      enum: [
        'payroll_expense',       // Beban gaji
        'receivable_disburse',   // Pencairan piutang
        'receivable_payment',    // Pembayaran cicilan
        'receivable_write_off',  // Penghapusan piutang
        'adjustment',            // Penyesuaian
      ],
    },
    debit_account: {
      type: String,
      required: true,
      comment: 'Kode akun debit, misal: "5100" (Beban Gaji)',
    },
    debit_account_name: { type: String },
    credit_account: {
      type: String,
      required: true,
      comment: 'Kode akun kredit, misal: "1100" (Kas/Bank)',
    },
    credit_account_name: { type: String },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    reference_number: {
      type: String,
      comment: 'Nomor referensi (payroll_number atau receivable_number)',
    },
    is_reversed: {
      type: Boolean,
      default: false,
      comment: 'True jika jurnal ini merupakan jurnal balik',
    },
    reversed_by_journal_id: {
      type: Schema.Types.ObjectId,
      ref: 'FinancialJournal',
      default: null,
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'financial_journals',
  }
);

FinancialJournalSchema.index({ company_id: 1, journal_date: -1 });
FinancialJournalSchema.index({ payroll_id: 1 });
FinancialJournalSchema.index({ receivable_id: 1 });
FinancialJournalSchema.index({ journal_number: 1 }, { unique: true });

const FinancialJournal = mongoose.model('FinancialJournal', FinancialJournalSchema);

module.exports = {
  Payroll,
  PayrollDetail,
  SalarySlip,
  SalaryComponent,
  FinancialJournal,
};
