const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * ============================================================
 * COLLECTION: departments
 * Deskripsi : Departemen dalam perusahaan
 * Relasi    : → companies, → employees (kepala dept)
 *             ← employees, ← positions
 * ============================================================
 */
const DepartmentSchema = new Schema(
  {
    company_id: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Nama departemen wajib diisi'],
      trim: true,
      maxlength: 100,
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      maxlength: 10,
    },
    head_employee_id: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
      comment: 'Kepala departemen — opsional saat pertama dibuat',
    },
    parent_department_id: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
      comment: 'Untuk hierarki departemen (opsional)',
    },
    description: { type: String, trim: true, maxlength: 500 },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'departments',
  }
);

DepartmentSchema.index({ company_id: 1, code: 1 }, { unique: true });
DepartmentSchema.index({ company_id: 1, is_active: 1 });

const Department = mongoose.model('Department', DepartmentSchema);

/**
 * ============================================================
 * COLLECTION: positions
 * Deskripsi : Jabatan dalam departemen, terhubung ke grade gaji
 * Relasi    : → companies, → departments, → salary_levels
 *             ← employees
 * ============================================================
 */
const PositionSchema = new Schema(
  {
    company_id: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    department_id: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'department_id wajib diisi'],
    },
    salary_level_id: {
      type: Schema.Types.ObjectId,
      ref: 'SalaryLevel',
      default: null,
      comment: 'Grade gaji untuk jabatan ini',
    },
    name: {
      type: String,
      required: [true, 'Nama jabatan wajib diisi'],
      trim: true,
      maxlength: 100,
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      maxlength: 10,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
      comment: 'Tingkat hierarki: 1=Staff, 2=Supervisor, 3=Manager, dst',
    },
    description: { type: String, trim: true, maxlength: 500 },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'positions',
  }
);

PositionSchema.index({ company_id: 1, code: 1 }, { unique: true });
PositionSchema.index({ company_id: 1, department_id: 1, is_active: 1 });

const Position = mongoose.model('Position', PositionSchema);

module.exports = { Department, Position };
