const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * ============================================================
 * COLLECTION: roles
 * Deskripsi : Role pengguna dan daftar permissions (RBAC)
 * Relasi    : → companies, ← users, ← approval_flows
 * ============================================================
 */
const RoleSchema = new Schema(
  {
    company_id: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Nama role wajib diisi'],
      trim: true,
      maxlength: 50,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      enum: [
        'admin',
        'manager_hrd',
        'kepala_cabang',
        'staff_admin',
        'kasir',
      ],
      comment: 'Identifier unik role — dipakai di middleware RBAC',
    },
    // Format permission: 'module:action'
    // Contoh: 'employees:read', 'payroll:approve', 'receivables:create'
    permissions: {
      type: [String],
      default: [],
      comment: 'Array permission dalam format "module:action"',
    },
    description: { type: String, trim: true, maxlength: 500 },
    is_system_role: {
      type: Boolean,
      default: false,
      comment: 'true = tidak dapat dihapus, hanya admin yang dapat edit',
    },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'roles',
  }
);

RoleSchema.index({ company_id: 1, slug: 1 }, { unique: true });

const Role = mongoose.model('Role', RoleSchema);

/**
 * ============================================================
 * COLLECTION: users
 * Deskripsi : Akun pengguna sistem — terhubung ke karyawan
 * Relasi    : → companies, → employees, → roles, → branches
 * ============================================================
 */

// Sub-schema: Riwayat Login
const LoginHistorySchema = new Schema(
  {
    ip_address: { type: String },
    user_agent: { type: String },
    logged_in_at: { type: Date, default: Date.now },
    is_success: { type: Boolean, default: true },
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    company_id: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    employee_id: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
      comment: 'Null jika user adalah superadmin sistem',
    },
    branch_id: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
      comment: 'Null untuk admin & manager_hrd (akses semua cabang)',
    },
    role_id: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: [true, 'role_id wajib diisi'],
    },
    username: {
      type: String,
      required: [true, 'Username wajib diisi'],
      trim: true,
      lowercase: true,
      minlength: 4,
      maxlength: 30,
      match: [/^[a-z0-9_]+$/, 'Username hanya boleh huruf kecil, angka, dan underscore'],
    },
    email: {
      type: String,
      required: [true, 'Email wajib diisi'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Format email tidak valid'],
    },
    password_hash: {
      type: String,
      required: true,
      select: false,
      comment: 'bcrypt hash — select:false agar tidak ikut di query biasa',
    },
    // ---- 2FA (TOTP - Google Authenticator) ----
    twofa_enabled: { type: Boolean, default: false },
    twofa_secret: {
      type: String,
      select: false,
      comment: 'Encrypted TOTP secret — speakeasy library',
    },
    twofa_backup_codes: {
      type: [String],
      select: false,
      comment: 'Hashed backup codes (10 kode sekali pakai)',
    },
    // ---- Telegram Integration ----
    telegram_chat_id: {
      type: String,
      default: null,
      comment: 'Diisi setelah karyawan register ke Telegram Bot',
    },
    telegram_verified: { type: Boolean, default: false },
    // ---- Status & Security ----
    is_active: { type: Boolean, default: true, index: true },
    is_locked: {
      type: Boolean,
      default: false,
      comment: 'Lock otomatis setelah 5x gagal login',
    },
    locked_until: { type: Date, default: null },
    failed_login_count: {
      type: Number,
      default: 0,
      select: false,
    },
    password_changed_at: { type: Date },
    last_login: { type: Date },
    login_history: {
      type: [LoginHistorySchema],
      default: [],
      comment: 'Simpan 10 riwayat login terakhir',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'users',
  }
);

UserSchema.index({ company_id: 1, username: 1 }, { unique: true });
UserSchema.index({ company_id: 1, email: 1 }, { unique: true });
UserSchema.index({ employee_id: 1 });
UserSchema.index({ telegram_chat_id: 1 }, { sparse: true });

const User = mongoose.model('User', UserSchema);

module.exports = { Role, User };
