/**
 * ============================================================
 * SamudraHRD — Organization Controller
 * ============================================================
 * CRUD untuk Department, Position, SalaryLevel + Org Chart.
 * ============================================================
 */

'use strict';

const {
  Department, Position, SalaryLevel, Employee,
  Company, ActivityLog,
} = require('../../models');
const { successResponse, errorResponse, paginatedResponse } = require('../../utils/responseHelper');
const {
  createDepartmentSchema, updateDepartmentSchema,
  createPositionSchema, updatePositionSchema,
  createSalaryLevelSchema, updateSalaryLevelSchema,
} = require('../../validators/org.validator');

// ============================================================
// View Renderers
// ============================================================

async function organizationPage(req, res, next) {
  try {
    const company = await Company.findOne();
    const [departments, salaryLevels] = await Promise.all([
      Department.find({ company_id: company?._id, is_active: true }).sort('name').lean(),
      SalaryLevel.find({ company_id: company?._id, is_active: true }).sort('grade').lean(),
    ]);
    res.render('settings/organization', {
      title: 'Departemen, Jabatan & Grade Gaji',
      subtitle: 'Master Data',
      departments,
      salaryLevels,
    });
  } catch (err) { next(err); }
}

async function orgChartPage(req, res, next) {
  try {
    res.render('settings/org-chart', {
      title: 'Struktur Organisasi',
      subtitle: 'Master Data',
    });
  } catch (err) { next(err); }
}

// ============================================================
// ██████ DEPARTMENT ██████
// ============================================================

async function getAllDepartments(req, res, next) {
  try {
    const { search, is_active, page = 1, limit = 50 } = req.query;
    const company = await Company.findOne();
    const filter = { company_id: company?._id };

    if (is_active !== undefined && is_active !== '') filter.is_active = is_active === 'true';
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
    ];

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [departments, total] = await Promise.all([
      Department.find(filter).sort('name').skip(skip).limit(limitNum)
        .populate('head_employee_id', 'full_name employee_code')
        .populate('parent_department_id', 'name code')
        .lean(),
      Department.countDocuments(filter),
    ]);

    // Counts: positions & employees per department
    const [posCounts, empCounts] = await Promise.all([
      Position.aggregate([
        { $match: { company_id: company?._id, is_active: true } },
        { $group: { _id: '$department_id', count: { $sum: 1 } } },
      ]),
      Employee.aggregate([
        { $match: { is_active: true } },
        { $group: { _id: '$department_id', count: { $sum: 1 } } },
      ]),
    ]);
    const posMap = {};
    posCounts.forEach(p => { posMap[p._id?.toString()] = p.count; });
    const empMap = {};
    empCounts.forEach(e => { empMap[e._id?.toString()] = e.count; });

    const data = departments.map(d => ({
      ...d,
      position_count: posMap[d._id.toString()] || 0,
      employee_count: empMap[d._id.toString()] || 0,
    }));

    return paginatedResponse(res, data, total, pageNum, limitNum, 'Data departemen berhasil diambil');
  } catch (err) { next(err); }
}

async function getDepartmentById(req, res, next) {
  try {
    const dept = await Department.findById(req.params.id)
      .populate('head_employee_id', 'full_name employee_code')
      .populate('parent_department_id', 'name code')
      .lean();
    if (!dept) return errorResponse(res, 'Departemen tidak ditemukan', 'NOT_FOUND', 404);
    return successResponse(res, dept, 'Detail departemen');
  } catch (err) { next(err); }
}

async function createDepartment(req, res, next) {
  try {
    const { error, value } = createDepartmentSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return errorResponse(res, 'Data tidak valid', 'VALIDATION_ERROR', 422,
      error.details.map(d => ({ field: d.path.join('.'), message: d.message })));

    const company = await Company.findOne();
    if (!company) return errorResponse(res, 'Data perusahaan belum diatur', 'COMPANY_NOT_FOUND', 400);

    const existing = await Department.findOne({ company_id: company._id, code: value.code });
    if (existing) return errorResponse(res, `Kode departemen "${value.code}" sudah digunakan`, 'DUPLICATE_CODE', 409);

    value.company_id = company._id;
    const dept = await Department.create(value);

    await ActivityLog.create({
      company_id: company._id, user_id: req.user.id, action: 'CREATE', module: 'departments',
      table_affected: 'departments', record_id: dept._id, new_value: value,
      ip_address: req.ip, user_agent: req.get('user-agent'),
      description: `Departemen "${dept.name}" (${dept.code}) dibuat oleh ${req.user.username}`,
    });

    return successResponse(res, dept, 'Departemen berhasil dibuat', 201);
  } catch (err) { next(err); }
}

