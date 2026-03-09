/**
 * ============================================================
 * SamudraHRD — Auth Validator (Joi Schemas)
 * ============================================================
 * Validasi input untuk autentikasi dan manajemen pengguna.
 * ============================================================
 */

'use strict';

const Joi = require('joi');

/**
 * Schema: Login
 */
const loginSchema = Joi.object({
  username: Joi.string().trim().required().messages({
    'string.empty': 'Username atau email wajib diisi',
    'any.required': 'Username atau email wajib diisi',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password wajib diisi',
    'any.required': 'Password wajib diisi',
  }),
  remember_me: Joi.boolean().default(false),
});

/**
 * Schema: Change Password
 */
const changePasswordSchema = Joi.object({
  old_password: Joi.string().required().messages({
    'string.empty': 'Password lama wajib diisi',
    'any.required': 'Password lama wajib diisi',
  }),
  new_password: Joi.string()
    .min(8)
    .max(128)
    .required()
    .messages({
      'string.empty': 'Password baru wajib diisi',
      'string.min': 'Password baru minimal 8 karakter',
      'string.max': 'Password baru maksimal 128 karakter',
      'any.required': 'Password baru wajib diisi',
    }),
  confirm_password: Joi.string()
    .valid(Joi.ref('new_password'))
    .required()
    .messages({
      'any.only': 'Konfirmasi password tidak cocok',
      'any.required': 'Konfirmasi password wajib diisi',
    }),
});

/**
 * Schema: Create User
 */
const createUserSchema = Joi.object({
  username: Joi.string()
    .trim()
    .lowercase()
    .min(4)
    .max(30)
    .pattern(/^[a-z0-9_]+$/)
    .required()
    .messages({
      'string.empty': 'Username wajib diisi',
      'string.min': 'Username minimal 4 karakter',
      'string.max': 'Username maksimal 30 karakter',
      'string.pattern.base': 'Username hanya boleh huruf kecil, angka, dan underscore',
      'any.required': 'Username wajib diisi',
    }),
  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .required()
    .messages({
      'string.empty': 'Email wajib diisi',
      'string.email': 'Format email tidak valid',
      'any.required': 'Email wajib diisi',
    }),
  password: Joi.string()
    .min(8)
    .max(128)
    .allow('', null)
    .messages({
      'string.min': 'Password minimal 8 karakter',
      'string.max': 'Password maksimal 128 karakter',
    }),
  role_id: Joi.string().required().messages({
    'string.empty': 'Role wajib dipilih',
    'any.required': 'Role wajib dipilih',
  }),
  branch_id: Joi.string().allow('', null).messages({
    'string.empty': 'Cabang tidak valid',
  }),
  company_id: Joi.string().allow('', null),
  employee_id: Joi.string().allow('', null),
  telegram_chat_id: Joi.string().allow('', null),
  is_active: Joi.boolean().default(true),
});

/**
 * Schema: Update User
 */
const updateUserSchema = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .messages({
      'string.email': 'Format email tidak valid',
    }),
  role_id: Joi.string().messages({
    'string.empty': 'Role tidak valid',
  }),
  branch_id: Joi.string().allow('', null),
  employee_id: Joi.string().allow('', null),
  telegram_chat_id: Joi.string().allow('', null),
  is_active: Joi.boolean(),
});

/**
 * Middleware factory: Validate request body dengan Joi schema
 * @param {Object} schema - Joi schema
 * @returns {Function} Express middleware
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Data yang dikirim tidak valid',
          details,
        },
      });
    }

    req.body = value;
    next();
  };
};

module.exports = {
  loginSchema,
  changePasswordSchema,
  createUserSchema,
  updateUserSchema,
  validate,
};
