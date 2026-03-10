/**
 * ============================================================
 * SamudraHRD — Employee Controller
 * ============================================================
 */

'use strict';

const mongoose = require('mongoose');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const { Employee, SalaryConfig, Branch, Department, Position, ActivityLog, EmployeeDocument, Attendance, Receivable } = require('../../models');
const EmployeeService = require('../../services/EmployeeService');
const { createEmployeeSchema, updateEmployeeSchema } = require('../../validators/employee.validator');
const { successResponse, errorResponse } = require('../../utils/responseHelper');

// ============================================================
// View Renderers
// ============================================================

async function employeesPage(req, res, next) {
  try {
    const branches = await Branch.find({ company_id: req.user.company_id, is_active: true });
    const departments = await Department.find({ company_id: req.user.company_id, is_active: true });
    const positions = await Position.find({ company_id: req.user.company_id, is_active: true });
    
    res.render('employees/index', {
      title: 'Data Karyawan',
      subtitle: 'Karyawan',
      branches,
      departments,
      positions
    });
  } catch (err) { next(err); }
}

async function createEmployeePage(req, res, next) {
  try {
    const branches = await Branch.find({ company_id: req.user.company_id, is_active: true });
    res.render('employees/create', {
      title: 'Tambah Karyawan Baru',
      subtitle: 'Karyawan',
      branches,
    });
  } catch (err) { next(err); }
}

async function editEmployeePage(req, res, next) {
    try {
        const employee = await Employee.findOne({ _id: req.params.id, company_id: req.user.company_id })
            .populate('branch_id')
            .populate('department_id')
            .populate('position_id');

        if (!employee) return res.status(404).render('errors/404', { message: 'Karyawan tidak ditemukan' });

        const branches = await Branch.find({ company_id: req.user.company_id, is_active: true });
        
        res.render('employees/edit', {
            title: 'Edit Data Karyawan',
            subtitle: 'Karyawan',
            branches,
            employee: employee.toJSON(),
            moment
        });
    } catch (err) { next(err); }
}

async function getEmployeeDetailPage(req, res, next) {
    try {
        const employee = await Employee.findOne({ _id: req.params.id, company_id: req.user.company_id })
            .populate('branch_id')
            .populate('department_id')
            .populate('position_id');

        if (!employee) return res.status(404).render('errors/404', { message: 'Karyawan tidak ditemukan' });

        // Get Documents
        const documents = await EmployeeDocument.find({ employee_id: employee._id }).sort({ uploaded_at: -1 });
        
        // Get Salary Configs (Current + History)
        const salaryConfigs = await SalaryConfig.find({ employee_id: employee._id })
            .populate('created_by', 'name')
            .sort({ effective_date: -1 });
            
        // Get Attendance Recap Limit 3 months (Dummies for now if zero, or fetch from DB)
        const attendances = await Attendance.find({ employee_id: employee._id })
            .sort({ check_in_time: -1 })
            .limit(30)
            .lean();

        // Get Summary Receivables
        const receivables = await Receivable.find({ employee_id: employee._id }).sort({ created_at: -1 }).lean();
        
        let totalReceivable = 0;
        let totalPaid = 0;
        let totalRemaining = 0;
        receivables.forEach(r => {
            totalReceivable += r.amount;
            totalPaid += r.paid_amount;
            totalRemaining += r.remaining_amount;
        });

        res.render('employees/detail', {
            title: `Profil: ${employee.full_name}`,
            subtitle: 'Karyawan',
            employee: employee.toJSON(),
            documents,
            salaryConfigs,
            currentSalary: salaryConfigs.find(s => s.is_current === true) || null,
            attendances,
            receivables,
            receivableSummary: { totalReceivable, totalPaid, totalRemaining },
            moment
        });

    } catch (err) { next(err); }
}

// ============================================================
// API Endpoints
// ============================================================

