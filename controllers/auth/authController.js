/**
 * ============================================================
 * SamudraHRD — Auth Controller
 * ============================================================
 * Menangani autentikasi: login, logout, refresh token,
 * dan ganti password.
 * Tanpa 2FA (sesuai keputusan Sprint 1).
 * ============================================================
 */

'use strict';

const { User, Role, ActivityLog } = require('../../models');
const authService = require('../../services/AuthService');
const { loginSchema, changePasswordSchema, validate } = require('../../validators/auth.validator');
const { successResponse, errorResponse } = require('../../utils/responseHelper');
const { HTTP_STATUS, ROLES } = require('../../config/constants');

/**
 * Render halaman login
 * GET /auth/login
 */
const loginPage = (req, res) => {
  // Jika sudah login, redirect ke dashboard
  if (req.cookies?.access_token) {
    try {
      const decoded = authService.verifyAccessToken(req.cookies.access_token);
      if (decoded && !authService.isTokenBlacklisted(req.cookies.access_token)) {
        return res.redirect('/');
      }
    } catch {
      // Token invalid, tampilkan login
    }
  }

  res.render('auth/login', {
    title: 'Login — SamudraHRD',
    error_msg: req.session.error_msg || null,
    success_msg: req.session.success_msg || null,
  });

  // Clear flash messages
  delete req.session.error_msg;
  delete req.session.success_msg;
};

/**
 * Proses login
 * POST /api/v1/auth/login
 */
