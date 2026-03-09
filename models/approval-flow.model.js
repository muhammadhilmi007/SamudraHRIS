const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * ============================================================
 * COLLECTION: approval_flows
 * Deskripsi : Konfigurasi alur persetujuan bertingkat
 *             berdasarkan modul dan kondisi nilai
 * Relasi    : → companies, → roles
 *
 * Contoh konfigurasi:
 *   module: 'receivables'
 *   condition_field: 'amount'
 *   condition_operator: 'gte'
 *   condition_value: 1000000
 *   approver_role_slug: 'manager_hrd'
 *   level: 1
 *
 *   → Artinya: Piutang dengan amount >= 1.000.000
 *     harus disetujui Manager HRD di level 1
 * ============================================================
 */
const ApprovalFlowSchema = new Schema(
  {
    company_id: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    module: {
      type: String,
      required: true,
      enum: [
        'receivables',     // Piutang karyawan
        'leave_requests',  // Pengajuan cuti
        'overtime_requests', // Pengajuan lembur
        'attendance_manual', // Verifikasi absensi manual
        'payroll',         // Persetujuan payroll
        'mutation',        // Persetujuan mutasi karyawan
      ],
    },
    name: {
      type: String,
      required: true,
      trim: true,
      comment: 'Label deskriptif, misal: "Piutang ≥ 1 Juta ke Manager HRD"',
    },
    condition_field: {
      type: String,
      default: null,
      comment: 'Field yang dievaluasi, misal: "amount". Null = berlaku untuk semua',
    },
    condition_operator: {
      type: String,
      enum: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'always'],
      default: 'always',
    },
    condition_value: {
      type: Schema.Types.Mixed,
      default: null,
      comment: 'Nilai threshold, misal: 1000000',
    },
    approver_role_id: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
    approver_role_slug: {
      type: String,
      required: true,
      comment: 'Redundan dari role — agar tidak perlu populate saat evaluasi cepat',
    },
    level: {
      type: Number,
      required: true,
      min: 1,
      comment: 'Urutan level persetujuan (1 = pertama)',
    },
    notify_roles: {
      type: [String],
      default: [],
      comment: 'Role yang hanya mendapat notifikasi (tanpa hak approve)',
    },
    auto_approve_hours: {
      type: Number,
      default: 0,
      comment: 'Jika > 0: auto-approve jika tidak ada aksi dalam N jam',
    },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'approval_flows',
  }
);

ApprovalFlowSchema.index({ company_id: 1, module: 1, level: 1 });

module.exports = mongoose.model('ApprovalFlow', ApprovalFlowSchema);
