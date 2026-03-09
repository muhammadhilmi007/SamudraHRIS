/**
 * ============================================================
 * SamudraHRD — User Controller
 * ============================================================
 * CRUD manajemen pengguna + reset password.
 * Hanya admin & manager_hrd yang bisa akses semua user.
 * Kepala cabang hanya bisa lihat user cabangnya.
 * ============================================================
 */

'use strict';

const { User, Role, Branch, Employee, ActivityLog } = require('../../models');
const authService = require('../../services/AuthService');
const { createUserSchema, updateUserSchema, validate } = require('../../validators/auth.validator');
const { successResponse, errorResponse, paginatedResponse } = require('../../utils/responseHelper');
const { HTTP_STATUS, ROLES } = require('../../config/constants');

// ============================================================
// View Renderers
// ============================================================

/**
 * Render halaman daftar pengguna
 * GET /sistem/pengguna
 */
const usersPage = async (req, res, next) => {
  try {
    const roles = await Role.find({ company_id: req.user.company_id, is_active: true }).lean();
    const branches = await Branch.find({ company_id: req.user.company_id, is_active: true }).lean();

    res.render('settings/users/index', {
      title: 'Manajemen Pengguna — SamudraHRD',
      pageTitle: 'Manajemen Pengguna',
      breadcrumb: [
        { name: 'Sistem', url: '#' },
        { name: 'Manajemen Pengguna', url: null },
      ],
      roles,
      branches,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Render halaman tambah pengguna
 * GET /sistem/pengguna/tambah
 */
const createPage = async (req, res, next) => {
  try {
    const roles = await Role.find({ company_id: req.user.company_id, is_active: true }).lean();
    const branches = await Branch.find({ company_id: req.user.company_id, is_active: true }).lean();

    res.render('settings/users/create', {
      title: 'Tambah Pengguna — SamudraHRD',
      pageTitle: 'Tambah Pengguna',
      breadcrumb: [
        { name: 'Sistem', url: '#' },
        { name: 'Manajemen Pengguna', url: '/sistem/pengguna' },
        { name: 'Tambah', url: null },
      ],
      roles,
      branches,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Render halaman edit pengguna
 * GET /sistem/pengguna/edit/:id
 */
const editPage = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('role_id', 'name slug')
      .populate('branch_id', 'name branch_code')
      .lean();

    if (!user) {
      req.session.error_msg = 'Pengguna tidak ditemukan.';
      return res.redirect('/sistem/pengguna');
    }

    const roles = await Role.find({ company_id: req.user.company_id, is_active: true }).lean();
    const branches = await Branch.find({ company_id: req.user.company_id, is_active: true }).lean();

    res.render('settings/users/edit', {
      title: 'Edit Pengguna — SamudraHRD',
      pageTitle: 'Edit Pengguna',
      breadcrumb: [
        { name: 'Sistem', url: '#' },
        { name: 'Manajemen Pengguna', url: '/sistem/pengguna' },
        { name: 'Edit', url: null },
      ],
      userData: user,
      roles,
      branches,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// API Handlers
// ============================================================

/**
 * Get all users (with filter, sort, pagination)
 * GET /api/v1/users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = '-created_at',
      search,
      role,
      branch_id,
      is_active,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter = { company_id: req.user.company_id };

    // Branch filter berdasarkan role
    if (req.user.role === ROLES.KEPALA_CABANG) {
      filter.branch_id = req.user.branch_id;
    } else if (branch_id) {
      filter.branch_id = branch_id;
    }

    // Filter role
    if (role) {
      const roleDoc = await Role.findOne({ slug: role, company_id: req.user.company_id });
      if (roleDoc) {
        filter.role_id = roleDoc._id;
      }
    }

    // Filter status
    if (is_active !== undefined) {
      filter.is_active = is_active === 'true';
    }

    // Search
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Sort
    const sortObj = {};
    if (sort.startsWith('-')) {
      sortObj[sort.substring(1)] = -1;
    } else {
      sortObj[sort] = 1;
    }

    // Query
    const [users, total] = await Promise.all([
      User.find(filter)
        .populate('role_id', 'name slug')
        .populate('branch_id', 'name branch_code')
        .populate('employee_id', 'full_name')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter),
    ]);

    return paginatedResponse(res, users, total, pageNum, limitNum, 'Data pengguna berhasil dimuat');
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 * GET /api/v1/users/:id
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('role_id', 'name slug permissions')
      .populate('branch_id', 'name branch_code city')
      .populate('employee_id', 'full_name employee_code')
      .lean();

    if (!user) {
      return errorResponse(res, 'Pengguna tidak ditemukan', 'NOT_FOUND', HTTP_STATUS.NOT_FOUND);
    }

    return successResponse(res, user, 'Data pengguna berhasil dimuat');
  } catch (error) {
    next(error);
  }
};

/**
 * Create new user
 * POST /api/v1/users
 */
const createUser = async (req, res, next) => {
  try {
    // Validasi input
    const { error, value } = createUserSchema.validate(req.body, {
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

    // Set company_id dari user yang login
    value.company_id = req.user.company_id;

    // Cek username unik
    const existingUsername = await User.findOne({
      username: value.username,
      company_id: value.company_id,
    });
    if (existingUsername) {
      return errorResponse(
        res,
        'Username sudah digunakan.',
        'DUPLICATE_USERNAME',
        HTTP_STATUS.CONFLICT
      );
    }

    // Cek email unik
    const existingEmail = await User.findOne({
      email: value.email,
      company_id: value.company_id,
    });
    if (existingEmail) {
      return errorResponse(
        res,
        'Email sudah digunakan.',
        'DUPLICATE_EMAIL',
        HTTP_STATUS.CONFLICT
      );
    }

    // Validasi role
    const role = await Role.findById(value.role_id).lean();
    if (!role) {
      return errorResponse(res, 'Role tidak valid', 'INVALID_ROLE', HTTP_STATUS.BAD_REQUEST);
    }

    // Validasi branch wajib untuk role tertentu
    const rolesRequiringBranch = [ROLES.KEPALA_CABANG, ROLES.STAFF_ADMIN, ROLES.KASIR];
    if (rolesRequiringBranch.includes(role.slug) && !value.branch_id) {
      return errorResponse(
        res,
        `Cabang wajib dipilih untuk role ${role.name}.`,
        'BRANCH_REQUIRED',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Generate atau hash password
    const rawPassword = value.password || authService.generateRandomPassword(12);
    value.password_hash = await authService.hashPassword(rawPassword);
    delete value.password;

    // Create user
    const newUser = await User.create(value);

    // Populate untuk response
    const populatedUser = await User.findById(newUser._id)
      .populate('role_id', 'name slug')
      .populate('branch_id', 'name branch_code')
      .lean();

    // Log activity
    await ActivityLog.create({
      user_id: req.user.id,
      company_id: req.user.company_id,
      action: 'CREATE',
      module: 'users',
      table_affected: 'users',
      record_id: newUser._id,
      new_value: { username: value.username, email: value.email, role: role.slug },
      description: `Membuat pengguna baru: ${value.username}`,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
    });

    return successResponse(
      res,
      { ...populatedUser, generated_password: value.password ? undefined : rawPassword },
      'Pengguna berhasil dibuat',
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update user
 * PUT /api/v1/users/:id
 */
const updateUser = async (req, res, next) => {
  try {
    // Validasi input
    const { error, value } = updateUserSchema.validate(req.body, {
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

    const user = await User.findById(req.params.id)
      .populate('role_id', 'name slug is_system_role')
      .lean();

    if (!user) {
      return errorResponse(res, 'Pengguna tidak ditemukan', 'NOT_FOUND', HTTP_STATUS.NOT_FOUND);
    }

    // Admin sistem tidak bisa diedit oleh non-admin
    if (user.role_id?.is_system_role && req.user.role !== ROLES.ADMIN) {
      return errorResponse(
        res,
        'Anda tidak dapat mengedit admin sistem.',
        'FORBIDDEN',
        HTTP_STATUS.FORBIDDEN
      );
    }

    // Simpan old value untuk activity log
    const oldValue = {
      email: user.email,
      role_id: user.role_id?._id,
      branch_id: user.branch_id,
      is_active: user.is_active,
    };

    // Cek email unik jika diubah
    if (value.email && value.email !== user.email) {
      const existingEmail = await User.findOne({
        email: value.email,
        company_id: req.user.company_id,
        _id: { $ne: req.params.id },
      });
      if (existingEmail) {
        return errorResponse(res, 'Email sudah digunakan.', 'DUPLICATE_EMAIL', HTTP_STATUS.CONFLICT);
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(req.params.id, value, { new: true, runValidators: true })
      .populate('role_id', 'name slug')
      .populate('branch_id', 'name branch_code')
      .lean();

    // Log activity
    await ActivityLog.create({
      user_id: req.user.id,
      company_id: req.user.company_id,
      action: 'UPDATE',
      module: 'users',
      table_affected: 'users',
      record_id: req.params.id,
      old_value: oldValue,
      new_value: value,
      description: `Mengupdate pengguna: ${user.username}`,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
    });

    return successResponse(res, updatedUser, 'Pengguna berhasil diupdate');
  } catch (error) {
    next(error);
  }
};

/**
 * Soft delete user (set is_active = false)
 * DELETE /api/v1/users/:id
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('role_id', 'name slug is_system_role')
      .lean();

    if (!user) {
      return errorResponse(res, 'Pengguna tidak ditemukan', 'NOT_FOUND', HTTP_STATUS.NOT_FOUND);
    }

    // Tidak bisa hapus diri sendiri
    if (user._id.toString() === req.user.id.toString()) {
      return errorResponse(
        res,
        'Anda tidak dapat menonaktifkan akun sendiri.',
        'SELF_DELETE',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Tidak bisa hapus system admin
    if (user.role_id?.is_system_role) {
      return errorResponse(
        res,
        'Admin sistem tidak dapat dihapus.',
        'SYSTEM_ADMIN',
        HTTP_STATUS.FORBIDDEN
      );
    }

    // Soft delete
    await User.findByIdAndUpdate(req.params.id, { is_active: false });

    // Log activity
    await ActivityLog.create({
      user_id: req.user.id,
      company_id: req.user.company_id,
      action: 'DELETE',
      module: 'users',
      table_affected: 'users',
      record_id: req.params.id,
      description: `Menonaktifkan pengguna: ${user.username}`,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
    });

    return successResponse(res, null, 'Pengguna berhasil dinonaktifkan');
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password user
 * POST /api/v1/users/:id/reset-password
 */
const resetPassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return errorResponse(res, 'Pengguna tidak ditemukan', 'NOT_FOUND', HTTP_STATUS.NOT_FOUND);
    }

    // Generate new random password
    const newPassword = authService.generateRandomPassword(12);
    const hash = await authService.hashPassword(newPassword);

    user.password_hash = hash;
    user.password_changed_at = new Date();
    await user.save();

    // Log activity
    await ActivityLog.create({
      user_id: req.user.id,
      company_id: req.user.company_id,
      action: 'UPDATE',
      module: 'users',
      table_affected: 'users',
      record_id: req.params.id,
      description: `Reset password pengguna: ${user.username}`,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      is_sensitive: true,
    });

    // TODO: Kirim password baru via email

    return successResponse(res, {
      new_password: newPassword,
      message: 'Berikan password ini ke pengguna secara aman.',
    }, 'Password berhasil direset');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  usersPage,
  createPage,
  editPage,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
};
