'use strict';

const mongoose = require('mongoose');
const { Employee, MutationHistory, SalaryConfig, Branch, ActivityLog } = require('../../models');
const { errorResponse, successResponse } = require('../../utils/responseHelper');

/**
 * Mutasi Karyawan
 * GET /mutasi (View Page)
 */
async function mutationListPage(req, res, next) {
    try {
        const companyId = req.user.company_id;

        const histories = await MutationHistory.find({ company_id: companyId })
            .populate('employee_id', 'full_name employee_code')
            .populate('from_branch_id', 'name code')
            .populate('to_branch_id', 'name code')
            .populate('from_department_id', 'name')
            .populate('to_department_id', 'name')
            .populate('from_position_id', 'name')
            .populate('to_position_id', 'name')
            .populate('approved_by', 'name')
            .sort({ effective_date: -1 });

        res.render('employees/mutations', {
            title: 'Riwayat Mutasi Karyawan',
            subtitle: 'Karyawan',
            histories,
            moment: require('moment')
        });
    } catch (err) {
        next(err);
    }
}

/**
 * Mutasi Karyawan
 * POST /api/v1/employees/:id/mutate
 */
async function createMutation(req, res, next) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const employeeId = req.params.id;
        const companyId = req.user.company_id;
        const { to_branch_id, to_department_id, to_position_id, effective_date, reason } = req.body;

        // 1. Get Employee
        const employee = await Employee.findOne({ _id: employeeId, company_id: companyId })
            .populate('branch_id')
            .session(session);

        if (!employee) {
            await session.abortTransaction();
            session.endSession();
            return errorResponse(res, 'Karyawan tidak ditemukan', 'NOT_FOUND', 404);
        }

        // 2. Validations
        if (new Date(effective_date) < new Date(new Date().setHours(0,0,0,0))) {
            await session.abortTransaction();
            session.endSession();
            return errorResponse(res, 'Tanggal efektif mutasi tidak boleh di masa lalu', 'BAD_REQUEST', 400);
        }

        const isBranchChange = to_branch_id && to_branch_id !== employee.branch_id?._id.toString();
        const isPositionChange = to_position_id && to_position_id !== employee.position_id?.toString();
        const isDepartmentChange = to_department_id && to_department_id !== employee.department_id?.toString();

        if (!isBranchChange && !isPositionChange && !isDepartmentChange) {
            await session.abortTransaction();
            session.endSession();
            return errorResponse(res, 'Tidak ada perubahan mutasi yang dipilih', 'BAD_REQUEST', 400);
        }

        let mutationType = 'department_change';
        if (isBranchChange && isPositionChange) mutationType = 'branch_and_position';
        else if (isBranchChange) mutationType = 'branch_transfer';
        else if (isPositionChange) mutationType = 'position_change';

        // 3. Get / Adjust Salary Config
        const currentConfig = await SalaryConfig.findOne({ 
            employee_id: employee._id, 
            is_current: true 
        }).session(session);

        let newConfigId = null;

        if (currentConfig) {
            // Close old config
            currentConfig.is_current = false;
            currentConfig.end_date = new Date(effective_date);
            await currentConfig.save({ session });

            // Prepare new config
            const newConfigData = {
                employee_id: employee._id,
                base_salary: currentConfig.base_salary,
                tenure_allowance: currentConfig.tenure_allowance,
                position_allowance: currentConfig.position_allowance,
                performance_allowance: currentConfig.performance_allowance,
                daily_rate: currentConfig.daily_rate,
                meal_allowance: currentConfig.meal_allowance,
                fuel_allowance: currentConfig.fuel_allowance,
                overtime_rate_per_hour: currentConfig.overtime_rate_per_hour,
                bonus: currentConfig.bonus,
                is_current: true,
                effective_date: new Date(effective_date),
                created_by: req.user.id,
                notes: `Auto-generated dari mutasi (${mutationType})`
            };

            // If branch changed, adjust specific allowances to new branch rules
            if (isBranchChange) {
                 const toBranch = await Branch.findById(to_branch_id).session(session);
                 if(toBranch) {
                    newConfigData.meal_allowance = toBranch.meal_allowance_rule ? toBranch.meal_allowance_rule.amount : 0;
                    newConfigData.overtime_rate_per_hour = toBranch.overtime_rule ? toBranch.overtime_rule.rate_per_hour : 0;
                 }
            }

            const newConfig = new SalaryConfig(newConfigData);
            await newConfig.save({ session });
            newConfigId = newConfig._id;
        }

        // 4. Create Mutation History
        const mutationCount = await MutationHistory.countDocuments({ company_id: companyId }).session(session);
        const mutationNumber = `MUT-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}-${String(mutationCount + 1).padStart(4, '0')}`;

        const mutationHistory = new MutationHistory({
            employee_id: employee._id,
            mutation_number: mutationNumber,
            mutation_type: mutationType,
            from_branch_id: employee.branch_id._id,
            from_department_id: employee.department_id,
            from_position_id: employee.position_id,
            from_salary_config_id: currentConfig ? currentConfig._id : null,
            to_branch_id: to_branch_id || employee.branch_id._id,
            to_department_id: to_department_id || employee.department_id,
            to_position_id: to_position_id || employee.position_id,
            to_salary_config_id: newConfigId,
            effective_date: new Date(effective_date),
            reason: reason,
            approved_by: req.user.id,
            status: 'approved' // Auto approve for now based on prompt flow
        });

        await mutationHistory.save({ session });

        // 5. Update Employee Data
        if (to_branch_id) employee.branch_id = to_branch_id;
        if (to_department_id) employee.department_id = to_department_id;
        if (to_position_id) employee.position_id = to_position_id;
        // Flag for cron prorata calculation
        employee.prorata_processed = false; 
        
        await employee.save({ session });

        // 6. Log Activity
        await ActivityLog.create([{
            company_id: companyId,
            user_id: req.user.id,
            action: 'MUTATE_EMPLOYEE',
            module: 'employees',
            table_affected: 'mutation_histories',
            record_id: mutationHistory._id,
            ip_address: req.ip,
            user_agent: req.get('user-agent'),
            description: `Mutasi karyawan ${employee.full_name} (${mutationType})`,
        }], { session });

        await session.commitTransaction();
        session.endSession();

        // TODO: Notification to Telegram

        return successResponse(res, mutationHistory, 'Mutasi berhasil diproses');
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        next(err);
    }
}

/**
 * Dapatkan Riwayat Mutasi Karyawan
 * GET /api/v1/employees/:id/mutations
 */
async function getMutationHistory(req, res, next) {
    try {
        const employeeId = req.params.id;
        const companyId = req.user.company_id;

        const employee = await Employee.findOne({ _id: employeeId, company_id: companyId });
        if (!employee) return errorResponse(res, 'Karyawan tidak ditemukan', 'NOT_FOUND', 404);

        const histories = await MutationHistory.find({ employee_id: employeeId })
            .populate('from_branch_id', 'name code')
            .populate('to_branch_id', 'name code')
            .populate('from_department_id', 'name')
            .populate('to_department_id', 'name')
            .populate('from_position_id', 'name')
            .populate('to_position_id', 'name')
            .populate('approved_by', 'name')
            .sort({ effective_date: -1 });

        return successResponse(res, histories, 'Riwayat mutasi berhasil diambil');
    } catch (err) {
        next(err);
    }
}

module.exports = {
    mutationListPage,
    createMutation,
    getMutationHistory
};
