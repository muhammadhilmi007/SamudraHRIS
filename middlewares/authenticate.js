/**
 * ============================================================
 * SamudraHRD — Authenticate Middleware
 * ============================================================
 * Verifikasi JWT token dari cookie atau Authorization header.
 * Attach req.user dengan data user yang sudah didecode.
 * ============================================================
 */

'use strict';

const authService = require('../services/AuthService');
const { User, Role } = require('../models');
const { HTTP_STATUS } = require('../config/constants');
const { errorResponse } = require('../utils/responseHelper');

/**
 * Middleware: Verify JWT dan attach req.user
 * Mendukung token dari:
 * 1. Cookie: access_token (httpOnly)
 * 2. Authorization header: Bearer <token>
 */
const authenticate = async (req, res, next) => {
  try {
    // Ambil token dari cookie atau Authorization header
    let token = req.cookies?.access_token;

    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    // Jika tidak ada token
    if (!token) {
      // Jika request API, return JSON error
      if (req.originalUrl.startsWith('/api')) {
        return errorResponse(
          res,
          'Akses ditolak. Token tidak ditemukan.',
          'NO_TOKEN',
          HTTP_STATUS.UNAUTHORIZED
        );
      }
      // Jika request view, redirect ke login
      return res.redirect('/auth/login');
    }

    // Cek blacklist
    if (authService.isTokenBlacklisted(token)) {
      if (req.originalUrl.startsWith('/api')) {
        return errorResponse(
          res,
          'Token sudah tidak valid. Silakan login kembali.',
          'TOKEN_REVOKED',
          HTTP_STATUS.UNAUTHORIZED
        );
      }
      return res.redirect('/auth/login');
    }

    // Verify token
    const decoded = authService.verifyAccessToken(token);

    // Ambil user terbaru dari database (untuk cek is_active, dll.)
    const user = await User.findById(decoded.id)
      .populate('role_id', 'name slug permissions is_system_role')
      .populate('branch_id', 'name branch_code')
      .lean();

    if (!user) {
      if (req.originalUrl.startsWith('/api')) {
        return errorResponse(
          res,
          'User tidak ditemukan.',
          'USER_NOT_FOUND',
          HTTP_STATUS.UNAUTHORIZED
        );
      }
      return res.redirect('/auth/login');
    }

    // Cek apakah user masih aktif
    if (!user.is_active) {
      if (req.originalUrl.startsWith('/api')) {
        return errorResponse(
          res,
          'Akun Anda telah dinonaktifkan.',
          'ACCOUNT_DISABLED',
          HTTP_STATUS.UNAUTHORIZED
        );
      }
      return res.redirect('/auth/login');
    }

    // Attach user ke request
    req.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role_id?.slug || 'staff_admin',
      role_name: user.role_id?.name || 'Staff',
      role_id: user.role_id?._id,
      company_id: user.company_id,
      branch_id: user.branch_id?._id || user.branch_id,
      branch_name: user.branch_id?.name || null,
      branch_code: user.branch_id?.branch_code || null,
      employee_id: user.employee_id,
      permissions: user.role_id?.permissions || [],
      is_system_role: user.role_id?.is_system_role || false,
    };

    // Tambahkan user ke res.locals agar tersedia di views EJS
    res.locals.currentUser = req.user;

    next();
  } catch (error) {
    // Handle JWT specific errors
    if (error.name === 'TokenExpiredError') {
      if (req.originalUrl.startsWith('/api')) {
        return errorResponse(
          res,
          'Token sudah kedaluwarsa. Silakan refresh token.',
          'TOKEN_EXPIRED',
          HTTP_STATUS.UNAUTHORIZED
        );
      }
      return res.redirect('/auth/login');
    }

    if (error.name === 'JsonWebTokenError') {
      if (req.originalUrl.startsWith('/api')) {
        return errorResponse(
          res,
          'Token tidak valid.',
          'INVALID_TOKEN',
          HTTP_STATUS.UNAUTHORIZED
        );
      }
      return res.redirect('/auth/login');
    }

    next(error);
  }
};

/**
 * Middleware: Optional authenticate (tidak redirect jika tidak ada token)
 * Berguna untuk halaman yang bisa diakses guest tapi tampil beda jika login
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.access_token;

    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (token && !authService.isTokenBlacklisted(token)) {
      const decoded = authService.verifyAccessToken(token);
      const user = await User.findById(decoded.id)
        .populate('role_id', 'name slug permissions')
        .populate('branch_id', 'name branch_code')
        .lean();

      if (user && user.is_active) {
        req.user = {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role_id?.slug || 'staff_admin',
          role_name: user.role_id?.name || 'Staff',
          role_id: user.role_id?._id,
          company_id: user.company_id,
          branch_id: user.branch_id?._id || user.branch_id,
          branch_name: user.branch_id?.name || null,
          permissions: user.role_id?.permissions || [],
        };
        res.locals.currentUser = req.user;
      }
    }
  } catch {
    // Ignore errors — user simply not authenticated
  }

  next();
};

module.exports = { authenticate, optionalAuth };
