const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * ============================================================
 * COLLECTION: leave_types
 * Deskripsi : Jenis cuti yang tersedia
 * Relasi    : → companies, ← leave_requests, ← leave_balances
 * ============================================================
 */
const LeaveTypeSchema = new Schema(
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
      comment: 'Misal: Cuti Tahunan, Cuti Sakit, Cuti Melahirkan, Izin',
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      maxlength: 10,
      comment: 'CT = Cuti Tahunan, CS = Sakit, CM = Melahirkan, IZN = Izin',
    },
    max_days_per_year: {
      type: Number,
      default: 0,
      min: 0,
      comment: '0 = tidak dibatasi',
    },
    max_consecutive_days: {
      type: Number,
      default: 0,
      comment: 'Batas maksimum hari berturut-turut, 0 = tidak dibatasi',
    },
    requires_document: {
      type: Boolean,
      default: false,
      comment: 'Cuti sakit wajib lampirkan surat dokter',
    },
    is_paid: {
      type: Boolean,
      default: true,
      comment: 'Apakah cuti ini tetap dibayar penuh',
    },
    applicable_status: {
      type: [String],
      default: ['KT', 'KL', 'Magang'],
      comment: 'Status karyawan yang berhak atas jenis cuti ini',
    },
    min_tenure_months: {
      type: Number,
      default: 0,
      comment: 'Minimal masa kerja (bulan) untuk berhak atas cuti ini',
    },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'leave_types',
  }
);

LeaveTypeSchema.index({ company_id: 1, code: 1 }, { unique: true });

const LeaveType = mongoose.model('LeaveType', LeaveTypeSchema);

/**
 * ============================================================
 * COLLECTION: leave_requests
 * Deskripsi : Pengajuan cuti karyawan dengan approval workflow
 * Relasi    : → employees, → branches, → leave_types,
 *             → users (approved_by)
 * ============================================================
 */

// Sub-schema: riwayat approval bertingkat
const ApprovalStepSchema = new Schema(
  {
    level: { type: Number },
    approver_role: { type: String },
    approver_id: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'] },
    notes: { type: String },
    acted_at: { type: Date },
  },
  { _id: false }
);

const LeaveRequestSchema = new Schema(
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
    leave_type_id: {
      type: Schema.Types.ObjectId,
      ref: 'LeaveType',
      required: true,
    },
    request_number: {
      type: String,
      required: true,
      comment: 'Auto-generate: CUT-[YYYY]-[URUT_4DIGIT]',
    },
    start_date: {
      type: Date,
      required: [true, 'Tanggal mulai cuti wajib diisi'],
    },
    end_date: {
      type: Date,
      required: [true, 'Tanggal selesai cuti wajib diisi'],
    },
    total_days: {
      type: Number,
      required: true,
      min: 1,
      comment: 'Jumlah hari kerja (tidak termasuk hari libur)',
    },
    reason: {
      type: String,
      required: [true, 'Alasan cuti wajib diisi'],
      trim: true,
      maxlength: 1000,
    },
    document_url: {
      type: String,
      default: null,
      comment: 'Dokumen pendukung (surat dokter untuk cuti sakit)',
    },
    substitute_employee_id: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
      comment: 'Karyawan pengganti selama cuti',
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
      index: true,
    },
    approval_steps: {
      type: [ApprovalStepSchema],
      default: [],
    },
    approved_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approved_at: { type: Date, default: null },
    rejection_reason: { type: String, trim: true, default: null },
    cancelled_at: { type: Date, default: null },
    cancelled_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'leave_requests',
  }
);

LeaveRequestSchema.index({ employee_id: 1, status: 1 });
LeaveRequestSchema.index({ branch_id: 1, status: 1, start_date: -1 });
LeaveRequestSchema.index({ start_date: 1, end_date: 1 });

const LeaveRequest = mongoose.model('LeaveRequest', LeaveRequestSchema);

/**
 * ============================================================
 * COLLECTION: overtime_settings
 * Deskripsi : Konfigurasi lembur per cabang
 *             Setiap cabang bisa punya aturan lembur yang berbeda
 * Relasi    : → branches
 * ============================================================
 */
const OvertimeSettingSchema = new Schema(
  {
    branch_id: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
      unique: true,
      comment: 'Satu dokumen per cabang (upsert)',
    },
    rate_per_hour: {
      type: Number,
      required: true,
      min: 0,
      comment: 'Tarif lembur per jam dalam rupiah',
    },
    rate_weekday_multiplier: {
      type: Number,
      default: 1.0,
      comment: 'Multiplier untuk hari kerja biasa',
    },
    rate_weekend_multiplier: {
      type: Number,
      default: 2.0,
      comment: 'Multiplier untuk hari Sabtu/Minggu',
    },
    rate_holiday_multiplier: {
      type: Number,
      default: 3.0,
      comment: 'Multiplier untuk hari libur nasional',
    },
    max_hours_per_day: {
      type: Number,
      default: 4,
      min: 0,
      max: 16,
    },
    max_hours_per_month: {
      type: Number,
      default: 40,
      min: 0,
    },
    eligible_days: {
      type: [Number],
      default: [0, 1, 2, 3, 4, 5, 6],
      comment: '0=Minggu, 1=Senin, ..., 6=Sabtu',
    },
    requires_approval: { type: Boolean, default: true },
    min_overtime_minutes: {
      type: Number,
      default: 30,
      comment: 'Minimum menit lembur yang dihitung',
    },
    round_to_minutes: {
      type: Number,
      default: 30,
      comment: 'Pembulatan perhitungan lembur ke N menit',
    },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'overtime_settings',
  }
);

const OvertimeSetting = mongoose.model('OvertimeSetting', OvertimeSettingSchema);

/**
 * ============================================================
 * COLLECTION: overtime_requests
 * Deskripsi : Pengajuan lembur karyawan
 * Relasi    : → employees, → attendances, → users (approved_by)
 * ============================================================
 */
const OvertimeRequestSchema = new Schema(
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
    attendance_id: {
      type: Schema.Types.ObjectId,
      ref: 'Attendance',
      default: null,
      comment: 'Referensi ke absensi hari tersebut',
    },
    overtime_date: {
      type: Date,
      required: true,
      index: true,
    },
    hours_requested: {
      type: Number,
      required: true,
      min: 0.5,
      comment: 'Jumlah jam lembur yang diajukan',
    },
    hours_actual: {
      type: Number,
      default: null,
      comment: 'Jam aktual setelah diverifikasi',
    },
    overtime_pay: {
      type: Number,
      default: 0,
      comment: 'Nominal lembur yang akan dibayarkan',
    },
    reason: {
      type: String,
      required: [true, 'Alasan lembur wajib diisi'],
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
      index: true,
    },
    approved_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approved_at: { type: Date, default: null },
    rejection_reason: { type: String, default: null },
    is_included_in_payroll: {
      type: Boolean,
      default: false,
      comment: 'True setelah lembur dimasukkan ke payroll',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'overtime_requests',
  }
);

OvertimeRequestSchema.index({ employee_id: 1, overtime_date: -1 });
OvertimeRequestSchema.index({ branch_id: 1, status: 1 });

const OvertimeRequest = mongoose.model('OvertimeRequest', OvertimeRequestSchema);

module.exports = { LeaveType, LeaveRequest, OvertimeSetting, OvertimeRequest };
