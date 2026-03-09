const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * ============================================================
 * COLLECTION: employee_documents
 * Deskripsi : File dokumen karyawan (KTP, ijazah, NPWP, dll.)
 * Relasi    : → employees, → users (uploader)
 * ============================================================
 */
const EmployeeDocumentSchema = new Schema(
  {
    employee_id: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    doc_type: {
      type: String,
      required: true,
      enum: [
        'ktp',         // KTP
        'kk',          // Kartu Keluarga
        'npwp',        // NPWP
        'ijazah',      // Ijazah terakhir
        'skck',        // SKCK
        'cv',          // Curriculum Vitae
        'foto',        // Foto formal
        'bpjs_kes',    // Kartu BPJS Kesehatan
        'bpjs_tk',     // Kartu BPJS Ketenagakerjaan
        'kontrak',     // Kontrak kerja
        'sertifikat',  // Sertifikat keahlian
        'other',       // Lainnya
      ],
    },
    doc_name: {
      type: String,
      required: true,
      trim: true,
      comment: 'Label tampilan, misal: "KTP - Budi Santoso"',
    },
    file_url: {
      type: String,
      required: true,
      comment: 'URL file di MinIO/S3',
    },
    file_type: {
      type: String,
      enum: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
    },
    file_size_kb: { type: Number },
    notes: { type: String, trim: true, maxlength: 300 },
    uploaded_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    uploaded_at: { type: Date, default: Date.now },
  },
  { collection: 'employee_documents' }
);

EmployeeDocumentSchema.index({ employee_id: 1, doc_type: 1 });

const EmployeeDocument = mongoose.model('EmployeeDocument', EmployeeDocumentSchema);

/**
 * ============================================================
 * COLLECTION: salary_configs
 * Deskripsi : Konfigurasi komponen gaji per karyawan
 *             Bersifat historis — setiap update gaji = record baru
 * Relasi    : → employees, → users (creator)
 *             ← payroll_details
 * ============================================================
 */
const SalaryConfigSchema = new Schema(
  {
    employee_id: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    // ---- 9 Komponen Gaji ----
    base_salary: {
      type: Number,
      required: [true, 'Gaji pokok wajib diisi'],
      min: [0, 'Gaji pokok tidak boleh negatif'],
      comment: '1. Gaji Pokok',
    },
    tenure_allowance: {
      type: Number,
      default: 0,
      min: 0,
      comment: '2. Tunjangan Lama Kerja',
    },
    position_allowance: {
      type: Number,
      default: 0,
      min: 0,
      comment: '3. Tunjangan Jabatan',
    },
    performance_allowance: {
      type: Number,
      default: 0,
      min: 0,
      comment: '4. Tunjangan Kinerja',
    },
    daily_rate: {
      type: Number,
      default: 0,
      min: 0,
      comment: '5. Harian — tarif per hari untuk KL/Magang atau payment_cycle=daily',
    },
    meal_allowance: {
      type: Number,
      default: 0,
      min: 0,
      comment: '6. Uang Makan — nominal per hari (syarat mengikuti aturan cabang)',
    },
    fuel_allowance: {
      type: Number,
      default: 0,
      min: 0,
      comment: '7. BBM — tunjangan bahan bakar per bulan',
    },
    overtime_rate_per_hour: {
      type: Number,
      default: 0,
      min: 0,
      comment: '8. Lembur — override tarif lembur cabang jika diisi > 0',
    },
    bonus: {
      type: Number,
      default: 0,
      min: 0,
      comment: '9. Bonus — bonus tetap per periode (bisa 0)',
    },
    // ---- Metadata ----
    effective_date: {
      type: Date,
      required: true,
      comment: 'Tanggal mulai berlaku konfigurasi ini',
    },
    end_date: {
      type: Date,
      default: null,
      comment: 'Diisi saat ada update gaji baru (record lama di-close)',
    },
    is_current: {
      type: Boolean,
      default: true,
      comment: 'Hanya satu record yang is_current=true per karyawan',
    },
    notes: { type: String, trim: true, maxlength: 500 },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'salary_configs',
  }
);

SalaryConfigSchema.index({ employee_id: 1, is_current: 1 });
SalaryConfigSchema.index({ employee_id: 1, effective_date: -1 });

const SalaryConfig = mongoose.model('SalaryConfig', SalaryConfigSchema);

/**
 * ============================================================
 * COLLECTION: salary_levels
 * Deskripsi : Tingkatan/grade gaji per jabatan (master data)
 * Relasi    : → companies, ← positions
 * ============================================================
 */
