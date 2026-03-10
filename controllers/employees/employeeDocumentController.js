'use strict';

const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Employee, EmployeeDocument, SalaryConfig, ActivityLog } = require('../../models');
const { errorResponse, successResponse } = require('../../utils/responseHelper');

// Setup multer storage for Documents (Local Storage)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../../public/uploads/documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique name: docType-employeeId-timestamp.ext
    const docType = req.body.doc_type || 'other';
    const employeeId = req.params.id;
    const ext = path.extname(file.originalname);
    cb(null, `${docType}-${employeeId}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB Limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format file tidak didukung. Hanya PDF, JPG, PNG, DOC, DOCX.'));
    }
  }
}).single('file');

/**
 * Upload Document Handler
 */
async function uploadDocument(req, res, next) {
  upload(req, res, async function (err) {
    if (err) {
      return errorResponse(res, err.message, 'UPLOAD_ERROR', 400);
    }

    try {
      if (!req.file) {
        return errorResponse(res, 'File dokumen tidak ditemukan', 'BAD_REQUEST', 400);
      }

      const { doc_type, doc_name, notes } = req.body;
      const employeeId = req.params.id;
      const companyId = req.user.company_id;

      // Validate employee existence
      const employee = await Employee.findOne({ _id: employeeId, company_id: companyId });
      if (!employee) {
        fs.unlinkSync(req.file.path); // Remove uploaded file
        return errorResponse(res, 'Karyawan tidak ditemukan', 'NOT_FOUND', 404);
      }

      // Determine file_type string from mimetype
      let fileTypeStr = 'other';
      if (req.file.mimetype === 'application/pdf') fileTypeStr = 'pdf';
      else if (req.file.mimetype.includes('image/')) fileTypeStr = req.file.mimetype.split('/')[1];
      else if (req.file.mimetype.includes('wordprocessingml')) fileTypeStr = 'docx';
      else if (req.file.mimetype.includes('msword')) fileTypeStr = 'doc';

      // Save to database
      const newDocument = new EmployeeDocument({
        employee_id: employee._id,
        doc_type: doc_type,
        doc_name: doc_name || req.file.originalname,
        file_url: `/uploads/documents/${req.file.filename}`,
        file_type: fileTypeStr,
        file_size_kb: Math.round(req.file.size / 1024),
        notes: notes,
        uploaded_by: req.user.id
      });

      await newDocument.save();

      // Log Activity
      await ActivityLog.create({
        company_id: companyId,
        user_id: req.user.id,
        action: 'CREATE',
        module: 'employees',
        table_affected: 'employee_documents',
        record_id: newDocument._id,
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
        description: `Mengunggah dokumen ${doc_type} untuk karyawan: ${employee.full_name}`,
      });

      return successResponse(res, newDocument, 'Dokumen berhasil diunggah', 201);
    } catch (saveErr) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      next(saveErr);
    }
  });
}

/**
 * Delete Document Handler
 */
async function deleteDocument(req, res, next) {
  try {
    const { docId } = req.params;
    
    const document = await EmployeeDocument.findById(docId).populate('employee_id');
    if (!document || document.employee_id.company_id.toString() !== req.user.company_id.toString()) {
        return errorResponse(res, 'Dokumen tidak ditemukan', 'NOT_FOUND', 404);
    }

    // Try to remove file from fs
    const filePath = path.join(__dirname, '../../../public', document.file_url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await document.deleteOne();

    await ActivityLog.create({
        company_id: req.user.company_id,
        user_id: req.user.id,
        action: 'DELETE',
        module: 'employees',
        table_affected: 'employee_documents',
        record_id: document._id,
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
        description: `Menghapus dokumen ${document.doc_type} milik karyawan: ${document.employee_id.full_name}`,
    });

    return successResponse(res, null, 'Dokumen berhasil dihapus');
  } catch (err) {
    next(err);
  }
}

/**
 * Update Salary Config (History Logic)
 */
async function updateSalaryConfig(req, res, next) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const employeeId = req.params.id;
        const companyId = req.user.company_id;
        const newSalaryData = req.body;

        const employee = await Employee.findOne({ _id: employeeId, company_id: companyId }).session(session);
        if(!employee) {
            await session.abortTransaction();
            session.endSession();
            return errorResponse(res, 'Karyawan tidak ditemukan', 'NOT_FOUND', 404);
        }

        // Close old salary config
        await SalaryConfig.updateMany(
            { employee_id: employee._id, is_current: true },
            { $set: { is_current: false, end_date: new Date() } }
        ).session(session);

        // Insert new config
        const newConfig = new SalaryConfig({
            ...newSalaryData,
            employee_id: employee._id,
            is_current: true,
            effective_date: new Date(),
            created_by: req.user.id,
            notes: newSalaryData.notes || 'Pembaruan konfigurasi gaji manual'
        });

        await newConfig.save({ session });

        await ActivityLog.create([{
            company_id: companyId,
            user_id: req.user.id,
            action: 'UPDATE',
            module: 'employees',
            table_affected: 'salary_configs',
            record_id: newConfig._id,
            ip_address: req.ip,
            user_agent: req.get('user-agent'),
            description: `Memperbarui konfigurasi gaji untuk: ${employee.full_name}`,
        }], { session });

        await session.commitTransaction();
        session.endSession();

        return successResponse(res, newConfig, 'Konfigurasi gaji berhasil diperbarui');
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        next(err);
    }
}

module.exports = {
  uploadDocument,
  deleteDocument,
  updateSalaryConfig
};
