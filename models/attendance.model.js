const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * ============================================================
 * COLLECTION: work_schedules
 * Deskripsi : Jadwal kerja / shift per cabang
 * Relasi    : → branches, ← attendances
 * ============================================================
 */
const WorkScheduleSchema = new Schema(
  {
    branch_id: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      comment: 'Misal: Shift Pagi, Jadwal Normal, Shift Malam',
    },
    shift_type: {
      type: String,
      required: true,
      enum: ['fixed', 'flexible', 'shift'],
      comment: 'fixed = jam tetap, flexible = jam fleksibel, shift = bergilir',
    },
    work_days: {
      type: [Number],
      required: true,
      comment: '0=Minggu, 1=Senin, 2=Selasa, 3=Rabu, 4=Kamis, 5=Jumat, 6=Sabtu',
    },
    check_in_time: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format waktu harus HH:MM'],
      comment: 'Format: "08:00"',
    },
    check_out_time: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format waktu harus HH:MM'],
      comment: 'Format: "17:00"',
    },
    break_start: {
      type: String,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format waktu harus HH:MM'],
      comment: 'Jam mulai istirahat, misal: "12:00"',
    },
    break_end: {
      type: String,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format waktu harus HH:MM'],
      comment: 'Jam selesai istirahat, misal: "13:00"',
    },
    late_tolerance_minutes: {
      type: Number,
      default: 0,
      min: 0,
      comment: 'Toleransi keterlambatan dalam menit sebelum dianggap terlambat',
    },
    min_work_hours: {
      type: Number,
      default: 8,
      min: 0,
      max: 24,
      comment: 'Minimum jam kerja untuk dianggap hadir penuh',
    },
    overtime_starts_after_hours: {
      type: Number,
      default: 8,
      comment: 'Lembur dihitung setelah N jam kerja',
    },
    is_active: { type: Boolean, default: true },
    is_default: {
      type: Boolean,
      default: false,
      comment: 'Jadwal default cabang — digunakan jika karyawan belum assign jadwal',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'work_schedules',
  }
);

WorkScheduleSchema.index({ branch_id: 1, is_active: 1 });

const WorkSchedule = mongoose.model('WorkSchedule', WorkScheduleSchema);

/**
 * ============================================================
 * COLLECTION: holidays
 * Deskripsi : Hari libur nasional dan libur per cabang
 * Relasi    : → companies, → branches (null = semua cabang)
 * ============================================================
 */
const HolidaySchema = new Schema(
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
      default: null,
      comment: 'Null = berlaku untuk semua cabang',
    },
    name: {
      type: String,
      required: true,
      trim: true,
      comment: 'Misal: Hari Raya Idul Fitri, HUT RI, Libur Khusus Cabang JKT',
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['national', 'branch', 'company'],
      comment: 'national = libur nasional, branch = khusus cabang, company = libur perusahaan',
    },
    is_recurring: {
      type: Boolean,
      default: false,
      comment: 'Jika true, berlaku setiap tahun di tanggal yang sama',
    },
    is_paid: {
      type: Boolean,
      default: true,
      comment: 'Apakah hari libur ini tetap dibayar',
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'holidays',
  }
);

HolidaySchema.index({ company_id: 1, date: 1 });
HolidaySchema.index({ branch_id: 1, date: 1 });

const Holiday = mongoose.model('Holiday', HolidaySchema);

/**
 * ============================================================
 * COLLECTION: attendances
 * Deskripsi : Data absensi harian per karyawan
 *             Mendukung 4 metode: QR Code, Button, Manual, Face
 * Relasi    : → employees, → branches, → work_schedules,
 *             → users (verified_by)
 *             ← attendance_recaps, ← overtime_requests
 * ============================================================
 */
