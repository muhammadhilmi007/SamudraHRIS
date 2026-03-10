/**
 * ============================================================
 * SamudraHRD — Employee Routes
 * ============================================================
 */

'use strict';

const express = require('express');
const router = express.Router();
const multer = require('multer');

// Configure multer to use memory storage before processing with sharp
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const employeeController = require('../controllers/employees/employeeController');
const employeeDocumentController = require('../controllers/employees/employeeDocumentController');
const mutationController = require('../controllers/employees/mutationController');
const offboardingController = require('../controllers/employees/offboardingController');
const { authenticate } = require('../middlewares/authenticate');
const { checkPermission } = require('../middlewares/authorize');

// ============================================================
// View Routes
// ============================================================
router.get(
  '/mutasi',
  authenticate,
  checkPermission('employees', 'read'),
  mutationController.mutationListPage
);

router.get(
  '/karyawan', 
  authenticate, 
  checkPermission('employees', 'read'), 
  employeeController.employeesPage
);

router.get(
  '/karyawan/tambah', 
  authenticate, 
  checkPermission('employees', 'create'), 
  employeeController.createEmployeePage
);

router.get(
  '/karyawan/edit/:id', 
  authenticate, 
  checkPermission('employees', 'update'), 
  employeeController.editEmployeePage
);

router.get(
  '/karyawan/detail/:id',
  authenticate,
  checkPermission('employees', 'read'),
  employeeController.getEmployeeDetailPage
);

// ============================================================
// API Routes
// ============================================================
router.get(
  '/api/v1/employees', 
  authenticate, 
  checkPermission('employees', 'read'), 
  employeeController.getAllEmployees
);

router.post(
  '/api/v1/employees', 
  authenticate, 
  checkPermission('employees', 'create'), 
  employeeController.createEmployee
);

router.get(
  '/api/v1/employees/:id', 
  authenticate, 
  checkPermission('employees', 'read'), 
  employeeController.getEmployeeById
);

router.put(
  '/api/v1/employees/:id', 
  authenticate, 
  checkPermission('employees', 'update'), 
  employeeController.updateEmployee
);

router.post(
  '/api/v1/employees/:id/photo', 
  authenticate, 
  checkPermission('employees', 'update'),
  upload.single('photo'),
  employeeController.uploadPhoto
);

// ---- Document Management Routes ----
router.post(
  '/api/v1/employees/:id/documents',
  authenticate,
  checkPermission('employees', 'update'),
  employeeDocumentController.uploadDocument
);

router.delete(
  '/api/v1/employees/documents/:docId',
  authenticate,
  checkPermission('employees', 'update'),
  employeeDocumentController.deleteDocument
);

// ---- Salary Config Update Route ----
router.post(
  '/api/v1/employees/:id/salary-config',
  authenticate,
  checkPermission('employees', 'update'),
  employeeDocumentController.updateSalaryConfig
);

// ---- Mutation Routes ----
router.post(
  '/api/v1/employees/:id/mutate',
  authenticate,
  checkPermission('employees', 'update'),
  mutationController.createMutation
);

router.get(
  '/api/v1/employees/:id/mutations',
  authenticate,
  checkPermission('employees', 'read'),
  mutationController.getMutationHistory
);

// ---- Offboarding Routes ----
router.post(
  '/api/v1/employees/:id/offboard',
  authenticate,
  checkPermission('employees', 'update'),
  offboardingController.initiateOffboarding
);

router.post(
  '/api/v1/employees/:id/offboard/resolve-receivable',
  authenticate,
  checkPermission('employees', 'update'),
  offboardingController.resolveReceivable
);

router.post(
  '/api/v1/employees/:id/offboard/finalize',
  authenticate,
  checkPermission('employees', 'update'),
  offboardingController.finalizeOffboarding
);

module.exports = router;
