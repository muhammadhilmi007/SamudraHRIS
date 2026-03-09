/**
 * ============================================================
 * SamudraHRD — Organization Routes
 * ============================================================
 * Routes: Department, Position, SalaryLevel, Org Chart
 * ============================================================
 */

'use strict';

const express = require('express');
const router = express.Router();

const org = require('../controllers/branches/orgController');
const { authenticate } = require('../middlewares/authenticate');
const { checkPermission, requireRole } = require('../middlewares/authorize');
const { ROLES } = require('../config/constants');

// ============================================================
// View Routes
// ============================================================
router.get('/departemen', authenticate, requireRole(ROLES.ADMIN, ROLES.MANAGER_HRD), org.organizationPage);
router.get('/org-chart', authenticate, org.orgChartPage);

// ============================================================
// API — Department
// ============================================================
router.get('/api/v1/departments', authenticate, checkPermission('departments', 'read'), org.getAllDepartments);
router.get('/api/v1/departments/:id', authenticate, checkPermission('departments', 'read'), org.getDepartmentById);
router.post('/api/v1/departments', authenticate, checkPermission('departments', 'create'), org.createDepartment);
router.put('/api/v1/departments/:id', authenticate, checkPermission('departments', 'update'), org.updateDepartment);
router.patch('/api/v1/departments/:id/set-head', authenticate, checkPermission('departments', 'update'), org.setDepartmentHead);
router.delete('/api/v1/departments/:id', authenticate, requireRole(ROLES.ADMIN), org.deleteDepartment);

// ============================================================
// API — Position
// ============================================================
router.get('/api/v1/positions', authenticate, checkPermission('positions', 'read'), org.getAllPositions);
router.get('/api/v1/positions/:id', authenticate, checkPermission('positions', 'read'), org.getPositionById);
router.post('/api/v1/positions', authenticate, checkPermission('positions', 'create'), org.createPosition);
router.put('/api/v1/positions/:id', authenticate, checkPermission('positions', 'update'), org.updatePosition);
router.delete('/api/v1/positions/:id', authenticate, requireRole(ROLES.ADMIN), org.deletePosition);

// ============================================================
// API — Salary Level
// ============================================================
router.get('/api/v1/salary-levels', authenticate, checkPermission('salary_levels', 'read'), org.getAllSalaryLevels);
router.get('/api/v1/salary-levels/:id', authenticate, checkPermission('salary_levels', 'read'), org.getSalaryLevelById);
router.get('/api/v1/salary-levels/:id/positions', authenticate, checkPermission('salary_levels', 'read'), org.getSalaryLevelPositions);
router.post('/api/v1/salary-levels', authenticate, checkPermission('salary_levels', 'create'), org.createSalaryLevel);
router.put('/api/v1/salary-levels/:id', authenticate, checkPermission('salary_levels', 'update'), org.updateSalaryLevel);
router.delete('/api/v1/salary-levels/:id', authenticate, requireRole(ROLES.ADMIN), org.deleteSalaryLevel);

// ============================================================
// API — Org Chart
// ============================================================
router.get('/api/v1/org-chart', authenticate, org.getOrgChart);

module.exports = router;