async function getAllEmployees(req, res, next) {
  try {
    const { 
      page = 1, limit = 10, search, 
      branch_id, department_id, position_id, status, payment_cycle, is_active 
    } = req.query;

    const query = { company_id: req.user.company_id };

    // Apply branch filter middleware logic (staff admin / kacab)
    if (req.branchFilter && req.branchFilter.branch_id) {
      query.branch_id = req.branchFilter.branch_id;
    } else if (branch_id) {
      query.branch_id = branch_id;
    }

    if (department_id) query.department_id = department_id;
    if (position_id) query.position_id = position_id;
    if (status) query.status = status;
    if (payment_cycle) query.payment_cycle = payment_cycle;
    if (is_active !== undefined) query.is_active = is_active === 'true';

    if (search) {
      query.$or = [
        { full_name: { $regex: search, $options: 'i' } },
        { employee_code: { $regex: search, $options: 'i' } },
        { nik: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Using aggregate to join current salary config optimally
    const employeesPipeline = [
      { $match: query },
      { $sort: { full_name: 1, employee_code: 1 } },
      { $skip: skip },
      { $limit: Number(limit) },
      
      // Populate Branch, Dept, Position
      {
        $lookup: {
          from: 'branches',
          localField: 'branch_id',
          foreignField: '_id',
          as: 'branch'
        }
      },
      { $unwind: { path: '$branch', preserveNullAndEmptyArrays: true } },
      
      {
        $lookup: {
          from: 'departments',
          localField: 'department_id',
          foreignField: '_id',
          as: 'department'
        }
      },
      { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: 'positions',
          localField: 'position_id',
          foreignField: '_id',
          as: 'position'
        }
      },
      { $unwind: { path: '$position', preserveNullAndEmptyArrays: true } },

      // Populate current SalaryConfig
      {
        $lookup: {
          from: 'salary_configs',
          let: { empId: '$_id' },
          pipeline: [
            { $match: { $expr: { $and: [ { $eq: ['$employee_id', '$$empId'] }, { $eq: ['$is_current', true] } ] } } },
            { $limit: 1 }
          ],
          as: 'salary_config'
        }
      },
      { $unwind: { path: '$salary_config', preserveNullAndEmptyArrays: true } }
    ];

    const employeesData = await Employee.aggregate(employeesPipeline);
    
    // Create actual Mongoose Documents from aggregate to use virtuals (age, tenure)
    const docs = employeesData.map(e => {
        const doc = new Employee(e);
        const obj = doc.toJSON(); // getting virtuals
        obj.branch = e.branch;
        obj.department = e.department;
        obj.position = e.position;
        obj.salary_config = e.salary_config;
        return obj;
    });

    const totalDoc = await Employee.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: 'Data karyawan berhasil diambil',
      data: docs,
      meta: {
        total: totalDoc,
        page: Number(page),
        limit: Number(limit),
        total_pages: Math.ceil(totalDoc / Number(limit))
      }
    });

  } catch (err) { next(err); }
}

async function getEmployeeById(req, res, next) {
  try {
    const employee = await Employee.findOne({ _id: req.params.id, company_id: req.user.company_id })
      .populate('branch_id', 'name code')
      .populate('department_id', 'name code')
      .populate('position_id', 'name code level');

    if (!employee) return errorResponse(res, 'Karyawan tidak ditemukan', 'NOT_FOUND', 404);

    const salary_config = await SalaryConfig.findOne({ employee_id: employee._id, is_current: true }).lean();
    
    // Using lean object + virtuals
    const result = employee.toJSON();
    result.salary_config = salary_config;

    return successResponse(res, result, 'Data detail karyawan berhasil diambil');
  } catch (err) { next(err); }
}

