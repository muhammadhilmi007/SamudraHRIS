'use strict';

const mongoose = require('mongoose');
const { Employee, Receivable, ActivityLog, User } = require('../../models');
const { errorResponse, successResponse } = require('../../utils/responseHelper');

/**
 * Initiate Offboarding (Check Debts)
 * POST /api/v1/employees/:id/offboard
 */
async function initiateOffboarding(req, res, next) {
    try {
        const employeeId = req.params.id;
        const companyId = req.user.company_id;
        const { resign_date, resign_reason, last_working_date } = req.body;

        const employee = await Employee.findOne({ _id: employeeId, company_id: companyId });
        if (!employee) return errorResponse(res, 'Karyawan tidak ditemukan', 'NOT_FOUND', 404);

        if (!employee.is_active) {
            return errorResponse(res, 'Karyawan sudah non-aktif', 'BAD_REQUEST', 400);
        }

        // Check active receivables
        const activeReceivables = await Receivable.find({
            employee_id: employeeId,
            status: { $in: ['active', 'draft'] }, 
            remaining_amount: { $gt: 0 }
        });

        if (activeReceivables.length > 0) {
            let totalRemaining = 0;
            activeReceivables.forEach(r => { totalRemaining += r.remaining_amount; });

            return res.status(409).json({
                success: false,
                error: {
                    code: 'ACTIVE_RECEIVABLE_EXISTS',
                    message: 'Karyawan masih memiliki piutang aktif',
                    data: {
                        receivables: activeReceivables,
                        total_remaining: totalRemaining,
                        options: ['salary_deduction', 'direct_payment']
                    }
                }
            });
        }

        // If no debts, we can proceed to finalize straight away via frontend
        return successResponse(res, {
            ready_to_finalize: true,
            resign_date,
            resign_reason,
            last_working_date
        }, 'Karyawan siap di-offboard');

    } catch (err) { next(err); }
}

/**
 * Resolve Receivable Choice
 * POST /api/v1/employees/:id/offboard/resolve-receivable
 */
async function resolveReceivable(req, res, next) {
    try {
        const employeeId = req.params.id;
        const companyId = req.user.company_id;
        const { resolution_method } = req.body; // 'salary_deduction' or 'direct_payment'

        const employee = await Employee.findOne({ _id: employeeId, company_id: companyId });
        if (!employee) return errorResponse(res, 'Karyawan tidak ditemukan', 'NOT_FOUND', 404);

        if (!['salary_deduction', 'direct_payment'].includes(resolution_method)) {
            return errorResponse(res, 'Metode penyelesaian tidak valid', 'BAD_REQUEST', 400);
        }

        const activeReceivables = await Receivable.find({
            employee_id: employeeId,
            status: { $in: ['active', 'draft'] },
            remaining_amount: { $gt: 0 }
        });

        // We could just add a flag or note in the receivables, 
        // For simplicity, we add notes for the HR/Finance
        for (const rec of activeReceivables) {
            rec.notes = (rec.notes || '') + `\n[RESOLVED OFFBOARDING] Diselesaikan melalui: ${resolution_method}`;
            if(resolution_method === 'salary_deduction'){
                // Accelerate installment to max
                rec.installment_amount = rec.remaining_amount; 
            }
            await rec.save();
        }

        return successResponse(res, null, `Metode penyelesaian piutang diset ke: ${resolution_method}`);
    } catch(err) { next(err); }
}

/**
 * Finalize Offboarding
 * POST /api/v1/employees/:id/offboard/finalize
 */
async function finalizeOffboarding(req, res, next) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const employeeId = req.params.id;
        const companyId = req.user.company_id;
        const { resign_date, resign_reason } = req.body;

        const employee = await Employee.findOne({ _id: employeeId, company_id: companyId }).session(session);
        if (!employee) {
            await session.abortTransaction();
            session.endSession();
            return errorResponse(res, 'Karyawan tidak ditemukan', 'NOT_FOUND', 404);
        }

        // 1. Deactivate Employee
        employee.is_active = false;
        employee.resign_date = new Date(resign_date || Date.now());
        employee.resign_reason = resign_reason || 'Pemberhentian / Resign';
        employee.deactivated_at = new Date();
        await employee.save({ session });

        // 2. Deactivate User Account (if any)
        if (employee.user_account_id) {
            await User.updateOne(
                { _id: employee.user_account_id },
                { $set: { is_active: false } }
            ).session(session);
        }

        // 3. Log Activity
        await ActivityLog.create([{
            company_id: companyId,
            user_id: req.user.id,
            action: 'DEACTIVATE_EMPLOYEE',
            module: 'employees',
            table_affected: 'employees',
            record_id: employee._id,
            ip_address: req.ip,
            user_agent: req.get('user-agent'),
            description: `Menonaktifkan karyawan: ${employee.full_name}. Alasan: ${resign_reason}`,
        }], { session });

        await session.commitTransaction();
        session.endSession();

        return successResponse(res, employee, 'Karyawan berhasil dinonaktifkan (Offboarded)');
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        next(err);
    }
}

module.exports = {
    initiateOffboarding,
    resolveReceivable,
    finalizeOffboarding
};