async function updateDepartment(req, res, next) {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return errorResponse(res, 'Departemen tidak ditemukan', 'NOT_FOUND', 404);

    const { error, value } = updateDepartmentSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return errorResponse(res, 'Data tidak valid', 'VALIDATION_ERROR', 422,
      error.details.map(d => ({ field: d.path.join('.'), message: d.message })));

    // Check unique code if changed
    if (value.code && value.code !== dept.code) {
      const existing = await Department.findOne({ company_id: dept.company_id, code: value.code, _id: { $ne: dept._id } });
      if (existing) return errorResponse(res, `Kode "${value.code}" sudah digunakan`, 'DUPLICATE_CODE', 409);
    }

    const oldValue = dept.toObject();
    Object.assign(dept, value);
    await dept.save();

    await ActivityLog.create({
      company_id: dept.company_id, user_id: req.user.id, action: 'UPDATE', module: 'departments',
      table_affected: 'departments', record_id: dept._id, old_value: oldValue, new_value: value,
      ip_address: req.ip, user_agent: req.get('user-agent'),
      description: `Departemen "${dept.name}" diupdate oleh ${req.user.username}`,
    });

    return successResponse(res, dept, 'Departemen berhasil diupdate');
  } catch (err) { next(err); }
}

async function setDepartmentHead(req, res, next) {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return errorResponse(res, 'Departemen tidak ditemukan', 'NOT_FOUND', 404);

    const { head_employee_id } = req.body;
    if (!head_employee_id) return errorResponse(res, 'head_employee_id wajib diisi', 'VALIDATION_ERROR', 422);

    const employee = await Employee.findOne({ _id: head_employee_id, is_active: true });
    if (!employee) return errorResponse(res, 'Karyawan tidak ditemukan atau tidak aktif', 'NOT_FOUND', 404);

    const oldHead = dept.head_employee_id;
    dept.head_employee_id = head_employee_id;
    await dept.save();

    await ActivityLog.create({
      company_id: dept.company_id, user_id: req.user.id, action: 'UPDATE', module: 'departments',
      table_affected: 'departments', record_id: dept._id,
      old_value: { head_employee_id: oldHead }, new_value: { head_employee_id },
      ip_address: req.ip, user_agent: req.get('user-agent'),
      description: `Kepala departemen "${dept.name}" diubah ke ${employee.full_name} oleh ${req.user.username}`,
    });

    return successResponse(res, dept, 'Kepala departemen berhasil diubah');
  } catch (err) { next(err); }
}

async function deleteDepartment(req, res, next) {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return errorResponse(res, 'Departemen tidak ditemukan', 'NOT_FOUND', 404);

    const posCount = await Position.countDocuments({ department_id: dept._id, is_active: true });
    if (posCount > 0) return errorResponse(res, `Tidak dapat menghapus departemen yang masih memiliki ${posCount} jabatan aktif`, 'HAS_ACTIVE_POSITIONS', 409);

    // Soft delete
    dept.is_active = false;
    await dept.save();

    await ActivityLog.create({
      company_id: dept.company_id, user_id: req.user.id, action: 'DELETE', module: 'departments',
      table_affected: 'departments', record_id: dept._id, old_value: dept.toObject(),
      ip_address: req.ip, user_agent: req.get('user-agent'),
      description: `Departemen "${dept.name}" (${dept.code}) dinonaktifkan oleh ${req.user.username}`,
    });

    return successResponse(res, null, 'Departemen berhasil dinonaktifkan');
  } catch (err) { next(err); }
}

// ============================================================
// ██████ POSITION ██████
// ============================================================

