/**
 * ============================================================
 * SamudraHRD — Employee Validator
 * ============================================================
 */

'use strict';

const Joi = require('joi');

const emergencyContactSchema = Joi.object({
  name: Joi.string().trim().required().messages({ 'any.required': 'Nama kontak darurat wajib diisi' }),
  relationship: Joi.string().trim().required().messages({ 'any.required': 'Hubungan kontak darurat wajib diisi' }),
  phone: Joi.string().trim().required().messages({ 'any.required': 'No. Telepon kontak darurat wajib diisi' }),
  address: Joi.string().trim().allow(null, ''),
});

const bankAccountSchema = Joi.object({
  bank_name: Joi.string().trim().required().messages({ 'any.required': 'Nama bank wajib diisi' }),
  account_number: Joi.string().trim().required().messages({ 'any.required': 'Nomor rekening wajib diisi' }),
  account_holder_name: Joi.string().trim().required().messages({ 'any.required': 'Nama pemilik rekening wajib diisi' }),
  branch_name: Joi.string().trim().allow(null, ''),
});

const salaryConfigSchema = Joi.object({
  base_salary: Joi.number().min(0).required().messages({ 'any.required': 'Gaji pokok wajib diisi' }),
  tenure_allowance: Joi.number().min(0).default(0),
  position_allowance: Joi.number().min(0).default(0),
  performance_allowance: Joi.number().min(0).default(0),
  daily_rate: Joi.number().min(0).default(0),
  meal_allowance: Joi.number().min(0).default(0),
  fuel_allowance: Joi.number().min(0).default(0),
  overtime_rate_per_hour: Joi.number().min(0).default(0),
  bonus: Joi.number().min(0).default(0),
});

const createEmployeeSchema = Joi.object({
  // Kepegawaian
  branch_id: Joi.string().hex().length(24).required().messages({ 'any.required': 'Cabang wajib dipilih' }),
  department_id: Joi.string().hex().length(24).required().messages({ 'any.required': 'Departemen wajib dipilih' }),
  position_id: Joi.string().hex().length(24).required().messages({ 'any.required': 'Jabatan wajib dipilih' }),
  status: Joi.string().valid('KT', 'KL', 'Magang').required().messages({ 'any.required': 'Status wajib diisi' }),
  payment_cycle: Joi.string().valid('daily', 'weekly', 'monthly').required().messages({ 'any.required': 'Siklus gaji wajib dipilih' }),
  join_date: Joi.date().iso().required().messages({ 'any.required': 'Tanggal bergabung wajib diisi' }),
  contract_start: Joi.date().iso().allow(null, ''),
  contract_end: Joi.date().iso().allow(null, ''),
  probation_start: Joi.date().iso().allow(null, ''),
  probation_end: Joi.date().iso().allow(null, ''),
  
  // Data Pribadi
  full_name: Joi.string().trim().max(150).required().messages({ 'any.required': 'Nama lengkap wajib diisi' }),
  nik: Joi.string().trim().length(16).required().messages({ 'any.required': 'NIK wajib 16 digit', 'string.length': 'NIK harus tepat 16 digit' }),
  gender: Joi.string().valid('L', 'P').required().messages({ 'any.required': 'Jenis kelamin wajib diisi' }),
  birth_place: Joi.string().trim().allow(null, ''),
  birth_date: Joi.date().iso().required().messages({ 'any.required': 'Tanggal lahir wajib diisi' }),
  religion: Joi.string().valid('Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Lainnya').allow(null, '').default('Islam'),
  marital_status: Joi.string().valid('Belum Menikah', 'Menikah', 'Cerai').default('Belum Menikah'),
  blood_type: Joi.string().valid('A', 'B', 'AB', 'O', '-').default('-'),
  address: Joi.string().trim().allow(null, ''),
  city: Joi.string().trim().allow(null, ''),
  province: Joi.string().trim().allow(null, ''),
  postal_code: Joi.string().trim().max(10).allow(null, ''),
  phone: Joi.string().trim().max(20).required().messages({ 'any.required': 'No. Handphone wajib diisi' }),
  email: Joi.string().trim().email().allow(null, ''),
  last_education: Joi.string().valid('SD', 'SMP', 'SMA/SMK', 'D1', 'D2', 'D3', 'S1', 'S2', 'S3').allow(null, ''),

  // Relasi Sub-dokumen
  emergency_contact: emergencyContactSchema.required(),
  bank_account: bankAccountSchema.required(),

  // Konfigurasi Gaji Awal
  salary: salaryConfigSchema.required().messages({ 'any.required': 'Konfigurasi gaji awal wajib diisi' })
});

const updateEmployeeSchema = Joi.object({
  branch_id: Joi.string().hex().length(24),
  department_id: Joi.string().hex().length(24),
  position_id: Joi.string().hex().length(24),
  status: Joi.string().valid('KT', 'KL', 'Magang'),
  payment_cycle: Joi.string().valid('daily', 'weekly', 'monthly'),
  join_date: Joi.date().iso(),
  contract_start: Joi.date().iso().allow(null, ''),
  contract_end: Joi.date().iso().allow(null, ''),
  probation_start: Joi.date().iso().allow(null, ''),
  probation_end: Joi.date().iso().allow(null, ''),
  
  full_name: Joi.string().trim().max(150),
  gender: Joi.string().valid('L', 'P'),
  birth_place: Joi.string().trim().allow(null, ''),
  birth_date: Joi.date().iso(),
  religion: Joi.string().valid('Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Lainnya').allow(null, ''),
  marital_status: Joi.string().valid('Belum Menikah', 'Menikah', 'Cerai'),
  blood_type: Joi.string().valid('A', 'B', 'AB', 'O', '-'),
  address: Joi.string().trim().allow(null, ''),
  city: Joi.string().trim().allow(null, ''),
  province: Joi.string().trim().allow(null, ''),
  postal_code: Joi.string().trim().max(10).allow(null, ''),
  phone: Joi.string().trim().max(20),
  email: Joi.string().trim().email().allow(null, ''),
  last_education: Joi.string().valid('SD', 'SMP', 'SMA/SMK', 'D1', 'D2', 'D3', 'S1', 'S2', 'S3').allow(null, ''),

  emergency_contact: emergencyContactSchema,
  bank_account: bankAccountSchema,

  is_active: Joi.boolean()
}).min(1);

module.exports = {
  createEmployeeSchema,
  updateEmployeeSchema,
};
