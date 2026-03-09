/**
 * ============================================================
 * SamudraHRD — Organization Validators
 * ============================================================
 * Joi schemas untuk Department, Position, dan SalaryLevel.
 * ============================================================
 */

'use strict';

const Joi = require('joi');

// ============================================================
// Department Schemas
// ============================================================

const createDepartmentSchema = Joi.object({
  name: Joi.string().trim().max(100).required()
    .messages({ 'any.required': 'Nama departemen wajib diisi' }),
  code: Joi.string().trim().uppercase().max(10).required()
    .messages({ 'any.required': 'Kode departemen wajib diisi' }),
  parent_department_id: Joi.string().hex().length(24).allow(null, '').default(null),
  description: Joi.string().trim().max(500).allow('', null),
  is_active: Joi.boolean().default(true),
});

const updateDepartmentSchema = Joi.object({
  name: Joi.string().trim().max(100),
  code: Joi.string().trim().uppercase().max(10),
  parent_department_id: Joi.string().hex().length(24).allow(null, ''),
  head_employee_id: Joi.string().hex().length(24).allow(null, ''),
  description: Joi.string().trim().max(500).allow('', null),
  is_active: Joi.boolean(),
}).min(1);

// ============================================================
// Position Schemas
// ============================================================

const createPositionSchema = Joi.object({
  name: Joi.string().trim().max(100).required()
    .messages({ 'any.required': 'Nama jabatan wajib diisi' }),
  code: Joi.string().trim().uppercase().max(10).required()
    .messages({ 'any.required': 'Kode jabatan wajib diisi' }),
  department_id: Joi.string().hex().length(24).required()
    .messages({ 'any.required': 'Departemen wajib dipilih' }),
  salary_level_id: Joi.string().hex().length(24).allow(null, '').default(null),
  level: Joi.number().integer().min(1).max(10).default(1)
    .messages({ 'number.min': 'Level minimal 1', 'number.max': 'Level maksimal 10' }),
  description: Joi.string().trim().max(500).allow('', null),
  is_active: Joi.boolean().default(true),
});

const updatePositionSchema = Joi.object({
  name: Joi.string().trim().max(100),
  code: Joi.string().trim().uppercase().max(10),
  department_id: Joi.string().hex().length(24),
  salary_level_id: Joi.string().hex().length(24).allow(null, ''),
  level: Joi.number().integer().min(1).max(10),
  description: Joi.string().trim().max(500).allow('', null),
  is_active: Joi.boolean(),
}).min(1);

// ============================================================
// Salary Level Schemas
// ============================================================

const defaultComponentsSchema = Joi.object({
  tenure_allowance: Joi.number().min(0).default(0),
  position_allowance: Joi.number().min(0).default(0),
  performance_allowance: Joi.number().min(0).default(0),
  meal_allowance: Joi.number().min(0).default(0),
  fuel_allowance: Joi.number().min(0).default(0),
});

const createSalaryLevelSchema = Joi.object({
  name: Joi.string().trim().max(100).required()
    .messages({ 'any.required': 'Nama grade wajib diisi' }),
  grade: Joi.string().trim().uppercase().max(5).required()
    .messages({ 'any.required': 'Kode grade wajib diisi' }),
  min_salary: Joi.number().min(0).required()
    .messages({ 'any.required': 'Gaji minimum wajib diisi' }),
  max_salary: Joi.number().min(0).required()
    .messages({ 'any.required': 'Gaji maksimum wajib diisi' }),
  default_components: defaultComponentsSchema.default(),
  description: Joi.string().trim().max(500).allow('', null),
  is_active: Joi.boolean().default(true),
}).custom((value, helpers) => {
  if (value.min_salary > value.max_salary) {
    return helpers.error('any.custom', { message: 'Gaji minimum tidak boleh lebih besar dari gaji maksimum' });
  }
  return value;
});

const updateSalaryLevelSchema = Joi.object({
  name: Joi.string().trim().max(100),
  grade: Joi.string().trim().uppercase().max(5),
  min_salary: Joi.number().min(0),
  max_salary: Joi.number().min(0),
  default_components: defaultComponentsSchema,
  description: Joi.string().trim().max(500).allow('', null),
  is_active: Joi.boolean(),
}).min(1);

module.exports = {
  createDepartmentSchema,
  updateDepartmentSchema,
  createPositionSchema,
  updatePositionSchema,
  createSalaryLevelSchema,
  updateSalaryLevelSchema,
};