async function getAllPositions(req, res, next) {
  try {
    const { search, department_id, is_active, page = 1, limit = 50 } = req.query;
    const company = await Company.findOne();
    const filter = { company_id: company?._id };

    if (is_active !== undefined && is_active !== '') filter.is_active = is_active === 'true';
    if (department_id) filter.department_id = department_id;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
    ];

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [positions, total] = await Promise.all([
      Position.find(filter).sort('level name').skip(skip).limit(limitNum)
        .populate('department_id', 'name code')
        .populate('salary_level_id', 'name grade min_salary max_salary')
        .lean(),
      Position.countDocuments(filter),
    ]);

    // Employee counts per position
    const empCounts = await Employee.aggregate([
      { $match: { is_active: true } },
      { $group: { _id: '$position_id', count: { $sum: 1 } } },
    ]);
    const empMap = {};
    empCounts.forEach(e => { empMap[e._id?.toString()] = e.count; });

    const data = positions.map(p => ({
      ...p,
      employee_count: empMap[p._id.toString()] || 0,
    }));

    return paginatedResponse(res, data, total, pageNum, limitNum, 'Data jabatan berhasil diambil');
  } catch (err) { next(err); }
}

async function getPositionById(req, res, next) {
  try {
    const pos = await Position.findById(req.params.id)
      .populate('department_id', 'name code')
      .populate('salary_level_id', 'name grade min_salary max_salary')
      .lean();
    if (!pos) return errorResponse(res, 'Jabatan tidak ditemukan', 'NOT_FOUND', 404);
    return successResponse(res, pos, 'Detail jabatan');
  } catch (err) { next(err); }
}

async function createPosition(req, res, next) {
  try {
    const { error, value } = createPositionSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return errorResponse(res, 'Data tidak valid', 'VALIDATION_ERROR', 422,
      error.details.map(d => ({ field: d.path.join('.'), message: d.message })));

    const company = await Company.findOne();
    if (!company) return errorResponse(res, 'Data perusahaan belum diatur', 'COMPANY_NOT_FOUND', 400);

    // Validate department exists
    const dept = await Department.findOne({ _id: value.department_id, company_id: company._id });
    if (!dept) return errorResponse(res, 'Departemen tidak ditemukan', 'DEPARTMENT_NOT_FOUND', 404);

    // Unique code check
    const existing = await Position.findOne({ company_id: company._id, code: value.code });
    if (existing) return errorResponse(res, `Kode jabatan "${value.code}" sudah digunakan`, 'DUPLICATE_CODE', 409);

    value.company_id = company._id;
    const pos = await Position.create(value);

    await ActivityLog.create({
      company_id: company._id, user_id: req.user.id, action: 'CREATE', module: 'positions',
      table_affected: 'positions', record_id: pos._id, new_value: value,
      ip_address: req.ip, user_agent: req.get('user-agent'),
      description: `Jabatan "${pos.name}" (${pos.code}) dibuat oleh ${req.user.username}`,
    });

    return successResponse(res, pos, 'Jabatan berhasil dibuat', 201);
  } catch (err) { next(err); }
}

async function updatePosition(req, res, next) {
  try {
    const pos = await Position.findById(req.params.id);
    if (!pos) return errorResponse(res, 'Jabatan tidak ditemukan', 'NOT_FOUND', 404);

    const { error, value } = updatePositionSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return errorResponse(res, 'Data tidak valid', 'VALIDATION_ERROR', 422,
      error.details.map(d => ({ field: d.path.join('.'), message: d.message })));

    if (value.code && value.code !== pos.code) {
      const existing = await Position.findOne({ company_id: pos.company_id, code: value.code, _id: { $ne: pos._id } });
      if (existing) return errorResponse(res, `Kode "${value.code}" sudah digunakan`, 'DUPLICATE_CODE', 409);
    }

    const oldValue = pos.toObject();
    Object.assign(pos, value);
    await pos.save();

    await ActivityLog.create({
      company_id: pos.company_id, user_id: req.user.id, action: 'UPDATE', module: 'positions',
      table_affected: 'positions', record_id: pos._id, old_value: oldValue, new_value: value,
      ip_address: req.ip, user_agent: req.get('user-agent'),
      description: `Jabatan "${pos.name}" diupdate oleh ${req.user.username}`,
    });

    return successResponse(res, pos, 'Jabatan berhasil diupdate');
  } catch (err) { next(err); }
}

