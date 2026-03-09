const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * ============================================================
 * COLLECTION: branches
 * Deskripsi : Data cabang dengan aturan geo-fencing,
 *             uang makan, dan lembur per cabang
 * Relasi    : → companies, ← employees, ← work_schedules
 * ============================================================
 */

// Sub-schema: Aturan Uang Makan
const MealAllowanceRuleSchema = new Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: [0, 'Nominal uang makan tidak boleh negatif'],
    },
    min_work_hours: {
      type: Number,
      required: true,
      min: 0,
      max: 24,
      comment: 'Minimum jam kerja agar dapat uang makan',
    },
    late_tolerance_minutes: {
      type: Number,
      default: 0,
      min: 0,
      comment: 'Batas toleransi keterlambatan (menit) agar tetap dapat uang makan',
    },
  },
  { _id: false }
);

// Sub-schema: Pengaturan Lembur Cabang
const OvertimeRuleSchema = new Schema(
  {
    rate_per_hour: {
      type: Number,
      required: true,
      min: 0,
      comment: 'Tarif lembur per jam dalam rupiah',
    },
    max_hours_per_day: {
      type: Number,
      default: 4,
      min: 0,
      max: 24,
    },
    max_hours_per_month: {
      type: Number,
      default: 40,
      min: 0,
    },
    eligible_days: {
      type: [Number],
      default: [1, 2, 3, 4, 5, 6, 0],
      comment: '0=Minggu, 1=Senin, ..., 6=Sabtu',
    },
    requires_approval: { type: Boolean, default: true },
  },
  { _id: false }
);

const BranchSchema = new Schema(
  {
    company_id: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'company_id wajib diisi'],
      index: true,
    },
    branch_code: {
      type: String,
      required: [true, 'Kode cabang wajib diisi'],
      uppercase: true,
      trim: true,
      maxlength: 10,
      comment: 'Contoh: JKT, SBY, MDN — digunakan dalam Employee Code',
    },
    name: {
      type: String,
      required: [true, 'Nama cabang wajib diisi'],
      trim: true,
      maxlength: 150,
    },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    province: { type: String, trim: true },
    phone: { type: String, trim: true, maxlength: 20 },
    email: { type: String, trim: true, lowercase: true },
    pic_name: {
      type: String,
      trim: true,
      comment: 'Person in Charge cabang',
    },
    latitude: {
      type: Number,
      min: -90,
      max: 90,
      comment: 'Koordinat GPS — pusat geo-fencing absensi',
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180,
    },
    geofence_radius: {
      type: Number,
      default: 100,
      min: 10,
      comment: 'Radius geo-fencing dalam meter',
    },
    geofence_enabled: {
      type: Boolean,
      default: true,
    },
    meal_allowance_rule: {
      type: MealAllowanceRuleSchema,
      default: () => ({ amount: 0, min_work_hours: 8, late_tolerance_minutes: 0 }),
    },
    overtime_rule: {
      type: OvertimeRuleSchema,
      default: () => ({ rate_per_hour: 0, max_hours_per_day: 4, max_hours_per_month: 40 }),
    },
    max_employee_capacity: {
      type: Number,
      default: 0,
      comment: '0 = tidak dibatasi',
    },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'branches',
  }
);

BranchSchema.index({ company_id: 1, branch_code: 1 }, { unique: true });
BranchSchema.index({ company_id: 1, is_active: 1 });

module.exports = mongoose.model('Branch', BranchSchema);
