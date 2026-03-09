const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * ============================================================
 * COLLECTION: employees
 * Deskripsi : ENTITAS PUSAT — Data lengkap karyawan
 * Relasi    : → companies, → branches, → departments,
 *             → positions
 *             ← salary_configs, ← attendances,
 *             ← payroll_details, ← receivables,
 *             ← mutation_histories, ← leave_requests
 * ============================================================
 */

// Sub-schema: Kontak Darurat
const EmergencyContactSchema = new Schema(
  {
    name: { type: String, trim: true },
    relationship: { type: String, trim: true, comment: 'Hubungan: Istri, Suami, Orang Tua, dll.' },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
  },
  { _id: false }
);

// Sub-schema: Data Rekening Bank
const BankAccountSchema = new Schema(
  {
    bank_name: { type: String, trim: true, comment: 'BCA, Mandiri, BRI, BNI, dll.' },
    account_number: { type: String, trim: true, comment: 'Dienkripsi di level aplikasi (AES-256)' },
    account_holder_name: { type: String, trim: true },
    branch_name: { type: String, trim: true },
  },
  { _id: false }
);

const EmployeeSchema = new Schema(
  {
    // ---- Identitas Perusahaan ----
    company_id: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    branch_id: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'branch_id wajib diisi'],
      index: true,
    },
    department_id: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'department_id wajib diisi'],
    },
    position_id: {
      type: Schema.Types.ObjectId,
      ref: 'Position',
      required: [true, 'position_id wajib diisi'],
    },

    // ---- Identifikasi Karyawan ----
    employee_code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      comment: 'Auto-generated: [KODE_CABANG]-[STATUS]-[URUT_4DIGIT]. Contoh: JKT-KT-0001',
    },
    qr_code_data: {
      type: String,
      comment: 'Data yang di-encode ke QR Code (employee_code + checksum)',
    },
    qr_code_url: {
      type: String,
      comment: 'URL file PNG QR Code yang tersimpan di MinIO/S3',
    },

    // ---- Data Pribadi ----
    full_name: {
      type: String,
      required: [true, 'Nama lengkap wajib diisi'],
      trim: true,
      maxlength: 150,
    },
    nik: {
      type: String,
      required: [true, 'NIK wajib diisi'],
      trim: true,
      minlength: 16,
      maxlength: 16,
      comment: 'Nomor Induk Kependudukan — dienkripsi di level aplikasi',
    },
    gender: {
      type: String,
      enum: ['L', 'P'],
      required: true,
      comment: 'L = Laki-laki, P = Perempuan',
    },
    birth_place: { type: String, trim: true },
    birth_date: {
      type: Date,
      required: [true, 'Tanggal lahir wajib diisi'],
    },
    religion: {
      type: String,
      enum: ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Lainnya'],
    },
    marital_status: {
      type: String,
      enum: ['Belum Menikah', 'Menikah', 'Cerai'],
      default: 'Belum Menikah',
    },
    blood_type: {
      type: String,
      enum: ['A', 'B', 'AB', 'O', '-'],
      default: '-',
    },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    province: { type: String, trim: true },
    postal_code: { type: String, trim: true, maxlength: 10 },
    phone: {
      type: String,
      required: [true, 'Nomor telepon wajib diisi'],
      trim: true,
      maxlength: 20,
    },
    email: { type: String, trim: true, lowercase: true },
    photo_url: {
      type: String,
      comment: 'URL foto profil karyawan di MinIO/S3',
    },

    // ---- Status & Kepegawaian ----
    status: {
      type: String,
      required: true,
      enum: {
        values: ['KT', 'KL', 'Magang'],
        message: 'Status harus KT (Karyawan Tetap), KL (Karyawan Luar/Lepas), atau Magang',
      },
      comment: 'KT = Karyawan Tetap, KL = Karyawan Luar/Lepas, Magang',
    },
    payment_cycle: {
      type: String,
      required: true,
      enum: {
        values: ['daily', 'weekly', 'monthly'],
        message: 'Siklus gaji harus daily, weekly, atau monthly',
      },
      comment: 'Siklus pembayaran gaji: harian, mingguan, bulanan',
    },
    join_date: {
      type: Date,
      required: [true, 'Tanggal bergabung wajib diisi'],
    },
    contract_start: { type: Date },
    contract_end: {
      type: Date,
      comment: 'Null untuk KT (tidak ada tanggal berakhir)',
    },
    probation_start: { type: Date },
    probation_end: {
      type: Date,
      comment: 'Masa percobaan — sistem akan notifikasi H-7 sebelum berakhir',
    },
    resign_date: { type: Date, default: null },
    resign_reason: { type: String, trim: true, maxlength: 1000 },

    // ---- Data Pendidikan & Keuangan ----
    last_education: {
      type: String,
      enum: ['SD', 'SMP', 'SMA/SMK', 'D1', 'D2', 'D3', 'S1', 'S2', 'S3'],
    },
    bank_account: {
      type: BankAccountSchema,
      comment: 'Nomor rekening bank untuk transfer gaji',
    },
    emergency_contact: { type: EmergencyContactSchema },

    // ---- Face Recognition ----
    face_encoding: {
      type: String,
      default: null,
      select: false,
      comment: 'Encoded face data (base64) — digunakan untuk pencocokan absensi wajah. select:false',
    },
    face_registered_at: { type: Date, default: null },

    // ---- Status Aktif ----
    is_active: { type: Boolean, default: true, index: true },
    deactivated_at: { type: Date, default: null },
    deactivated_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: { type: String, trim: true, maxlength: 1000 },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'employees',
  }
);

// ---- Indexes ----
EmployeeSchema.index({ company_id: 1, employee_code: 1 }, { unique: true });
EmployeeSchema.index({ company_id: 1, nik: 1 }, { unique: true });
EmployeeSchema.index({ company_id: 1, branch_id: 1, is_active: 1 });
EmployeeSchema.index({ company_id: 1, department_id: 1 });
EmployeeSchema.index({ company_id: 1, status: 1, is_active: 1 });
EmployeeSchema.index({ full_name: 'text', employee_code: 'text' }); // Full-text search

// ---- Virtual: Usia ----
EmployeeSchema.virtual('age').get(function () {
  if (!this.birth_date) return null;
  const today = new Date();
  const birth = new Date(this.birth_date);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
});

// ---- Virtual: Masa Kerja (tahun) ----
EmployeeSchema.virtual('work_tenure_years').get(function () {
  if (!this.join_date) return 0;
  const today = new Date();
  const joined = new Date(this.join_date);
  return Math.floor((today - joined) / (1000 * 60 * 60 * 24 * 365));
});

EmployeeSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Employee', EmployeeSchema);