async function deletePosition(req, res, next) {
  try {
    const pos = await Position.findById(req.params.id);
    if (!pos) return errorResponse(res, 'Jabatan tidak ditemukan', 'NOT_FOUND', 404);

    const empCount = await Employee.countDocuments({ position_id: pos._id, is_active: true });
    if (empCount > 0) return errorResponse(res, `Tidak dapat menghapus jabatan yang masih memiliki ${empCount} karyawan aktif`, 'HAS_ACTIVE_EMPLOYEES', 409);

    pos.is_active = false;
    await pos.save();

    await ActivityLog.create({
      company_id: pos.company_id, user_id: req.user.id, action: 'DELETE', module: 'positions',
      table_affected: 'positions', record_id: pos._id, old_value: pos.toObject(),
      ip_address: req.ip, user_agent: req.get('user-agent'),
      description: `Jabatan "${pos.name}" (${pos.code}) dinonaktifkan oleh ${req.user.username}`,
    });

    return successResponse(res, null, 'Jabatan berhasil dinonaktifkan');
  } catch (err) { next(err); }
}

// ============================================================
// ██████ SALARY LEVEL ██████
// ============================================================

async function getAllSalaryLevels(req, res, next) {
  try {
    const { search, is_active, page = 1, limit = 50 } = req.query;
    const company = await Company.findOne();
    const filter = { company_id: company?._id };

    if (is_active !== undefined && is_active !== '') filter.is_active = is_active === 'true';
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { grade: { $regex: search, $options: 'i' } },
    ];

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [levels, total] = await Promise.all([
      SalaryLevel.find(filter).sort('grade').skip(skip).limit(limitNum).lean(),
      SalaryLevel.countDocuments(filter),
    ]);

    // Positions count per salary level
    const posCounts = await Position.aggregate([
      { $match: { company_id: company?._id, is_active: true, salary_level_id: { $ne: null } } },
      { $group: { _id: '$salary_level_id', count: { $sum: 1 } } },
    ]);
    const posMap = {};
    posCounts.forEach(p => { posMap[p._id?.toString()] = p.count; });

    const data = levels.map(l => ({
      ...l,
      position_count: posMap[l._id.toString()] || 0,
    }));

    return paginatedResponse(res, data, total, pageNum, limitNum, 'Data grade gaji berhasil diambil');
  } catch (err) { next(err); }
}

async function getSalaryLevelById(req, res, next) {
  try {
    const level = await SalaryLevel.findById(req.params.id).lean();
    if (!level) return errorResponse(res, 'Grade gaji tidak ditemukan', 'NOT_FOUND', 404);
    return successResponse(res, level, 'Detail grade gaji');
  } catch (err) { next(err); }
}

async function getSalaryLevelPositions(req, res, next) {
  try {
    const level = await SalaryLevel.findById(req.params.id).lean();
    if (!level) return errorResponse(res, 'Grade gaji tidak ditemukan', 'NOT_FOUND', 404);

    const positions = await Position.find({ salary_level_id: level._id, is_active: true })
      .populate('department_id', 'name code')
      .sort('department_id name')
      .lean();

    return successResponse(res, positions, 'Daftar jabatan untuk grade ini');
  } catch (err) { next(err); }
}

async function createSalaryLevel(req, res, next) {
  try {
    const { error, value } = createSalaryLevelSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return errorResponse(res, 'Data tidak valid', 'VALIDATION_ERROR', 422,
      error.details.map(d => ({ field: d.path.join('.'), message: d.message })));

    const company = await Company.findOne();
    if (!company) return errorResponse(res, 'Data perusahaan belum diatur', 'COMPANY_NOT_FOUND', 400);

    const existing = await SalaryLevel.findOne({ company_id: company._id, grade: value.grade });
    if (existing) return errorResponse(res, `Grade "${value.grade}" sudah digunakan`, 'DUPLICATE_GRADE', 409);

    value.company_id = company._id;
    const level = await SalaryLevel.create(value);

    await ActivityLog.create({
      company_id: company._id, user_id: req.user.id, action: 'CREATE', module: 'salary_levels',
      table_affected: 'salary_levels', record_id: level._id, new_value: value,
      ip_address: req.ip, user_agent: req.get('user-agent'),
      description: `Grade gaji "${level.name}" (${level.grade}) dibuat oleh ${req.user.username}`,
    });

    return successResponse(res, level, 'Grade gaji berhasil dibuat', 201);
  } catch (err) { next(err); }
}

