/**
 * ============================================================
 * SamudraHRD — Database Seeder
 * ============================================================
 * Seed data awal: Company, Branch, Roles (5), Admin User
 * 
 * Usage:
 *   node scripts/seed.js          → Seed (skip jika sudah ada)
 *   node scripts/seed.js --force  → Hapus data lama, seed ulang
 * ============================================================
 */

'use strict';

require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectDB } = require('../config/database');
const { Company, Branch, Role, User } = require('../models');

// ============================================================
// Default Permissions per Role
// ============================================================
const ROLE_PERMISSIONS = {
  admin: [
    'dashboard:read',
    'employees:read', 'employees:create', 'employees:update', 'employees:delete', 'employees:export',
    'attendance:read', 'attendance:create', 'attendance:update', 'attendance:approve', 'attendance:export',
    'payroll:read', 'payroll:create', 'payroll:update', 'payroll:approve', 'payroll:export',
    'receivables:read', 'receivables:create', 'receivables:update', 'receivables:approve', 'receivables:export',
    'reports:read', 'reports:export',
    'documents:read', 'documents:create', 'documents:update', 'documents:delete',
    'announcements:read', 'announcements:create', 'announcements:update', 'announcements:delete',
    'users:read', 'users:create', 'users:update', 'users:delete',
    'roles:read', 'roles:create', 'roles:update', 'roles:delete',
    'branches:read', 'branches:create', 'branches:update', 'branches:delete',
    'departments:read', 'departments:create', 'departments:update', 'departments:delete',
    'positions:read', 'positions:create', 'positions:update', 'positions:delete',
    'salary_levels:read', 'salary_levels:create', 'salary_levels:update', 'salary_levels:delete',
    'company:read', 'company:update',
    'settings:read', 'settings:update',
    'audit:read',
  ],
  manager_hrd: [
    'dashboard:read',
    'employees:read', 'employees:create', 'employees:update', 'employees:export',
    'attendance:read', 'attendance:update', 'attendance:approve', 'attendance:export',
    'payroll:read', 'payroll:create', 'payroll:approve', 'payroll:export',
    'receivables:read', 'receivables:approve', 'receivables:export',
    'reports:read', 'reports:export',
    'documents:read', 'documents:create', 'documents:update',
    'announcements:read', 'announcements:create', 'announcements:update',
    'users:read', 'users:create', 'users:update',
    'branches:read', 'branches:update',
    'departments:read', 'departments:create', 'departments:update',
    'positions:read', 'positions:create', 'positions:update',
    'salary_levels:read', 'salary_levels:create', 'salary_levels:update',
  ],
  kepala_cabang: [
    'dashboard:read',
    'employees:read', 'employees:create', 'employees:update', 'employees:export',
    'attendance:read', 'attendance:approve', 'attendance:export',
    'payroll:read', 'payroll:export',
    'receivables:read', 'receivables:create', 'receivables:approve',
    'reports:read', 'reports:export',
    'documents:read',
    'announcements:read',
  ],
  staff_admin: [
    'dashboard:read',
    'employees:read', 'employees:create', 'employees:update',
    'attendance:read', 'attendance:create', 'attendance:update',
    'receivables:read', 'receivables:create', 'receivables:update',
    'documents:read', 'documents:create',
    'announcements:read',
  ],
  kasir: [
    'dashboard:read',
    'attendance:read',
    'payroll:read',
    'receivables:read', 'receivables:update',
  ],
};

