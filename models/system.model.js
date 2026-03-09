const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * ============================================================
 * COLLECTION: document_templates
 * Deskripsi : Template HTML surat/dokumen HR
 *             Mendukung variabel dinamis misal: {{full_name}}
 * Relasi    : → companies, → users (created_by)
 *             ← hr_documents
 * ============================================================
 */
const DocumentTemplateSchema = new Schema(
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
      comment: 'Misal: Surat Pengangkatan Karyawan Tetap',
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      comment: 'Kode unik: SPK, SP1, SP2, SP3, SMT, STM, SPH, dll.',
    },
    type: {
      type: String,
      required: true,
      enum: [
        'agreement',     // Perjanjian Kerja
        'appointment',   // Surat Pengangkatan
        'warning_1',     // Surat Peringatan 1
        'warning_2',     // Surat Peringatan 2
        'warning_3',     // Surat Peringatan 3 / PHK
        'mutation',      // Surat Mutasi
        'termination',   // Surat Pemberhentian
        'paklaring',     // Surat Keterangan Kerja / Paklaring
        'reference',     // Surat Referensi
        'leave_permit',  // Surat Izin Cuti
        'salary_raise',  // Surat Kenaikan Gaji
        'other',         // Lainnya
      ],
    },
    content_html: {
      type: String,
      required: true,
      comment: 'Template HTML — gunakan {{variabel}} untuk data dinamis',
    },
    // Daftar variabel yang tersedia dalam template
    // Contoh: ['{{full_name}}', '{{position}}', '{{join_date}}', '{{branch_name}}']
    available_variables: {
      type: [String],
      default: [],
      comment: 'List variabel yang dapat digunakan dalam template',
    },
    page_orientation: {
      type: String,
      enum: ['portrait', 'landscape'],
      default: 'portrait',
    },
    paper_size: {
      type: String,
      enum: ['A4', 'F4', 'Letter'],
      default: 'A4',
    },
    is_active: { type: Boolean, default: true },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'document_templates',
  }
);

DocumentTemplateSchema.index({ company_id: 1, code: 1 }, { unique: true });
DocumentTemplateSchema.index({ company_id: 1, type: 1 });

const DocumentTemplate = mongoose.model('DocumentTemplate', DocumentTemplateSchema);

/**
 * ============================================================
 * COLLECTION: hr_documents
 * Deskripsi : Dokumen HR yang sudah di-generate per karyawan
 * Relasi    : → document_templates, → employees, → users
 * ============================================================
 */
const HrDocumentSchema = new Schema(
  {
    template_id: {
      type: Schema.Types.ObjectId,
      ref: 'DocumentTemplate',
      required: true,
    },
    employee_id: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    company_id: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    document_number: {
      type: String,
      required: true,
      comment: 'Nomor surat resmi — auto-generate atau input manual',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content_html: {
      type: String,
      comment: 'Konten HTML final setelah variabel di-replace',
    },
    pdf_url: {
      type: String,
      comment: 'URL file PDF yang tersimpan di MinIO/S3',
    },
    issued_date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    effective_date: { type: Date },
    signed_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    signer_name: { type: String, trim: true },
    signer_position: { type: String, trim: true },
    status: {
      type: String,
      enum: ['draft', 'issued', 'signed', 'cancelled'],
      default: 'draft',
    },
    notes: { type: String, trim: true, maxlength: 500 },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'hr_documents',
  }
);

HrDocumentSchema.index({ employee_id: 1, issued_date: -1 });
HrDocumentSchema.index({ document_number: 1 }, { unique: true });

const HrDocument = mongoose.model('HrDocument', HrDocumentSchema);

/**
 * ============================================================
 * COLLECTION: announcements
 * Deskripsi : Pengumuman dan informasi dari Manager HRD
 *             Dapat ditargetkan ke role atau cabang tertentu
 * Relasi    : → companies, → users (created_by),
 *             → branches (target)
 * ============================================================
 */
const AnnouncementSchema = new Schema(
  {
    company_id: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Judul pengumuman wajib diisi'],
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: [true, 'Isi pengumuman wajib diisi'],
    },
    // ---- Target Penerima ----
    target_roles: {
      type: [String],
      default: [],
      comment: 'Kosong = semua role. Isi dengan slug role: ["admin", "manager_hrd"]',
    },
    target_branch_ids: {
      type: [Schema.Types.ObjectId],
      default: [],
      ref: 'Branch',
      comment: 'Kosong = semua cabang',
    },
    // ---- Tampilan ----
    is_pinned: {
      type: Boolean,
      default: false,
      comment: 'Tampil di bagian atas pengumuman',
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    attachment_url: {
      type: String,
      default: null,
      comment: 'File lampiran pengumuman',
    },
    // ---- Waktu Publikasi ----
    publish_date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    expire_date: {
      type: Date,
      default: null,
      comment: 'Pengumuman tidak tampil setelah tanggal ini',
    },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'announcements',
  }
);

AnnouncementSchema.index({ company_id: 1, publish_date: -1 });
AnnouncementSchema.index({ company_id: 1, is_pinned: 1, is_active: 1 });

const Announcement = mongoose.model('Announcement', AnnouncementSchema);

/**
 * ============================================================
 * COLLECTION: notifications
 * Deskripsi : Log dan antrian notifikasi
 *             (In-App, Email, Telegram)
 * Relasi    : → users, → companies
 * ============================================================
 */
const NotificationSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    company_id: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'leave_request',          // Pengajuan cuti baru
        'leave_approved',         // Cuti disetujui
        'leave_rejected',         // Cuti ditolak
        'overtime_request',       // Pengajuan lembur
        'overtime_approved',      // Lembur disetujui
        'receivable_request',     // Pengajuan piutang baru
        'receivable_approved',    // Piutang disetujui
        'receivable_rejected',    // Piutang ditolak
        'receivable_due',         // Cicilan jatuh tempo (H-3)
        'receivable_overdue',     // Cicilan terlambat
        'salary_slip',            // Slip gaji tersedia
        'attendance_manual',      // Absensi manual butuh verifikasi
        'contract_expiry',        // Kontrak hampir habis
        'probation_expiry',       // Masa percobaan hampir habis
        'birthday',               // Ulang tahun karyawan
        'employee_absent',        // Karyawan belum absen
        'payroll_processed',      // Payroll selesai diproses
        'mutation_approved',      // Mutasi disetujui
        'system_alert',           // Alert sistem
      ],
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    channel: {
      type: String,
      required: true,
      enum: ['in_app', 'email', 'telegram'],
    },
    // ---- Referensi ke Record Terkait ----
    reference_id: {
      type: Schema.Types.ObjectId,
      default: null,
      comment: 'ID record terkait (leave_request_id, receivable_id, dll.)',
    },
    reference_type: {
      type: String,
      default: null,
      comment: 'Nama collection: LeaveRequest, Receivable, Payroll, dll.',
    },
    action_url: {
      type: String,
      default: null,
      comment: 'URL halaman terkait untuk navigasi langsung',
    },
    // ---- Status In-App ----
    is_read: { type: Boolean, default: false, index: true },
    read_at: { type: Date, default: null },
    // ---- Status Pengiriman ----
    is_sent: { type: Boolean, default: false },
    sent_at: { type: Date, default: null },
    send_error: {
      type: String,
      default: null,
      comment: 'Pesan error jika pengiriman gagal',
    },
    retry_count: { type: Number, default: 0 },
    // ---- Telegram Specific ----
    telegram_message_id: {
      type: Number,
      default: null,
      comment: 'Message ID dari Telegram — untuk edit/delete jika perlu',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'notifications',
  }
);

