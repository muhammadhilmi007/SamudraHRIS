/**
 * =================================================================
 * SIHAPAY — Sistem Informasi HRD, Absensi, dan Payroll
 * MongoDB Schema Index — Mongoose ODM
 *
 * Tech Stack : Node.js + Express.js + MongoDB + Mongoose
 * Versi      : 1.0 MVP
 *
 * RINGKASAN COLLECTIONS (35 total):
 * =================================================================
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │  GRUP              │ COLLECTIONS                            │
 * ├─────────────────────────────────────────────────────────────┤
 * │  Core System (7)   │ companies, branches, departments,      │
 * │                    │ positions, roles, users,               │
 * │                    │ approval_flows                         │
 * ├─────────────────────────────────────────────────────────────┤
 * │  Karyawan / HR (6) │ employees, employee_documents,         │
 * │                    │ salary_configs, salary_levels,         │
 * │                    │ salary_histories, mutation_histories   │
 * ├─────────────────────────────────────────────────────────────┤
 * │  Presensi (8)      │ work_schedules, holidays,              │
 * │                    │ attendances, attendance_recaps,        │
 * │                    │ leave_types, leave_requests,           │
 * │                    │ overtime_settings, overtime_requests   │
 * ├─────────────────────────────────────────────────────────────┤
 * │  Payroll (5)       │ payrolls, payroll_details,             │
 * │                    │ salary_slips, salary_components,       │
 * │                    │ financial_journals                     │
 * ├─────────────────────────────────────────────────────────────┤
 * │  Piutang (4)       │ receivables, receivable_installments,  │
 * │                    │ receivable_payments, receivable_       │
 * │                    │ settings                              │
 * ├─────────────────────────────────────────────────────────────┤
 * │  System (5)        │ document_templates, hr_documents,      │
 * │                    │ announcements, notifications,          │
 * │                    │ activity_logs                          │
 * └─────────────────────────────────────────────────────────────┘
 *
 * KONVENSI PENAMAAN:
 *   - Collection  : snake_case plural  (employees, payroll_details)
 *   - Model JS    : PascalCase         (Employee, PayrollDetail)
 *   - File        : kebab-case.model   (employee.model.js)
 *   - Field FK    : snake_case + _id   (employee_id, branch_id)
 *
 * POLA RELASI MONGODB:
 *   Referencing (ObjectId ref) — untuk entitas besar & banyak diakses
 *   Embedding  (Sub-schema)   — untuk data kecil & selalu diakses bersama
 *
 * TTL INDEX:
 *   activity_logs.timestamp   → expires after 2 years (63,072,000 sec)
 *   notifications.read_at     → expires after 90 days (7,776,000 sec)
 *                               hanya untuk notifikasi yang sudah dibaca
 * =================================================================
 */

// ---- Core System ----
const Company       = require('./company.model');
const Branch        = require('./branch.model');
const { Department, Position } = require('./department-position.model');
const { Role, User } = require('./role-user.model');
const ApprovalFlow  = require('./approval-flow.model');

// ---- Karyawan / HR ----
const Employee      = require('./employee.model');
const {
  EmployeeDocument,
  SalaryConfig,
  SalaryLevel,
  SalaryHistory,
  MutationHistory,
} = require('./employee-related.model');

// ---- Presensi & Jadwal ----
const {
  WorkSchedule,
  Holiday,
  Attendance,
  AttendanceRecap,
} = require('./attendance.model');

const {
  LeaveType,
  LeaveRequest,
  OvertimeSetting,
  OvertimeRequest,
} = require('./leave-overtime.model');

// ---- Payroll ----
const {
  Payroll,
  PayrollDetail,
  SalarySlip,
  SalaryComponent,
  FinancialJournal,
} = require('./payroll.model');

// ---- Piutang ----
const {
  Receivable,
  ReceivableInstallment,
  ReceivablePayment,
  ReceivableSetting,
} = require('./receivable.model');

// ---- System, Audit & Komunikasi ----
const {
  DocumentTemplate,
  HrDocument,
  Announcement,
  Notification,
  ActivityLog,
} = require('./system.model');

module.exports = {
  // Core
  Company,
  Branch,
  Department,
  Position,
  Role,
  User,
  ApprovalFlow,

  // HR
  Employee,
  EmployeeDocument,
  SalaryConfig,
  SalaryLevel,
  SalaryHistory,
  MutationHistory,

  // Presensi
  WorkSchedule,
  Holiday,
  Attendance,
  AttendanceRecap,
  LeaveType,
  LeaveRequest,
  OvertimeSetting,
  OvertimeRequest,

  // Payroll
  Payroll,
  PayrollDetail,
  SalarySlip,
  SalaryComponent,
  FinancialJournal,

  // Piutang
  Receivable,
  ReceivableInstallment,
  ReceivablePayment,
  ReceivableSetting,

  // System
  DocumentTemplate,
  HrDocument,
  Announcement,
  Notification,
  ActivityLog,
};
