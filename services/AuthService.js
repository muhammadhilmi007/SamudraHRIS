/**
 * ============================================================
 * SamudraHRD — Auth Service
 * ============================================================
 * Business logic untuk autentikasi JWT dan manajemen password.
 * - Token generation (access + refresh)
 * - Password hashing & comparison (bcrypt)
 * - In-memory token blacklist (MVP — ganti Redis di production)
 * ============================================================
 */

'use strict';

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// In-memory token blacklist (MVP — ganti dengan Redis untuk production)
const tokenBlacklist = new Set();

// Bersihkan expired tokens dari blacklist setiap 1 jam
setInterval(() => {
  tokenBlacklist.forEach((token) => {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      // Token expired, hapus dari blacklist
      tokenBlacklist.delete(token);
    }
  });
}, 60 * 60 * 1000);

class AuthService {
  /**
   * Generate JWT access token
   * @param {Object} user - User document (populated with role)
   * @returns {string} JWT access token
   */
  generateAccessToken(user) {
    const payload = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role_id?.slug || 'staff_admin',
      role_id: user.role_id?._id || user.role_id,
      company_id: user.company_id,
      branch_id: user.branch_id,
      permissions: user.role_id?.permissions || [],
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '1h',
    });
  }

  /**
   * Generate JWT refresh token
   * @param {Object} user - User document
   * @returns {string} JWT refresh token
   */
  generateRefreshToken(user) {
    const payload = {
      id: user._id,
      type: 'refresh',
    };

    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
    });
  }

  /**
   * Verify JWT access token
   * @param {string} token - JWT token string
   * @returns {Object} Decoded token payload
   * @throws {Error} Jika token invalid atau expired
   */
  verifyAccessToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }

  /**
   * Verify JWT refresh token
   * @param {string} token - JWT refresh token string
   * @returns {Object} Decoded token payload
   * @throws {Error} Jika token invalid atau expired
   */
  verifyRefreshToken(token) {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  }

  /**
   * Hash password menggunakan bcrypt
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  async hashPassword(password) {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  /**
   * Compare password dengan hash
   * @param {string} password - Plain text password
   * @param {string} hash - Stored bcrypt hash
   * @returns {Promise<boolean>} true jika match
   */
  async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate random password
   * @param {number} length - Panjang password (default: 12)
   * @returns {string} Random password string
   */
  generateRandomPassword(length = 12) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    const randomBytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      password += chars[randomBytes[i] % chars.length];
    }
    return password;
  }

  /**
   * Tambahkan token ke blacklist
   * @param {string} token - JWT token to blacklist
   */
  blacklistToken(token) {
    if (token) {
      tokenBlacklist.add(token);
    }
  }

  /**
   * Cek apakah token ada di blacklist
   * @param {string} token - JWT token to check
   * @returns {boolean} true jika token di-blacklist
   */
  isTokenBlacklisted(token) {
    return tokenBlacklist.has(token);
  }
}

module.exports = new AuthService();