NotificationSchema.index({ user_id: 1, is_read: 1, created_at: -1 });
NotificationSchema.index({ user_id: 1, channel: 1, is_sent: 1 });
// TTL: Auto-hapus notifikasi in-app yang sudah dibaca setelah 90 hari
NotificationSchema.index(
  { read_at: 1 },
  { expireAfterSeconds: 7776000, partialFilterExpression: { is_read: true } }
);

const Notification = mongoose.model('Notification', NotificationSchema);

/**
 * ============================================================
 * COLLECTION: activity_logs
 * Deskripsi : Audit trail semua aktivitas pengguna
 *             *** WAJIB TTL INDEX — auto-delete setelah 2 tahun ***
 *
 * Data yang disimpan:
 *   user_id, action, module, table_affected,
 *   old_value (JSON), new_value (JSON),
 *   ip_address, user_agent, timestamp
 * ============================================================
 */
const ActivityLogSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    company_id: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      uppercase: true,
      enum: [
        'CREATE', 'READ', 'UPDATE', 'DELETE',
        'APPROVE', 'REJECT', 'CANCEL',
        'LOGIN', 'LOGOUT', 'LOGIN_FAILED',
        'EXPORT', 'IMPORT',
        'GENERATE_PAYROLL', 'LOCK_PAYROLL', 'UNLOCK_PAYROLL',
        'GENERATE_SLIP', 'SEND_TELEGRAM',
        'DISBURSE_RECEIVABLE', 'PAY_INSTALLMENT',
        'MUTATE_EMPLOYEE', 'DEACTIVATE_EMPLOYEE',
        'PASSWORD_CHANGE', 'TWOFACTOR_ENABLE', 'TWOFACTOR_DISABLE',
      ],
    },
    module: {
      type: String,
      required: true,
      comment: 'Modul aplikasi: employees, payroll, receivables, attendance, dll.',
    },
    table_affected: {
      type: String,
      required: true,
      comment: 'Nama collection MongoDB yang terpengaruh',
    },
    record_id: {
      type: Schema.Types.ObjectId,
      default: null,
      comment: '_id record yang terpengaruh',
    },
    old_value: {
      type: Schema.Types.Mixed,
      default: null,
      comment: 'Nilai sebelum perubahan (format JSON Object) — null untuk CREATE',
    },
    new_value: {
      type: Schema.Types.Mixed,
      default: null,
      comment: 'Nilai setelah perubahan (format JSON Object) — null untuk DELETE',
    },
    ip_address: { type: String, default: null },
    user_agent: { type: String, default: null },
    description: {
      type: String,
      default: null,
      comment: 'Deskripsi singkat aksi, misal: "Approve piutang RCV-JKT-202501-0001"',
    },
    is_sensitive: {
      type: Boolean,
      default: false,
      comment: 'True untuk aksi kritis: unlock_payroll, delete_employee, dll.',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    // Tidak menggunakan timestamps otomatis — gunakan field timestamp manual
    collection: 'activity_logs',
  }
);

// *** TTL INDEX: Auto-delete setelah 2 tahun (63.072.000 detik) ***
ActivityLogSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 63072000, name: 'ttl_2years' }
);
ActivityLogSchema.index({ user_id: 1, timestamp: -1 });
ActivityLogSchema.index({ company_id: 1, action: 1, timestamp: -1 });
ActivityLogSchema.index({ company_id: 1, module: 1, timestamp: -1 });
ActivityLogSchema.index({ table_affected: 1, record_id: 1 }); // Trace history per record

const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);

module.exports = {
  DocumentTemplate,
  HrDocument,
  Announcement,
  Notification,
  ActivityLog,
};