const SalaryLevelSchema = new Schema(
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
      comment: 'Misal: Level A, Level B, Grade 1, Grade Supervisor',
    },
    grade: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      maxlength: 5,
      comment: 'Kode grade: A, B, C, 1, 2, 3, dst.',
    },
    min_salary: { type: Number, required: true, min: 0 },
    max_salary: { type: Number, required: true, min: 0 },
    // Komponen default untuk grade ini — dapat di-override di salary_configs per karyawan
    default_components: {
      tenure_allowance: { type: Number, default: 0 },
      position_allowance: { type: Number, default: 0 },
      performance_allowance: { type: Number, default: 0 },
      meal_allowance: { type: Number, default: 0 },
      fuel_allowance: { type: Number, default: 0 },
    },
    description: { type: String, trim: true, maxlength: 500 },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'salary_levels',
  }
);

SalaryLevelSchema.index({ company_id: 1, grade: 1 }, { unique: true });

const SalaryLevel = mongoose.model('SalaryLevel', SalaryLevelSchema);

/**
 * ============================================================
 * COLLECTION: salary_histories
 * Deskripsi : Riwayat perubahan gaji karyawan (audit kenaikan)
 * Relasi    : → employees, → users (approved_by)
 * ============================================================
 */
const SalaryHistorySchema = new Schema(
  {
    employee_id: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    old_salary_config_id: {
      type: Schema.Types.ObjectId,
      ref: 'SalaryConfig',
      default: null,
    },
    new_salary_config_id: {
      type: Schema.Types.ObjectId,
      ref: 'SalaryConfig',
      required: true,
    },
    old_base_salary: { type: Number, required: true },
    new_base_salary: { type: Number, required: true },
    change_amount: {
      type: Number,
      comment: 'new_base_salary - old_base_salary (bisa negatif)',
    },
    change_percentage: {
      type: Number,
      comment: 'Persentase kenaikan/penurunan',
    },
    change_type: {
      type: String,
      required: true,
      enum: [
        'initial',    // Konfigurasi pertama kali
        'raise',      // Kenaikan gaji
        'adjustment', // Penyesuaian
        'demotion',   // Penurunan
        'promotion',  // Promosi jabatan
      ],
    },
    effective_date: { type: Date, required: true },
    reason: { type: String, trim: true, maxlength: 1000 },
    approved_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'salary_histories',
  }
);

SalaryHistorySchema.index({ employee_id: 1, effective_date: -1 });

const SalaryHistory = mongoose.model('SalaryHistory', SalaryHistorySchema);

/**
 * ============================================================
 * COLLECTION: mutation_histories
 * Deskripsi : Riwayat mutasi karyawan antar cabang/jabatan
 *             *** KRITIS UNTUK PERHITUNGAN PRORATA PAYROLL ***
 *             Cron Job membaca tabel ini untuk split kalkulasi gaji
 * Relasi    : → employees, → branches (from/to),
 *             → departments (from/to), → positions (from/to),
 *             → users (approved_by)
 * ============================================================
 */
const MutationHistorySchema = new Schema(
  {
    employee_id: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    mutation_number: {
      type: String,
      required: true,
      comment: 'Nomor surat mutasi — auto-generate',
    },
    mutation_type: {
      type: String,
      required: true,
      enum: [
        'branch_transfer',      // Pindah cabang
        'position_change',      // Ganti jabatan
        'department_change',    // Ganti departemen
        'branch_and_position',  // Pindah cabang sekaligus ganti jabatan
      ],
    },
    // ---- Data Sebelum Mutasi ----
    from_branch_id: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    from_department_id: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    from_position_id: {
      type: Schema.Types.ObjectId,
      ref: 'Position',
      required: true,
    },
    from_salary_config_id: {
      type: Schema.Types.ObjectId,
      ref: 'SalaryConfig',
      comment: 'Snapshot konfigurasi gaji cabang asal',
    },
    // ---- Data Setelah Mutasi ----
    to_branch_id: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    to_department_id: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    to_position_id: {
      type: Schema.Types.ObjectId,
      ref: 'Position',
      required: true,
    },
    // ---- Prorata Tracking ----
    effective_date: {
      type: Date,
      required: [true, 'Tanggal efektif mutasi wajib diisi'],
      comment: '*** DIGUNAKAN CRON JOB untuk kalkulasi prorata payroll ***',
      index: true,
    },
    prorata_processed: {
      type: Boolean,
      default: false,
      comment: 'Diset true setelah Cron Job memproses prorata bulan ini',
    },
    prorata_processed_at: { type: Date, default: null },
    // ---- Dokumen & Persetujuan ----
    reason: { type: String, trim: true, maxlength: 1000 },
    mutation_letter_url: {
      type: String,
      comment: 'URL PDF surat mutasi yang ter-generate',
    },
    approved_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approved_at: { type: Date },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'mutation_histories',
  }
);

MutationHistorySchema.index({ employee_id: 1, effective_date: -1 });
MutationHistorySchema.index({ effective_date: 1, prorata_processed: 1 });

const MutationHistory = mongoose.model('MutationHistory', MutationHistorySchema);

module.exports = {
  EmployeeDocument,
  SalaryConfig,
  SalaryLevel,
  SalaryHistory,
  MutationHistory,
};