const AttendanceSchema = new Schema(
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
    schedule_id: {
      type: Schema.Types.ObjectId,
      ref: 'WorkSchedule',
      default: null,
    },
    date: {
      type: Date,
      required: true,
      index: true,
      comment: 'Tanggal absensi (time set 00:00:00 UTC)',
    },

    // ---- Check In ----
    check_in_time: { type: Date, default: null },
    check_in_method: {
      type: String,
      enum: ['QR', 'Button', 'Manual', 'Face', null],
      default: null,
      comment: 'QR=QR Code, Button=Checklist, Manual=Input Manual+Foto, Face=Face Recognition',
    },
    check_in_photo_url: {
      type: String,
      default: null,
      comment: 'Wajib untuk metode Manual dan Face. Tersimpan di MinIO/S3',
    },
    check_in_photo_timestamp: {
      type: Date,
      default: null,
      comment: 'Timestamp watermark pada foto (dari client)',
    },
    check_in_lat: { type: Number, default: null },
    check_in_lng: { type: Number, default: null },
    check_in_geofence_valid: {
      type: Boolean,
      default: null,
      comment: 'Apakah check-in dalam radius geo-fencing cabang',
    },

    // ---- Check Out ----
    check_out_time: { type: Date, default: null },
    check_out_method: {
      type: String,
      enum: ['QR', 'Button', 'Manual', 'Face', null],
      default: null,
    },
    check_out_photo_url: { type: String, default: null },
    check_out_lat: { type: Number, default: null },
    check_out_lng: { type: Number, default: null },

    // ---- Kalkulasi & Status ----
    status: {
      type: String,
      required: true,
      enum: ['Hadir', 'Izin', 'Sakit', 'Alpa', 'Terlambat', 'Libur', 'Pending'],
      default: 'Pending',
      index: true,
    },
    late_minutes: {
      type: Number,
      default: 0,
      min: 0,
      comment: 'Jumlah menit keterlambatan',
    },
    work_hours: {
      type: Number,
      default: 0,
      min: 0,
      comment: 'Total jam kerja aktual (check_out - check_in - break)',
    },
    overtime_hours: {
      type: Number,
      default: 0,
      min: 0,
    },
    is_meal_allowance_eligible: {
      type: Boolean,
      default: false,
      comment: 'Dihitung berdasarkan aturan uang makan cabang',
    },

    // ---- Manual Entry (Metode 3) ----
    manual_reason: {
      type: String,
      trim: true,
      maxlength: 1000,
      comment: 'Wajib diisi untuk metode Manual',
    },
    manual_status: {
      type: String,
      enum: ['pending_verification', 'verified', 'rejected', null],
      default: null,
    },
    verified_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verified_at: { type: Date, default: null },
    rejection_reason: { type: String, trim: true, default: null },

    notes: { type: String, trim: true, maxlength: 500 },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'attendances',
  }
);

// Compound index: 1 karyawan 1 record per tanggal per cabang
AttendanceSchema.index({ employee_id: 1, date: 1, branch_id: 1 }, { unique: true });
AttendanceSchema.index({ branch_id: 1, date: -1 });
AttendanceSchema.index({ branch_id: 1, status: 1, date: -1 });
AttendanceSchema.index({ manual_status: 1, branch_id: 1 }); // Untuk antrian verifikasi

const Attendance = mongoose.model('Attendance', AttendanceSchema);

/**
 * ============================================================
 * COLLECTION: attendance_recaps
 * Deskripsi : Rekap kehadiran bulanan per karyawan
 *             Di-generate otomatis oleh Cron Job
 *             (tanggal 1 setiap bulan pukul 01:00)
 * Relasi    : → employees, → branches
 * ============================================================
 */
const AttendanceRecapSchema = new Schema(
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
    period_year: {
      type: Number,
      required: true,
      comment: 'Tahun periode, misal: 2025',
    },
    period_month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
      comment: 'Bulan periode (1-12)',
    },
    period_label: {
      type: String,
      comment: 'Label tampilan, misal: "Januari 2025"',
    },
    // ---- Statistik Kehadiran ----
    total_work_days: {
      type: Number,
      default: 0,
      comment: 'Total hari kerja dalam periode (tidak termasuk libur)',
    },
    present_days: { type: Number, default: 0 },
    late_days: {
      type: Number,
      default: 0,
      comment: 'Hari hadir namun terlambat',
    },
    total_late_minutes: {
      type: Number,
      default: 0,
      comment: 'Akumulasi menit keterlambatan',
    },
    permit_days: { type: Number, default: 0, comment: 'Hari Izin' },
    sick_days: { type: Number, default: 0, comment: 'Hari Sakit' },
    alpha_days: { type: Number, default: 0, comment: 'Hari Alpa (tanpa keterangan)' },
    holiday_days: { type: Number, default: 0 },
    // ---- Lembur ----
    total_overtime_hours: { type: Number, default: 0 },
    total_overtime_pay: { type: Number, default: 0 },
    // ---- Persentase ----
    attendance_percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      comment: '(present_days / total_work_days) × 100',
    },
    // ---- Meta ----
    generated_at: { type: Date, default: Date.now },
    is_finalized: {
      type: Boolean,
      default: false,
      comment: 'True jika sudah digunakan untuk payroll bulan itu',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'attendance_recaps',
  }
);

AttendanceRecapSchema.index(
  { employee_id: 1, period_year: 1, period_month: 1 },
  { unique: true }
);
AttendanceRecapSchema.index({ branch_id: 1, period_year: 1, period_month: 1 });

const AttendanceRecap = mongoose.model('AttendanceRecap', AttendanceRecapSchema);

module.exports = { WorkSchedule, Holiday, Attendance, AttendanceRecap };
