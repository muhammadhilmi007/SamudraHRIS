/**
 * ============================================================
 * SamudraHRD — User Routes
 * ============================================================
 * Routes untuk manajemen pengguna (CRUD + reset password).
 * ============================================================
 */

'use strict';

const express = require('express');
const router = express.Router();

const userController = require('../controllers/auth/userController');
const { authenticate } = require('../middlewares/authenticate');
const { checkPermission, requireRole } = require('../middlewares/authorize');
const { ROLES } = require('../config/constants');

// ============================================================
// View Routes (memerlukan autentikasi)
// ============================================================
router.get('/sistem/pengguna', authenticate, requireRole(ROLES.ADMIN, ROLES.MANAGER_HRD), userController.usersPage);
router.get('/sistem/pengguna/tambah', authenticate, requireRole(ROLES.ADMIN, ROLES.MANAGER_HRD), userController.createPage);
router.get('/sistem/pengguna/edit/:id', authenticate, requireRole(ROLES.ADMIN, ROLES.MANAGER_HRD), userController.editPage);

// ============================================================
// API Routes (memerlukan autentikasi + permission)
// ============================================================
router.get('/api/v1/users', authenticate, checkPermission('users', 'read'), userController.getAllUsers);
router.get('/api/v1/users/:id', authenticate, checkPermission('users', 'read'), userController.getUserById);
router.post('/api/v1/users', authenticate, checkPermission('users', 'create'), userController.createUser);
router.put('/api/v1/users/:id', authenticate, checkPermission('users', 'update'), userController.updateUser);
router.delete('/api/v1/users/:id', authenticate, checkPermission('users', 'delete'), userController.deleteUser);
router.post('/api/v1/users/:id/reset-password', authenticate, checkPermission('users', 'update'), userController.resetPassword);

module.exports = router;