const login = async (req, res, next) => {
  try {
    // Validasi input
    const { error, value } = loginSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      return errorResponse(res, 'Data login tidak valid', 'VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, details);
    }

    const { username, password, remember_me } = value;

    // Cari user berdasarkan username atau email
    const user = await User.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: username.toLowerCase() },
      ],
    })
      .select('+password_hash +failed_login_count')
      .populate('role_id', 'name slug permissions is_system_role')
      .populate('branch_id', 'name branch_code');

    if (!user) {
      return errorResponse(
        res,
        'Username/email atau password salah.',
        'INVALID_CREDENTIALS',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    // Cek apakah akun aktif
    if (!user.is_active) {
      return errorResponse(
        res,
        'Akun Anda telah dinonaktifkan. Hubungi administrator.',
        'ACCOUNT_DISABLED',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    // Cek apakah akun terkunci
    if (user.is_locked && user.locked_until) {
      if (new Date() < new Date(user.locked_until)) {
        const remainingMinutes = Math.ceil(
          (new Date(user.locked_until) - new Date()) / (1000 * 60)
        );
        return errorResponse(
          res,
          `Akun terkunci. Coba lagi dalam ${remainingMinutes} menit.`,
          'ACCOUNT_LOCKED',
          HTTP_STATUS.UNAUTHORIZED
        );
      }
      // Lock sudah expired, reset lock
      user.is_locked = false;
      user.locked_until = null;
      user.failed_login_count = 0;
      await user.save();
    }

    // Verify password
    const isPasswordValid = await authService.comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      // Increment failed login count
      user.failed_login_count = (user.failed_login_count || 0) + 1;

      // Lock akun setelah 5x gagal
      if (user.failed_login_count >= 5) {
        user.is_locked = true;
        user.locked_until = new Date(Date.now() + 30 * 60 * 1000); // 30 menit
        await user.save();

        // Log login failed + lock
        await ActivityLog.create({
          user_id: user._id,
          company_id: user.company_id,
          action: 'LOGIN_FAILED',
          module: 'auth',
          table_affected: 'users',
          record_id: user._id,
          description: `Akun ${user.username} terkunci setelah 5x gagal login`,
          ip_address: req.ip,
          user_agent: req.get('User-Agent'),
        });

        return errorResponse(
          res,
          'Akun terkunci karena terlalu banyak percobaan login. Coba lagi dalam 30 menit.',
          'ACCOUNT_LOCKED',
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      await user.save();

      // Log failed login
      await ActivityLog.create({
        user_id: user._id,
        company_id: user.company_id,
        action: 'LOGIN_FAILED',
        module: 'auth',
        table_affected: 'users',
        record_id: user._id,
        description: `Login gagal untuk ${user.username} (percobaan ke-${user.failed_login_count})`,
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
      });

      return errorResponse(
        res,
        'Username/email atau password salah.',
        'INVALID_CREDENTIALS',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    // Login berhasil — generate tokens
    const accessToken = authService.generateAccessToken(user);
    const refreshToken = authService.generateRefreshToken(user);

    // Update user: reset failed count, set last login, add login history
    user.failed_login_count = 0;
    user.is_locked = false;
    user.locked_until = null;
    user.last_login = new Date();

    // Tambah ke login history (max 10 entries)
    user.login_history = user.login_history || [];
    user.login_history.unshift({
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      logged_in_at: new Date(),
      is_success: true,
    });
    if (user.login_history.length > 10) {
      user.login_history = user.login_history.slice(0, 10);
    }

    await user.save();

    // Log successful login
    await ActivityLog.create({
      user_id: user._id,
      company_id: user.company_id,
      action: 'LOGIN',
      module: 'auth',
      table_affected: 'users',
      record_id: user._id,
      description: `${user.username} login berhasil`,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
    });

    // Set cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    };

    // Access token cookie
    res.cookie('access_token', accessToken, {
      ...cookieOptions,
      maxAge: remember_me ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000, // 7 hari atau 1 jam
    });

    // Refresh token cookie
    res.cookie('refresh_token', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
    });

    // Response
    return successResponse(res, {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role_id?.slug,
        role_name: user.role_id?.name,
        branch_name: user.branch_id?.name || null,
        last_login: user.last_login,
      },
    }, 'Login berhasil');
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refresh_token || req.body.refresh_token;

    if (!token) {
      return errorResponse(
        res,
        'Refresh token tidak ditemukan.',
        'NO_REFRESH_TOKEN',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    // Verify refresh token
    const decoded = authService.verifyRefreshToken(token);

    // Ambil user terbaru
    const user = await User.findById(decoded.id)
      .populate('role_id', 'name slug permissions')
      .populate('branch_id', 'name branch_code');

    if (!user || !user.is_active) {
      return errorResponse(
        res,
        'User tidak valid atau sudah dinonaktifkan.',
        'INVALID_USER',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    // Generate new access token
    const newAccessToken = authService.generateAccessToken(user);

    // Set cookie
    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000, // 1 jam
      path: '/',
    });

    return successResponse(res, {
      access_token: newAccessToken,
    }, 'Token berhasil diperbarui');
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(
        res,
        'Refresh token sudah kedaluwarsa. Silakan login kembali.',
        'REFRESH_TOKEN_EXPIRED',
        HTTP_STATUS.UNAUTHORIZED
      );
    }
    next(error);
  }
};

/**
 * Logout
 * POST /api/v1/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    // Blacklist access token
    const accessToken = req.cookies?.access_token;
    if (accessToken) {
      authService.blacklistToken(accessToken);
    }

    // Log logout
    if (req.user) {
      await ActivityLog.create({
        user_id: req.user.id,
        company_id: req.user.company_id,
        action: 'LOGOUT',
        module: 'auth',
        table_affected: 'users',
        record_id: req.user.id,
        description: `${req.user.username} logout`,
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
      });
    }

    // Clear cookies
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });

    // Jika request dari API
    if (req.originalUrl.startsWith('/api')) {
      return successResponse(res, null, 'Logout berhasil');
    }

    // Jika request dari view
    req.session.success_msg = 'Anda telah berhasil logout.';
    return res.redirect('/auth/login');
  } catch (error) {
    next(error);
  }
};

/**
 * Ganti password
 * POST /api/v1/auth/change-password
 */
const changePassword = async (req, res, next) => {
  try {
    // Validasi input
    const { error, value } = changePasswordSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      return errorResponse(res, 'Data tidak valid', 'VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, details);
    }

    const { old_password, new_password } = value;

    // Ambil user dengan password_hash
    const user = await User.findById(req.user.id).select('+password_hash');
    if (!user) {
      return errorResponse(res, 'User tidak ditemukan', 'USER_NOT_FOUND', HTTP_STATUS.NOT_FOUND);
    }

    // Verify old password
    const isOldPasswordValid = await authService.comparePassword(old_password, user.password_hash);
    if (!isOldPasswordValid) {
      return errorResponse(
        res,
        'Password lama tidak cocok.',
        'INVALID_OLD_PASSWORD',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Hash new password
    const newHash = await authService.hashPassword(new_password);
    user.password_hash = newHash;
    user.password_changed_at = new Date();
    await user.save();

    // Blacklist current token (force relogin)
    const accessToken = req.cookies?.access_token;
    if (accessToken) {
      authService.blacklistToken(accessToken);
    }

    // Log activity
    await ActivityLog.create({
      user_id: req.user.id,
      company_id: req.user.company_id,
      action: 'PASSWORD_CHANGE',
      module: 'auth',
      table_affected: 'users',
      record_id: req.user.id,
      description: `${req.user.username} mengganti password`,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      is_sensitive: true,
    });

    // Clear cookies
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });

    return successResponse(res, null, 'Password berhasil diganti. Silakan login kembali.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginPage,
  login,
  refreshToken,
  logout,
  changePassword,
};
