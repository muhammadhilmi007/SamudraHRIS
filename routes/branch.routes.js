/**
 * ============================================================
 * SamudraHRD — Branch Routes
 * ============================================================
 * Routes untuk manajemen cabang (CRUD + toggle).
 * ============================================================
 */

'use strict';

const express = require('express');
const router = express.Router();

const branchController = require('../controllers/branches/branchController');
const { authenticate } = require('../middlewares/authenticate');
const { checkPermission, requireRole } = require('../middlewares/authorize');
const { ROLES } = require('../config/constants');

// ============================================================
// View Routes (memerlukan autentikasi)
// ============================================================
router.get(
  '/sistem/cabang',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.MANAGER_HRD),
  branchController.branchesPage
);
router.get(
  '/sistem/cabang/:id',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.MANAGER_HRD),
  branchController.branchDetailPage
);

// ============================================================
// API Routes (memerlukan autentikasi + permission)
// ============================================================
router.get(
  '/api/v1/branches',
  authenticate,
  checkPermission('branches', 'read'),
  branchController.getAllBranches
);
router.get(
  '/api/v1/branches/:id',
  authenticate,
  checkPermission('branches', 'read'),
  branchController.getBranchById
);
router.post(
  '/api/v1/branches',
  authenticate,
  checkPermission('branches', 'create'),
  branchController.createBranch
);
router.put(
  '/api/v1/branches/:id',
  authenticate,
  checkPermission('branches', 'update'),
  branchController.updateBranch
);
router.patch(
  '/api/v1/branches/:id/toggle',
  authenticate,
  checkPermission('branches', 'update'),
  branchController.toggleActive
);
router.delete(
  '/api/v1/branches/:id',
  authenticate,
  requireRole(ROLES.ADMIN),
  branchController.deleteBranch
);

module.exports = router;
