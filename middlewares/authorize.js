/**
 * ============================================================
 * SamudraHRD — Authorization Middleware (RBAC)
 * ============================================================
 * Middleware factory untuk cek permission berdasarkan role.
 * Format permission: 'module:action'
 * Contoh: checkPermission('employees', 'read')
 * Admin selalu lolos (bypass permission check).
 * ============================================================
 */

'use strict';

const { ROLES, HTTP_STATUS } = require('../config/constants');
const { errorResponse } = require('../utils/responseHelper');

/**
 * Middleware factory: Cek apakah user memiliki permission tertentu
 * @param {string} module - Nama modul (e.g., 'employees', 'payroll', 'users')
 * @param {string} action - Nama aksi (e.g., 'read', 'create', 'update', 'delete', 'approve')
 * @returns {Function} Express middleware
 */
const checkPermission = (module, action) => {
  return (req, res, next) => {
    // Pastikan user sudah ter-authenticate
    if (!req.user) {
      if (req.originalUrl.startsWith('/api')) {
        return errorResponse(
          res,
          'Akses ditolak. Silakan login terlebih dahulu.',
          'NOT_AUTHENTICATED',
          HTTP_STATUS.UNAUTHORIZED
        );
      }
      return res.redirect('/auth/login');
    }

    // Admin selalu lolos (bypass permission check)
    if (req.user.role === ROLES.ADMIN) {
      return next();
    }

    // Cek permission
    const requiredPermission = `${module}:${action}`;
    const userPermissions = req.user.permissions || [];

    if (userPermissions.includes(requiredPermission)) {
      return next();
    }

    // Permission denied
    if (req.originalUrl.startsWith('/api')) {
      return errorResponse(
        res,
        `Anda tidak memiliki akses untuk ${action} pada modul ${module}.`,
        'FORBIDDEN',
        HTTP_STATUS.FORBIDDEN
      );
    }

    // Untuk view, render halaman 403
    return res.status(403).render('error-403', {
      title: '403 - Akses Ditolak',
    });
  };
};

/**
 * Middleware: Hanya izinkan role tertentu
 * @param  {...string} roles - Role slugs yang diizinkan
 * @returns {Function} Express middleware
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      if (req.originalUrl.startsWith('/api')) {
        return errorResponse(
          res,
          'Akses ditolak. Silakan login terlebih dahulu.',
          'NOT_AUTHENTICATED',
          HTTP_STATUS.UNAUTHORIZED
        );
      }
      return res.redirect('/auth/login');
    }

    if (roles.includes(req.user.role)) {
      return next();
    }

    if (req.originalUrl.startsWith('/api')) {
      return errorResponse(
        res,
        'Anda tidak memiliki akses untuk halaman ini.',
        'FORBIDDEN',
        HTTP_STATUS.FORBIDDEN
      );
    }

    return res.status(403).render('error-403', {
      title: '403 - Akses Ditolak',
    });
  };
};

module.exports = { checkPermission, requireRole };
