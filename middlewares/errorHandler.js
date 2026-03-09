/**
 * ============================================================
 * SamudraHRD — Global Error Handler Middleware
 * ============================================================
 * Menangani semua error yang tidak ter-catch di route/controller.
 * - Mongoose ValidationError → 422
 * - Mongoose CastError → 400
 * - Duplicate Key (code 11000) → 409
 * - JWT Errors → 401
 * - Default → 500
 * ============================================================
 */

const { HTTP_STATUS } = require('../config/constants');

/**
 * Global Error Handler
 * Harus memiliki 4 parameter agar Express mengenali sebagai error handler
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let errorCode = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'Terjadi kesalahan pada server';
  let details = null;

  // ============================================================
  // Mongoose Validation Error (field validation gagal)
  // ============================================================
  if (err.name === 'ValidationError') {
    statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
    errorCode = 'VALIDATION_ERROR';
    message = 'Data yang dikirim tidak valid';
    details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
      value: e.value,
    }));
  }

  // ============================================================
  // Mongoose CastError (invalid ObjectId, tipe data salah)
  // ============================================================
  if (err.name === 'CastError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    errorCode = 'INVALID_ID';
    message = `Format ID tidak valid: ${err.value}`;
  }

  // ============================================================
  // MongoDB Duplicate Key Error (unique constraint violation)
  // ============================================================
  if (err.code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    errorCode = 'DUPLICATE_KEY';
    const field = Object.keys(err.keyPattern || {}).join(', ');
    message = `Data sudah ada: ${field} sudah digunakan`;
  }

  // ============================================================
  // JWT Errors (token expired, invalid, malformed)
  // ============================================================
  if (err.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    errorCode = 'INVALID_TOKEN';
    message = 'Token tidak valid';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    errorCode = 'TOKEN_EXPIRED';
    message = 'Token sudah kedaluwarsa';
  }

  // ============================================================
  // Log error untuk debugging (hanya di development)
  // ============================================================
  if (process.env.NODE_ENV === 'development') {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(`[ERROR] ${err.name || 'Error'}: ${err.message}`);
    console.error(`[PATH]  ${req.method} ${req.originalUrl}`);
    if (err.stack) {
      console.error('[STACK]', err.stack);
    }
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }

  // ============================================================
  // Send error response
  // ============================================================
  const response = {
    success: false,
    error: {
      code: errorCode,
      message,
    },
  };

  if (details) {
    response.error.details = details;
  }

  // Di production, jangan tampilkan stack trace
  if (process.env.NODE_ENV === 'development' && err.stack) {
    response.error.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

module.exports = errorHandler;
