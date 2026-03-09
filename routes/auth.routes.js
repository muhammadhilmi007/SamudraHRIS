/**
 * ============================================================
 * SamudraHRD — Auth Routes
 * ============================================================
 * Routes untuk autentikasi: login, logout, refresh, change password.
 * ============================================================
 */

'use strict';

const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth/authController');
const { authenticate } = require('../middlewares/authenticate');

// ============================================================
// View Routes
// ============================================================
router.get('/auth/login', authController.loginPage);
router.get('/auth/logout', authenticate, authController.logout);

// ============================================================
// API Routes
// ============================================================
router.post('/api/v1/auth/login', authController.login);
router.post('/api/v1/auth/refresh', authController.refreshToken);
router.post('/api/v1/auth/logout', authenticate, authController.logout);
router.post('/api/v1/auth/change-password', authenticate, authController.changePassword);

module.exports = router;