async function createEmployee(req, res, next) {
  try {
    const { error, value } = createEmployeeSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return errorResponse(res, 'Data tidak valid', 'VALIDATION_ERROR', 422, 
        error.details.map(d => ({ field: d.path.join('.'), message: d.message })));
    }

    const company_id = req.user.company_id;

    // Check NIK unique
    const existingNik = await Employee.findOne({ company_id, nik: value.nik });
    if (existingNik) {
      return errorResponse(res, 'NIK sudah terdaftar', 'DUPLICATE_ERROR', 400);
    }

    const branch = await Branch.findById(value.branch_id);
    if (!branch) {
      return errorResponse(res, 'Cabang tidak ditemukan', 'NOT_FOUND', 404);
    }

    // 1. Generate Employee Code
    const employee_code = await EmployeeService.generateEmployeeCode(branch.branch_code, value.status, company_id);
    
    // 2. Build Employee object
    const employeeData = {
      ...value,
      company_id,
      employee_code
    };
    
    // 3. Remove salary from object before saving employee
    const salaryData = value.salary;
    delete employeeData.salary;

    // 4. Create Employee
    const employee = new Employee(employeeData);

    // 5. Generate QR Code with ID
    const qr_code_url = await EmployeeService.generateQRCode(employee_code);
    employee.qr_code_url = qr_code_url;
    employee.qr_code_data = `samudraHRD:${employee_code}:${Date.now()}`;

    await employee.save();

    // 6. Create initial Salary Config
    const salaryConfig = new SalaryConfig({
      ...salaryData,
      employee_id: employee._id,
      effective_date: new Date(),
      created_by: req.user.id,
      notes: 'Konfigurasi gaji awal (Auto-generated)'
    });
    await salaryConfig.save();

    // 7. Log Activity
    await ActivityLog.create({
      company_id,
      user_id: req.user.id,
      action: 'CREATE',
      module: 'employees',
      table_affected: 'employees',
      record_id: employee._id,
      new_value: employee.toObject(),
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
      description: `Menambah data karyawan baru: ${employee.full_name} (${employee_code})`,
    });

    return successResponse(res, employee, 'Karyawan berhasil didaftarkan', 201);
  } catch (err) {
    next(err);
  }
}

async function updateEmployee(req, res, next) {
  try {
    const { error, value } = updateEmployeeSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return errorResponse(res, 'Data tidak valid', 'VALIDATION_ERROR', 422, 
        error.details.map(d => ({ field: d.path.join('.'), message: d.message })));
    }

    const employee = await Employee.findOne({ _id: req.params.id, company_id: req.user.company_id });
    if (!employee) return errorResponse(res, 'Karyawan tidak ditemukan', 'NOT_FOUND', 404);

    const old_value = employee.toObject();

    Object.assign(employee, value);

    if (value.is_active === false && old_value.is_active === true) {
      employee.deactivated_at = new Date();
      employee.deactivated_by = req.user.id;
    }

    await employee.save();

    await ActivityLog.create({
      company_id: req.user.company_id,
      user_id: req.user.id,
      action: 'UPDATE',
      module: 'employees',
      table_affected: 'employees',
      record_id: employee._id,
      old_value,
      new_value: employee.toObject(),
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
      description: `Mengupdate data karyawan: ${employee.full_name} (${employee.employee_code})`,
    });

    return successResponse(res, employee, 'Data karyawan berhasil diupdate');
  } catch (err) { next(err); }
}

async function uploadPhoto(req, res, next) {
  try {
    if (!req.file) return errorResponse(res, 'File foto tidak ditemukan', 'BAD_REQUEST', 400);

    const employee = await Employee.findOne({ _id: req.params.id, company_id: req.user.company_id });
    if (!employee) return errorResponse(res, 'Karyawan tidak ditemukan', 'NOT_FOUND', 404);

    const uploadDir = path.join(__dirname, '../../public/uploads/employees');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const fileName = `${employee.employee_code}_${Date.now()}.jpg`;
    const filePath = path.join(uploadDir, fileName);

    // Resize and optimize using sharp
    await sharp(req.file.buffer)
      .resize(400, 400, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toFile(filePath);

    employee.photo_url = `/uploads/employees/${fileName}`;
    await employee.save();

    await ActivityLog.create({
      company_id: req.user.company_id,
      user_id: req.user.id,
      action: 'UPDATE',
      module: 'employees',
      table_affected: 'employees',
      record_id: employee._id,
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
      description: `Mengupdate foto profil karyawan: ${employee.full_name}`,
    });

    return successResponse(res, { photo_url: employee.photo_url }, 'Foto berhasil diunggah');
  } catch (err) { next(err); }
}

module.exports = {
  employeesPage,
  createEmployeePage,
  editEmployeePage,
  getEmployeeDetailPage,
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  uploadPhoto
};