async function updateSalaryLevel(req, res, next) {
  try {
    const level = await SalaryLevel.findById(req.params.id);
    if (!level) return errorResponse(res, 'Grade gaji tidak ditemukan', 'NOT_FOUND', 404);

    const { error, value } = updateSalaryLevelSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return errorResponse(res, 'Data tidak valid', 'VALIDATION_ERROR', 422,
      error.details.map(d => ({ field: d.path.join('.'), message: d.message })));

    if (value.grade && value.grade !== level.grade) {
      const existing = await SalaryLevel.findOne({ company_id: level.company_id, grade: value.grade, _id: { $ne: level._id } });
      if (existing) return errorResponse(res, `Grade "${value.grade}" sudah digunakan`, 'DUPLICATE_GRADE', 409);
    }

    const oldValue = level.toObject();
    Object.assign(level, value);
    await level.save();

    await ActivityLog.create({
      company_id: level.company_id, user_id: req.user.id, action: 'UPDATE', module: 'salary_levels',
      table_affected: 'salary_levels', record_id: level._id, old_value: oldValue, new_value: value,
      ip_address: req.ip, user_agent: req.get('user-agent'),
      description: `Grade gaji "${level.name}" diupdate oleh ${req.user.username}`,
    });

    return successResponse(res, level, 'Grade gaji berhasil diupdate');
  } catch (err) { next(err); }
}

async function deleteSalaryLevel(req, res, next) {
  try {
    const level = await SalaryLevel.findById(req.params.id);
    if (!level) return errorResponse(res, 'Grade gaji tidak ditemukan', 'NOT_FOUND', 404);

    const posCount = await Position.countDocuments({ salary_level_id: level._id, is_active: true });
    if (posCount > 0) return errorResponse(res, `Tidak dapat menghapus grade yang masih digunakan oleh ${posCount} jabatan`, 'HAS_POSITIONS', 409);

    level.is_active = false;
    await level.save();

    await ActivityLog.create({
      company_id: level.company_id, user_id: req.user.id, action: 'DELETE', module: 'salary_levels',
      table_affected: 'salary_levels', record_id: level._id, old_value: level.toObject(),
      ip_address: req.ip, user_agent: req.get('user-agent'),
      description: `Grade gaji "${level.name}" (${level.grade}) dinonaktifkan oleh ${req.user.username}`,
    });

    return successResponse(res, null, 'Grade gaji berhasil dinonaktifkan');
  } catch (err) { next(err); }
}

// ============================================================
// ██████ ORG CHART ██████
// ============================================================

async function getOrgChart(req, res, next) {
  try {
    const company = await Company.findOne();
    const departments = await Department.find({ company_id: company?._id, is_active: true })
      .populate('head_employee_id', 'full_name employee_code')
      .sort('name').lean();

    const positions = await Position.find({ company_id: company?._id, is_active: true })
      .populate('department_id', 'name code')
      .sort('level name').lean();

    // Build hierarchy
    const chart = departments.map(dept => ({
      id: dept._id,
      name: dept.name,
      code: dept.code,
      head: dept.head_employee_id ? {
        name: dept.head_employee_id.full_name,
        code: dept.head_employee_id.employee_code,
      } : null,
      parent_id: dept.parent_department_id || null,
      positions: positions
        .filter(p => p.department_id?._id?.toString() === dept._id.toString())
        .map(p => ({
          id: p._id,
          name: p.name,
          code: p.code,
          level: p.level,
        })),
    }));

    return successResponse(res, chart, 'Struktur organisasi');
  } catch (err) { next(err); }
}

module.exports = {
  organizationPage,
  orgChartPage,
  // Department
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  setDepartmentHead,
  deleteDepartment,
  // Position
  getAllPositions,
  getPositionById,
  createPosition,
  updatePosition,
  deletePosition,
  // Salary Level
  getAllSalaryLevels,
  getSalaryLevelById,
  getSalaryLevelPositions,
  createSalaryLevel,
  updateSalaryLevel,
  deleteSalaryLevel,
  // Org Chart
  getOrgChart,
};
