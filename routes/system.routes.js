/**
 * ============================================================
 * SamudraHRD — System Routes (Settings & Configurations)
 * ============================================================
 */

'use strict';

const express = require('express');
const router = express.Router();

const { authenticate } = require('../middlewares/authenticate');
const { checkPermission, requireRole } = require('../middlewares/authorize');
const { ROLES } = require('../config/constants');
const approvalFlowController = require('../controllers/system/approvalFlowController');

// ============================================================
// View Routes
// ============================================================
router.get(
  '/sistem/approval-flow',
  authenticate,
  checkPermission('settings', 'read'),
  approvalFlowController.approvalFlowPage
);

// ============================================================
// API Routes
// ============================================================
router.get(
  '/api/v1/approval-flows',
  authenticate,
  checkPermission('settings', 'read'),
  approvalFlowController.getApprovalFlows
);

router.post(
  '/api/v1/approval-flows',
  authenticate,
  checkPermission('settings', 'update'),
  approvalFlowController.upsertApprovalFlow
);

router.delete(
  '/api/v1/approval-flows/:id',
  authenticate,
  requireRole(ROLES.ADMIN),
  approvalFlowController.deleteApprovalFlow
);

module.exports = router;
