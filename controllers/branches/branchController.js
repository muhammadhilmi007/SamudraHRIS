/**
 * ============================================================
 * SamudraHRD — Branch Controller
 * ============================================================
 * CRUD manajemen cabang + toggle active + view renderers.
 * ============================================================
 */

'use strict';

const { Branch, Employee, Company, ActivityLog } = require('../../models');
const { successResponse, errorResponse, paginatedResponse } = require('../../utils/responseHelper');
const { createBranchSchema, updateBranchSchema } = require('../../validators/branch.validator');
const { HTTP_STATUS, ROLES } = require('../../config/constants');

// ============================================================
// View Renderers
// ============================================================

/**
 * Render halaman daftar cabang (Card Grid)
 * GET /sistem/cabang
 */
async function branchesPage(req, res, next) {
  try {
    res.render('branches/index', {
      title: 'Data Cabang',
      subtitle: 'Master Data',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Render halaman detail cabang (Tabbed)
 * GET /sistem/cabang/:id
 */
async function branchDetailPage(req, res, next) {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.redirect('/sistem/cabang');
    }

    res.render('branches/detail', {
      title: `Detail Cabang — ${branch.name}`,
      subtitle: 'Detail Cabang',
      branch,
    });
  } catch (err) {
    next(err);
  }
}

// ============================================================
// API Handlers
// ============================================================

/**
 * Get all branches (with filter, sort, pagination)
 * GET /api/v1/branches
 */
async function getAllBranches(req, res, next) {
  try {
    const {
      page = 1,
      limit = 20,
      sort = 'name',
      order = 'asc',
      search,
      is_active,
      city,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter = {};
    if (is_active !== undefined && is_active !== '') {
      filter.is_active = is_active === 'true';
    }
    if (city) {
      filter.city = { $regex: city, $options: 'i' };
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { branch_code: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    // Sorting
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    // Query branches
    const [branches, total] = await Promise.all([
      Branch.find(filter).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Branch.countDocuments(filter),
    ]);

    // Aggregate employee counts per branch
    const employeeCounts = await Employee.aggregate([
      { $match: { is_active: true } },
      { $group: { _id: '$branch_id', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    employeeCounts.forEach((ec) => {
      countMap[ec._id.toString()] = ec.count;
    });

    // Attach employee count to each branch
    const data = branches.map((b) => ({
      ...b,
      employee_count: countMap[b._id.toString()] || 0,
    }));

    return paginatedResponse(res, data, total, pageNum, limitNum, 'Data cabang berhasil diambil');
  } catch (err) {
    next(err);
  }
}

/**
 * Get branch by ID (with stats)
 * GET /api/v1/branches/:id
 */
async function getBranchById(req, res, next) {
  try {
    const branch = await Branch.findById(req.params.id).lean();
    if (!branch) {
      return errorResponse(res, 'Cabang tidak ditemukan', 'NOT_FOUND', 404);
    }

    // Employee stats
    const [totalEmployees, activeEmployees] = await Promise.all([
      Employee.countDocuments({ branch_id: branch._id }),
      Employee.countDocuments({ branch_id: branch._id, is_active: true }),
    ]);

    branch.stats = {
      total_karyawan: totalEmployees,
      total_aktif: activeEmployees,
    };

    return successResponse(res, branch, 'Detail cabang berhasil diambil');
  } catch (err) {
    next(err);
  }
}

/**
 * Create new branch
 * POST /api/v1/branches
 */
async function createBranch(req, res, next) {
  try {
    // Validate input
    const { error, value } = createBranchSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      return errorResponse(res, 'Data tidak valid', 'VALIDATION_ERROR', 422, details);
    }

    // Get company_id — use the first company (single-tenant)
    const company = await Company.findOne();
    if (!company) {
      return errorResponse(res, 'Data perusahaan belum diatur', 'COMPANY_NOT_FOUND', 400);
    }

    // Check unique branch_code
    const existing = await Branch.findOne({
      company_id: company._id,
      branch_code: value.branch_code.toUpperCase(),
    });
    if (existing) {
      return errorResponse(
        res,
        `Kode cabang "${value.branch_code}" sudah digunakan`,
        'DUPLICATE_BRANCH_CODE',
        409
      );
    }

    // Create branch
    value.company_id = company._id;
    const branch = await Branch.create(value);

    // Activity log
    await ActivityLog.create({
      user_id: req.user.id,
      action: 'CREATE',
      module: 'branches',
      table_affected: 'branches',
      record_id: branch._id,
      new_value: value,
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
      description: `Cabang baru "${branch.name}" (${branch.branch_code}) dibuat oleh ${req.user.username}`,
    });

    return successResponse(res, branch, 'Cabang berhasil dibuat', 201);
  } catch (err) {
    next(err);
  }
}

/**
 * Update branch
 * PUT /api/v1/branches/:id
 */
async function updateBranch(req, res, next) {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return errorResponse(res, 'Cabang tidak ditemukan', 'NOT_FOUND', 404);
    }

    // Validate input
    const { error, value } = updateBranchSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      return errorResponse(res, 'Data tidak valid', 'VALIDATION_ERROR', 422, details);
    }

    // Save old values for audit
    const oldValue = {
      name: branch.name,
      address: branch.address,
      city: branch.city,
      geofence_radius: branch.geofence_radius,
      meal_allowance_rule: branch.meal_allowance_rule?.toObject?.() || branch.meal_allowance_rule,
      overtime_rule: branch.overtime_rule?.toObject?.() || branch.overtime_rule,
    };

    // Apply updates
    Object.assign(branch, value);
    await branch.save();

    // Activity log
    await ActivityLog.create({
      user_id: req.user.id,
      action: 'UPDATE',
      module: 'branches',
      table_affected: 'branches',
      record_id: branch._id,
      old_value: oldValue,
      new_value: value,
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
      description: `Cabang "${branch.name}" diupdate oleh ${req.user.username}`,
    });

    return successResponse(res, branch, 'Cabang berhasil diupdate');
  } catch (err) {
    next(err);
  }
}

/**
 * Toggle branch active status
 * PATCH /api/v1/branches/:id/toggle
 */
async function toggleActive(req, res, next) {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return errorResponse(res, 'Cabang tidak ditemukan', 'NOT_FOUND', 404);
    }

    // If deactivating, check for active employees
    if (branch.is_active) {
      const activeCount = await Employee.countDocuments({
        branch_id: branch._id,
        is_active: true,
      });
      if (activeCount > 0) {
        return errorResponse(
          res,
          `Tidak dapat menonaktifkan cabang yang masih memiliki ${activeCount} karyawan aktif`,
          'HAS_ACTIVE_EMPLOYEES',
          409
        );
      }
    }

    const oldStatus = branch.is_active;
    branch.is_active = !branch.is_active;
    await branch.save();

    // Activity log
    await ActivityLog.create({
      user_id: req.user.id,
      action: 'UPDATE',
      module: 'branches',
      table_affected: 'branches',
      record_id: branch._id,
      old_value: { is_active: oldStatus },
      new_value: { is_active: branch.is_active },
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
      description: `Cabang "${branch.name}" ${branch.is_active ? 'diaktifkan' : 'dinonaktifkan'} oleh ${req.user.username}`,
    });

    return successResponse(
      res,
      { is_active: branch.is_active },
      `Cabang berhasil ${branch.is_active ? 'diaktifkan' : 'dinonaktifkan'}`
    );
  } catch (err) {
    next(err);
  }
}

/**
 * Delete branch (hard delete — admin only)
 * DELETE /api/v1/branches/:id
 */
async function deleteBranch(req, res, next) {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return errorResponse(res, 'Cabang tidak ditemukan', 'NOT_FOUND', 404);
    }

    // Check for active employees
    const activeCount = await Employee.countDocuments({
      branch_id: branch._id,
      is_active: true,
    });
    if (activeCount > 0) {
      return errorResponse(
        res,
        `Tidak dapat menghapus cabang yang masih memiliki ${activeCount} karyawan aktif`,
        'HAS_ACTIVE_EMPLOYEES',
        409
      );
    }

    await Branch.findByIdAndDelete(branch._id);

    // Activity log
    await ActivityLog.create({
      user_id: req.user.id,
      action: 'DELETE',
      module: 'branches',
      table_affected: 'branches',
      record_id: branch._id,
      old_value: branch.toObject(),
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
      description: `Cabang "${branch.name}" (${branch.branch_code}) dihapus oleh ${req.user.username}`,
    });

    return successResponse(res, null, 'Cabang berhasil dihapus');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  branchesPage,
  branchDetailPage,
  getAllBranches,
  getBranchById,
  createBranch,
  updateBranch,
  toggleActive,
  deleteBranch,
};
