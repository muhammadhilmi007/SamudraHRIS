/**
 * ============================================================
 * SamudraHRD — Branch Validator (Joi Schemas)
 * ============================================================
 * Validasi input untuk manajemen cabang.
 * ============================================================
 */

'use strict';

const Joi = require('joi');

// Sub-schema: Aturan uang makan
const mealAllowanceRuleSchema = Joi.object({
  amount: Joi.number().min(0).required().messages({
    'number.base': 'Nominal uang makan harus berupa angka',
    'number.min': 'Nominal uang makan tidak boleh negatif',
    'any.required': 'Nominal uang makan wajib diisi',
  }),
  min_work_hours: Joi.number().min(0).max(24).required().messages({
    'number.base': 'Minimum jam kerja harus berupa angka',
    'number.min': 'Minimum jam kerja tidak boleh negatif',
    'number.max': 'Minimum jam kerja maksimal 24 jam',
    'any.required': 'Minimum jam kerja wajib diisi',
  }),
  late_tolerance_minutes: Joi.number().min(0).default(0).messages({
    'number.base': 'Toleransi terlambat harus berupa angka',
    'number.min': 'Toleransi terlambat tidak boleh negatif',
  }),
});

// Sub-schema: Aturan lembur
const overtimeRuleSchema = Joi.object({
  rate_per_hour: Joi.number().min(0).required().messages({
    'number.base': 'Tarif lembur harus berupa angka',
    'number.min': 'Tarif lembur tidak boleh negatif',
    'any.required': 'Tarif lembur wajib diisi',
  }),
  max_hours_per_day: Joi.number().min(0).max(24).default(4).messages({
    'number.base': 'Max jam lembur/hari harus berupa angka',
    'number.min': 'Max jam lembur/hari tidak boleh negatif',
    'number.max': 'Max jam lembur/hari maksimal 24',
  }),
  max_hours_per_month: Joi.number().min(0).default(40).messages({
    'number.base': 'Max jam lembur/bulan harus berupa angka',
    'number.min': 'Max jam lembur/bulan tidak boleh negatif',
  }),
  eligible_days: Joi.array().items(Joi.number().min(0).max(6)).default([1, 2, 3, 4, 5, 6, 0]),
  requires_approval: Joi.boolean().default(true),
});

/**
 * Schema: Create Branch
 */
const createBranchSchema = Joi.object({
  branch_code: Joi.string().trim().uppercase().max(10).required().messages({
    'string.empty': 'Kode cabang wajib diisi',
    'string.max': 'Kode cabang maksimal 10 karakter',
    'any.required': 'Kode cabang wajib diisi',
  }),
  name: Joi.string().trim().max(150).required().messages({
    'string.empty': 'Nama cabang wajib diisi',
    'string.max': 'Nama cabang maksimal 150 karakter',
    'any.required': 'Nama cabang wajib diisi',
  }),
  address: Joi.string().trim().allow('', null),
  city: Joi.string().trim().allow('', null),
  province: Joi.string().trim().allow('', null),
  phone: Joi.string().trim().max(20).allow('', null),
  email: Joi.string().trim().lowercase().email().allow('', null).messages({
    'string.email': 'Format email tidak valid',
  }),
  pic_name: Joi.string().trim().allow('', null),
  latitude: Joi.number().min(-90).max(90).allow(null).messages({
    'number.min': 'Latitude harus antara -90 dan 90',
    'number.max': 'Latitude harus antara -90 dan 90',
  }),
  longitude: Joi.number().min(-180).max(180).allow(null).messages({
    'number.min': 'Longitude harus antara -180 dan 180',
    'number.max': 'Longitude harus antara -180 dan 180',
  }),
  geofence_radius: Joi.number().min(10).default(100).messages({
    'number.min': 'Radius geo-fencing minimal 10 meter',
  }),
  geofence_enabled: Joi.boolean().default(true),
  meal_allowance_rule: mealAllowanceRuleSchema.default(),
  overtime_rule: overtimeRuleSchema.default(),
  max_employee_capacity: Joi.number().min(0).default(0),
  is_active: Joi.boolean().default(true),
});

/**
 * Schema: Update Branch
 */
const updateBranchSchema = Joi.object({
  name: Joi.string().trim().max(150).messages({
    'string.max': 'Nama cabang maksimal 150 karakter',
  }),
  address: Joi.string().trim().allow('', null),
  city: Joi.string().trim().allow('', null),
  province: Joi.string().trim().allow('', null),
  phone: Joi.string().trim().max(20).allow('', null),
  email: Joi.string().trim().lowercase().email().allow('', null),
  pic_name: Joi.string().trim().allow('', null),
  latitude: Joi.number().min(-90).max(90).allow(null),
  longitude: Joi.number().min(-180).max(180).allow(null),
  geofence_radius: Joi.number().min(10),
  geofence_enabled: Joi.boolean(),
  meal_allowance_rule: mealAllowanceRuleSchema,
  overtime_rule: overtimeRuleSchema,
  max_employee_capacity: Joi.number().min(0),
  is_active: Joi.boolean(),
}).min(1).messages({
  'object.min': 'Minimal satu field harus diisi untuk update',
});

module.exports = {
  createBranchSchema,
  updateBranchSchema,
};
