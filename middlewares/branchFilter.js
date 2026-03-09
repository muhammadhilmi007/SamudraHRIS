/**
 * ============================================================
 * SamudraHRD — Branch Filter Middleware
 * ============================================================
 * Auto-filter data berdasarkan branch untuk role tertentu.
 * - admin / manager_hrd → akses semua cabang (tidak difilter)
 * - kepala_cabang / staff_admin / kasir → hanya cabang sendiri
 * ============================================================
 */

'use strict';

const { ROLES } = require('../config/constants');

/**
 * Middleware: Attach req.branchFilter berdasarkan role user
 * Digunakan di controller untuk query:
 *   const filter = { ...req.branchFilter, is_active: true };
 *   const data = await Model.find(filter);
 */
const branchFilter = (req, res, next) => {
  if (!req.user) {
    req.branchFilter = {};
    return next();
  }

  // Admin dan Manager HRD — akses semua cabang
  if (
    req.user.role === ROLES.ADMIN ||
    req.user.role === ROLES.MANAGER_HRD
  ) {
    req.branchFilter = {};
  } else {
    // Kepala Cabang, Staff Admin, Kasir — hanya cabang sendiri
    req.branchFilter = { branch_id: req.user.branch_id };
  }

  next();
};

module.exports = { branchFilter };