// ============================================================
// Seed Data
// ============================================================
const seedData = async () => {
  const isForce = process.argv.includes('--force');

  try {
    await connectDB();
    console.log('');

    if (isForce) {
      console.log('⚠️  Mode --force: Menghapus data lama...');
      await User.deleteMany({});
      await Role.deleteMany({});
      await Branch.deleteMany({});
      await Company.deleteMany({});
      console.log('   ✅ Data lama dihapus');
      console.log('');
    }

    // ---- 1. Company ----
    let company = await Company.findOne({ company_code: 'SMDR' });
    if (!company) {
      company = await Company.create({
        name: 'PT Samudra Sejahtera',
        legal_name: 'PT Samudra Sejahtera',
        company_code: 'SMDR',
        address: 'Jl. Sudirman No. 123',
        city: 'Jakarta Selatan',
        province: 'DKI Jakarta',
        postal_code: '12930',
        phone: '021-5551234',
        email: 'info@samudrahrd.com',
        is_active: true,
      });
      console.log('✅ Company created: ' + company.name);
    } else {
      console.log('ℹ️  Company sudah ada: ' + company.name);
    }

    // ---- 2. Branches ----
    const branchesData = [
      { branch_code: 'PST', name: 'Kantor Pusat', city: 'Jakarta Selatan', province: 'DKI Jakarta' },
      { branch_code: 'SBY', name: 'Cabang Surabaya', city: 'Surabaya', province: 'Jawa Timur' },
      { branch_code: 'MDN', name: 'Cabang Medan', city: 'Medan', province: 'Sumatera Utara' },
    ];

    const branches = {};
    for (const bd of branchesData) {
      let branch = await Branch.findOne({ company_id: company._id, branch_code: bd.branch_code });
      if (!branch) {
        branch = await Branch.create({
          company_id: company._id,
          ...bd,
          is_active: true,
        });
        console.log('✅ Branch created: ' + branch.name + ' (' + branch.branch_code + ')');
      } else {
        console.log('ℹ️  Branch sudah ada: ' + branch.name);
      }
      branches[bd.branch_code] = branch;
    }

    // ---- 3. Roles ----
    const rolesData = [
      { slug: 'admin', name: 'Administrator', description: 'Superadmin — akses penuh ke seluruh sistem', is_system_role: true },
      { slug: 'manager_hrd', name: 'Manager HRD', description: 'Manajer HRD — akses lintas cabang, approval payroll' },
      { slug: 'kepala_cabang', name: 'Kepala Cabang', description: 'Pimpinan cabang — approval presensi & piutang cabangnya' },
      { slug: 'staff_admin', name: 'Staff Admin', description: 'Staff administrasi cabang — input data karyawan & presensi' },
      { slug: 'kasir', name: 'Kasir', description: 'Kasir cabang — lihat data payroll & update cicilan piutang' },
    ];

    const roles = {};
    for (const rd of rolesData) {
      let role = await Role.findOne({ company_id: company._id, slug: rd.slug });
      if (!role) {
        role = await Role.create({
          company_id: company._id,
          ...rd,
          permissions: ROLE_PERMISSIONS[rd.slug] || [],
          is_active: true,
        });
        console.log('✅ Role created: ' + role.name + ' (' + role.slug + ') — ' + role.permissions.length + ' permissions');
      } else {
        console.log('ℹ️  Role sudah ada: ' + role.name);
      }
      roles[rd.slug] = role;
    }

    // ---- 4. Users ----
    const usersData = [
      {
        username: 'admin',
        email: 'admin@samudrahrd.com',
        password: 'Admin@123',
        role_slug: 'admin',
        branch_code: null, // Admin — no branch restriction
      },
      {
        username: 'hrd_manager',
        email: 'hrd@samudrahrd.com',
        password: 'Manager@123',
        role_slug: 'manager_hrd',
        branch_code: null,
      },
      {
        username: 'kepala_pst',
        email: 'kepala.pst@samudrahrd.com',
        password: 'Kepala@123',
        role_slug: 'kepala_cabang',
        branch_code: 'PST',
      },
      {
        username: 'staff_pst',
        email: 'staff.pst@samudrahrd.com',
        password: 'Staff@123',
        role_slug: 'staff_admin',
        branch_code: 'PST',
      },
      {
        username: 'kasir_pst',
        email: 'kasir.pst@samudrahrd.com',
        password: 'Kasir@123',
        role_slug: 'kasir',
        branch_code: 'PST',
      },
    ];

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  AKUN PENGGUNA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    for (const ud of usersData) {
      let user = await User.findOne({ username: ud.username, company_id: company._id });
      if (!user) {
        const salt = await bcrypt.genSalt(12);
        const hash = await bcrypt.hash(ud.password, salt);

        user = await User.create({
          company_id: company._id,
          username: ud.username,
          email: ud.email,
          password_hash: hash,
          role_id: roles[ud.role_slug]._id,
          branch_id: ud.branch_code ? branches[ud.branch_code]._id : null,
          is_active: true,
        });
        console.log('  ✅ ' + ud.username.padEnd(16) + ' | Password: ' + ud.password.padEnd(14) + ' | Role: ' + ud.role_slug);
      } else {
        console.log('  ℹ️  ' + ud.username.padEnd(16) + ' | (sudah ada)');
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('🎉 Seeding selesai!');
    console.log('');
    console.log('Login di http://localhost:3000/auth/login');
    console.log('  Username: admin');
    console.log('  Password: Admin@123');
    console.log('');

  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    if (error.code === 11000) {
      console.error('   Tip: Gunakan --force untuk seed ulang');
    }
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedData();
