/**
 * ============================================================
 * SamudraHRD — Approval Flow Controller
 * ============================================================
 */

'use strict';

const { ApprovalFlow, Role, Company, ActivityLog } = require('../../models');
const { successResponse, errorResponse } = require('../../utils/responseHelper');
const { upsertApprovalFlowSchema } = require('../../validators/approvalFlow.validator');

// ============================================================
// View Renderer
// ============================================================

async function approvalFlowPage(req, res, next) {
  try {
    const company = await Company.findOne();
    const roles = await Role.find({ company_id: company?._id, is_active: true }).sort('name').lean();
    
    // Group flows by module
    const flows = await ApprovalFlow.find({ company_id: company?._id })
      .populate('approver_role_id', 'name slug')
      .sort('module level')
      .lean();

    const groupedFlows = {
      receivables: flows.filter(f => f.module === 'receivables'),
      leave_requests: flows.filter(f => f.module === 'leave_requests'),
      overtime_requests: flows.filter(f => f.module === 'overtime_requests'),
      attendance_manual: flows.filter(f => f.module === 'attendance_manual'),
      payroll: flows.filter(f => f.module === 'payroll'),
      mutation: flows.filter(f => f.module === 'mutation'),
    };

    res.render('settings/approval-flows', {
      title: 'Konfigurasi Alur Persetujuan',
      subtitle: 'Sistem',
      roles,
      groupedFlows,
    });
  } catch (err) { next(err); }
}

// ============================================================
// API Endpoints
// ============================================================

async function getApprovalFlows(req, res, next) {
  try {
    const company = await Company.findOne();
    const flows = await ApprovalFlow.find({ company_id: company?._id })
      .populate('approver_role_id', 'name slug')
      .sort('module level')
      .lean();

    return successResponse(res, flows, 'Data alur persetujuan berhasil diambil');
  } catch (err) { next(err); }
}

async function upsertApprovalFlow(req, res, next) {
  try {
    const { error, value } = upsertApprovalFlowSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return errorResponse(res, 'Data tidak valid', 'VALIDATION_ERROR', 422, 
      error.details.map(d => ({ field: d.path.join('.'), message: d.message })));

    const company = await Company.findOne();
    if (!company) return errorResponse(res, 'Data perusahaan belum diatur', 'COMPANY_NOT_FOUND', 400);

    const role = await Role.findOne({ _id: value.approver_role_id, company_id: company._id });
    if (!role) return errorResponse(res, 'Role approver tidak ditemukan', 'ROLE_NOT_FOUND', 404);

    value.company_id = company._id;
    value.approver_role_slug = role.slug;

    // Check if flow already exists for this module + level
    let flow = await ApprovalFlow.findOne({ 
      company_id: company._id, 
      module: value.module, 
      level: value.level 
    });

    let action = 'CREATE';
    let old_value = null;

    if (flow) {
      action = 'UPDATE';
      old_value = flow.toObject();
      Object.assign(flow, value);
      await flow.save();
    } else {
      flow = await ApprovalFlow.create(value);
    }

    await ActivityLog.create({
      company_id: company._id,
      user_id: req.user.id,
      action,
      module: 'approval_flows',
      table_affected: 'approval_flows',
      record_id: flow._id,
      old_value,
      new_value: value,
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
      description: `Alur persetujuan "${flow.name}" (${flow.module} - Level ${flow.level}) di${action === 'CREATE' ? 'buat' : 'update'} oleh ${req.user.username}`,
    });

    return successResponse(res, flow, `Alur persetujuan berhasil di${action === 'CREATE' ? 'buat' : 'update'}`, action === 'CREATE' ? 201 : 200);
  } catch (err) { next(err); }
}

async function deleteApprovalFlow(req, res, next) {
  try {
    const flow = await ApprovalFlow.findById(req.params.id);
    if (!flow) return errorResponse(res, 'Alur persetujuan tidak ditemukan', 'NOT_FOUND', 404);

    await flow.deleteOne();

    await ActivityLog.create({
      company_id: flow.company_id,
      user_id: req.user.id,
      action: 'DELETE',
      module: 'approval_flows',
      table_affected: 'approval_flows',
      record_id: flow._id,
      old_value: flow.toObject(),
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
      description: `Alur persetujuan "${flow.name}" dinonaktifkan/dihapus oleh ${req.user.username}`,
    });

    return successResponse(res, null, 'Alur persetujuan berhasil dihapus');
  } catch (err) { next(err); }
}

module.exports = {
  approvalFlowPage,
  getApprovalFlows,
  upsertApprovalFlow,
  deleteApprovalFlow,
};
