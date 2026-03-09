const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * ============================================================
 * COLLECTION: companies
 * Deskripsi : Data profil perusahaan (single-tenant, 1 dokumen)
 * ============================================================
 */
const CompanySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Nama perusahaan wajib diisi'],
      trim: true,
      maxlength: [150, 'Nama perusahaan maksimal 150 karakter'],
    },
    legal_name: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    company_code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 10,
    },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    province: { type: String, trim: true },
    postal_code: { type: String, trim: true, maxlength: 10 },
    phone: { type: String, trim: true, maxlength: 20 },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Format email tidak valid'],
    },
    website: { type: String, trim: true },
    logo_url: { type: String, trim: true },
    established_date: { type: Date },
    billing_plan: {
      type: String,
      enum: ['free', 'basic', 'professional', 'enterprise'],
      default: 'basic',
    },
    billing_expired_at: { type: Date },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'companies',
  }
);

CompanySchema.index({ company_code: 1 }, { unique: true });

module.exports = mongoose.model('Company', CompanySchema);
