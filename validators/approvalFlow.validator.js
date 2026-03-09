/**
 * ============================================================
 * SamudraHRD — Approval Flow Validators
 * ============================================================
 */

'use strict';

const Joi = require('joi');

const upsertApprovalFlowSchema = Joi.object({
  module: Joi.string().valid(
    'receivables', 'leave_requests', 'overtime_requests',
    'attendance_manual', 'payroll', 'mutation'
  ).required()
    .messages({ 'any.required': 'Modul wajib diisi' }),
  name: Joi.string().trim().max(100).required()
    .messages({ 'any.required': 'Nama rule wajib diisi' }),
  condition_field: Joi.string().trim().allow(null, '').default(null),
  condition_operator: Joi.string().valid('eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'always').default('always'),
  condition_value: Joi.any().allow(null, '').default(null),
  approver_role_id: Joi.string().hex().length(24).required()
    .messages({ 'any.required': 'Role Approver wajib diisi' }),
  level: Joi.number().integer().min(1).max(5).required()
    .messages({ 'any.required': 'Level approval wajib diisi' }),
  notify_roles: Joi.array().items(Joi.string()).default([]),
  auto_approve_hours: Joi.number().min(0).default(0),
  is_active: Joi.boolean().default(true),
});

module.exports = {
  upsertApprovalFlowSchema,
};
