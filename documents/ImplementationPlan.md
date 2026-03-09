# 🚀 samudraHRD — Implementation Plan & Vibe Coding Prompt Guide

> **Sistem Informasi HRD, Absensi, dan Payroll**
> Fullstack JavaScript · Node.js · Express.js · MongoDB · Bootstrap 5 · EJS · React Native Expo

---

## 📋 Cara Menggunakan Dokumen Ini

Dokumen ini adalah **panduan langkah-demi-langkah** untuk membangun samudraHRD menggunakan **Vibe Coding** (AI-assisted development dengan Antigravity AI atau tool sejenisnya).

**Setiap Sprint berisi:**
- 🎯 **Goal** — Target yang ingin dicapai
- 📁 **Files to Create** — Daftar file yang perlu dibuat
- 💬 **Prompt** — Copy-paste langsung ke AI Vibe Coding tool
- ✅ **Acceptance Criteria** — Cara memverifikasi hasilnya
- ⚠️ **Catatan Penting** — Hal yang perlu diperhatikan

---

## 🏗️ Aturan Global Vibe Coding

Tempelkan aturan ini ke **System Prompt / Project Context** di Antigravity AI sebelum mulai:

```
PROJECT: samudraHRD — Sistem HRD, Absensi, Payroll
STACK: Node.js v20 + Express.js v4 + MongoDB + Mongoose + EJS + Bootstrap 5.3
TEMPLATE: UBold Admin Dashboard (Express+EJS) — semua views extend dari views/layouts/main.ejs
BUILD: Gulp (SCSS→CSS, plugin copy) — jalankan `gulp build` sebelum start
PATTERN: MVC (Models / Controllers / Views) + Service Layer
FOLDER: Backend logic di root-level (config/, controllers/, middlewares/, services/, utils/)
         BUKAN di  — karena project sudah pakai template UBold
STYLE: ESLint Airbnb, async/await (NO callbacks), try-catch wajib di semua controller
AUTH: JWT (access 1 jam + refresh 7 hari) + bcrypt password
RBAC: Middleware checkPermission('module', 'action') di setiap route
RESPONSE FORMAT:
  Success → { success: true, data: {...}, message: "OK", pagination: {...} }
  Error   → { success: false, error: { code: "ERROR_CODE", message: "...", details: [] } }
FILE NAMING: camelCase untuk JS, kebab-case untuk routes/views
DB: Semua query pakai Mongoose ODM, TIDAK ada raw MongoDB query
SECURITY: Helmet.js, express-rate-limit, input validation dengan Joi
TELEGRAM: node-telegram-bot-api untuk semua notifikasi
VIEWS: Extend main.ejs layout, pakai template CSS/JS (BUKAN CDN)
       CSS dari public/css/app.min.css, JS dari public/js/vendors.min.js + public/js/app.js
       Plugin tambahan dari public/plugins/ (SweetAlert2, DataTables, dll.)
```

---

## 📊 Overview Sprint Plan

| Sprint | Modul | Durasi | Prioritas |
|--------|-------|--------|-----------|
| [S-00](#sprint-0--project-setup--boilerplate) | Project Setup & Boilerplate | 🔴 P1 |
| [S-01](#sprint-1--auth--rbac) | Auth, Users & RBAC | 🔴 P1 |
| [S-02](#sprint-2--master-data) | Master Data (Company, Branch, Dept, Position) | 🔴 P1 |
| [S-03](#sprint-3--employee-management) | Employee Management | 🔴 P1 |
| [S-04](#sprint-4--attendance-core) | Attendance Core (QR + Button + Manual) | 🔴 P1 |
| [S-05](#sprint-5--leave--overtime) | Cuti & Lembur | 🔴 P1 |
| [S-06](#sprint-6--payroll-engine) | Payroll Engine (CORE) | 🔴 P1 |
| [S-07](#sprint-7--piutang--receivables) | Piutang & Receivables | 🔴 P1 |
| [S-08](#sprint-8--dashboard--laporan) | Dashboard & Laporan | 🟡 P2 |
| [S-09](#sprint-9--notifikasi--telegram-bot) | Notifikasi & Telegram Bot | 🟡 P2 |
| [S-10](#sprint-10--dokumen--id-card) | Persuratan, Dokumen & ID Card | 🟡 P2 |
| [S-11](#sprint-11--mobile-app--face-recognition) | Mobile App & Face Recognition | 🟡 P2 |
| [S-12](#sprint-12--testing--finalisasi) | Testing, Audit Trail & Finalisasi | 🟡 P2 |


---

## Sprint 0 — Project Setup & Boilerplate

### 🎯 Goal
Membuat struktur folder, konfigurasi awal, koneksi database, dan middleware dasar yang menjadi fondasi seluruh aplikasi.

### 📁 Files to Create / Modify
```
samudraHRD/                   (template UBold sudah ada)
├── config/                   ← BARU, di root level (bukan )
│   ├── database.js
│   ├── constants.js
│   └── multer.js
├── middlewares/              ← BARU, di root level
│   ├── errorHandler.js
│   ├── notFound.js
│   └── requestLogger.js
├── utils/                    ← BARU, di root level
│   └── responseHelper.js
├── views/                    ✅ SUDAH ADA dari template
│   ├── layouts/main.ejs      ← MODIFIKASI (extend template assets)
│   └── partials/             ✅ SUDAH ADA (sidenav, topbar, footer)
├── public/                   ✅ SUDAH ADA dari template
│   ├── css/app.min.css       ✅ Gulp-compiled
│   ├── js/vendors.min.js     ✅ Gulp-built
│   ├── js/app.js             ✅ Template UI JS
│   ├── plugins/              ✅ Vendor plugins
│   └── scss/                 ✅ Custom SCSS
├── gulpfile.js               ✅ SUDAH ADA
├── plugins.config.js         ✅ SUDAH ADA
├── .env.example              ← BARU
├── .gitignore                ← BARU
├── package.json              ← MODIFIKASI (tambah backend deps)
└── app.js                    ← MODIFIKASI (extend template entry point)
```

### 💬 Prompt S-00-A: Project Initialization

```
Buatkan project setup lengkap untuk aplikasi samudraHRD dengan spesifikasi berikut:

STACK: Node.js + Express.js + MongoDB (Mongoose) + EJS + Bootstrap 5.3

Buat file-file berikut:

1. package.json dengan dependencies:
   - express, mongoose, ejs, express-ejs-layouts
   - dotenv, helmet, cors, compression, morgan
   - express-rate-limit, express-validator, joi
   - bcryptjs, jsonwebtoken, qrcode
   - multer, sharp, uuid
   - nodemailer, node-telegram-bot-api
   - agenda, node-cron
   - exceljs, puppeteer
   - socket.io
   - winston (logging)
   Dev: nodemon, eslint (airbnb config)

2. app.js (root) — EXTEND template Express app dengan:
   - helmet(), cors(), compression(), morgan('combined')
   - express.json(), express.urlencoded()
   - express-rate-limit (100 req/15 menit global)
   - EJS sebagai view engine dengan express-ejs-layouts
   - Static files dari /public
   - Mount semua router (placeholder untuk sekarang)
   - errorHandler middleware di akhir

3. config/database.js — Mongoose connection dengan:
   - connectDB() function
   - Event listener connected, error, disconnected
   - Retry logic jika connection gagal (max 5x, interval 5 detik)

4. config/constants.js — Semua konstanta:
   - ROLES: { ADMIN, MANAGER_HRD, KEPALA_CABANG, STAFF_ADMIN, KASIR }
   - EMPLOYEE_STATUS: { KT, KL, MAGANG }
   - PAYMENT_CYCLE: { DAILY, WEEKLY, MONTHLY }
   - ATTENDANCE_METHOD: { QR, BUTTON, MANUAL, FACE }
   - ATTENDANCE_STATUS: { HADIR, IZIN, SAKIT, ALPA, TERLAMBAT, LIBUR, PENDING }
   - PAYROLL_STATUS: { DRAFT, PROCESSING, REVIEWED, APPROVED, PAID, LOCKED }
   - RECEIVABLE_STATUS: { PENDING, APPROVED, ACTIVE, COMPLETED, REJECTED, CANCELLED }
   - HTTP_STATUS codes

5. utils/responseHelper.js — Helper functions:
   - successResponse(res, data, message, statusCode)
   - errorResponse(res, message, code, statusCode, details)
   - paginatedResponse(res, data, total, page, limit)

6. middlewares/errorHandler.js — Global error handler:
   - Handle Mongoose ValidationError → 422
   - Handle Mongoose CastError → 400
   - Handle duplicate key error (code 11000) → 409
   - Handle JWT errors → 401
   - Default → 500

7. .env.example dengan semua environment variables:
   NODE_ENV, PORT, MONGODB_URI, JWT_SECRET, JWT_REFRESH_SECRET,
   JWT_EXPIRE, JWT_REFRESH_EXPIRE, REDIS_URL, MINIO_ENDPOINT,
   MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_BUCKET,
   TELEGRAM_BOT_TOKEN, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS,
   ENCRYPTION_KEY, FRONTEND_URL, MAX_FILE_SIZE_MB

8. views/partials/ — EXTEND template UBold layout dengan:
   - Sidebar custom HRD (replace template demo menu)
   - Top navbar custom (search, notifications, user dropdown)
   - Breadcrumb (pakai template page-title-head CSS class)
   - Flash message area (success/error/warning)
   - Footer custom samudraHRD
   - <%- body %> sebagai content area
   - CSS: public/css/app.min.css (Gulp-compiled, BUKAN CDN)
   - JS: public/js/vendors.min.js + public/js/app.js (BUKAN CDN)
   - Plugins: public/plugins/sweetalert2/ (BUKAN CDN)

NOTE: TIDAK ada server.js terpisah — semua logic di app.js root-level.
NOTE: untuk Layout, semuanya di views/partials untuk sidebar, topbar, footer, dan breadcrumb dan lainnya.
PERINGATAN: Jangan pernah membuat file baru, cukup gunakan codingan yang sudah ada untuk design layout.
Semua file harus production-ready dengan komentar yang jelas.
```

### 💬 Prompt S-00-B: Struktur Folder Lengkap

```
Buatkan folder-folder backend berikut di ROOT level project
(BUKAN di dalam  — karena project pakai template UBold):

config/               # Konfigurasi (DB, constants, multer, socket)
models/               # SUDAH ADA dari template — 13 Mongoose schema files
controllers/          # Route handlers per modul
│   ├── auth/
│   ├── employees/
│   ├── branches/
│   ├── attendance/
│   ├── payroll/
│   ├── receivables/
│   ├── dashboard/
│   ├── reports/
│   └── system/
services/             # Business logic
│   ├── PayrollService.js
│   ├── AttendanceService.js
│   ├── ReceivableService.js
│   ├── NotificationService.js
│   ├── TelegramService.js
│   ├── PdfService.js
│   ├── ExcelService.js
│   └── QrService.js
routes/               # SUDAH ADA — index.js perlu ditulis ulang
middlewares/          # Auth, RBAC, upload, validator
jobs/                 # Cron jobs & Agenda jobs
│   ├── payrollJob.js
│   ├── attendanceRecapJob.js
│   ├── notificationJob.js
│   └── receivableJob.js
utils/                # Helper functions
validators/           # Joi/express-validator schemas

views/                # ✅ SUDAH ADA dari template UBold
├── layouts/main.ejs  # Custom HRD layout (sudah dimodifikasi)
├── partials/         # Template partials (sidenav, topbar, footer, dll.)
├── auth/             # Login, forgot password — BARU
├── dashboard/        # Custom HRD dashboard — BARU
├── employees/        # BARU
├── branches/         # BARU
├── attendance/       # BARU
├── payroll/          # BARU
├── receivables/      # BARU
├── reports/          # BARU
├── documents/        # BARU
└── settings/         # BARU

public/               # ✅ SUDAH ADA dari template UBold
├── css/              # Gulp-compiled dari scss/
├── js/               # vendors.min.js + app.js + page scripts
├── scss/             # Custom SCSS (edit di sini, gulp build)
├── plugins/          # Vendor plugins (dari plugins.config.js)
├── images/           # Logo, icons, user avatars
└── uploads/          # Temp uploads (redirect ke MinIO di production)

mobile/               # React Native Expo project
tests/                # Jest test files
postman/              # Postman collections

CATATAN PENTING:
- JANGAN buat folder  — semua backend di root level
- Template UBold sudah menyediakan views/, public/, routes/
- Hanya buat folder baru yang belum ada (.gitkeep di folder kosong)
```

### ✅ Acceptance Criteria S-00
- [ ] `npm install` berjalan tanpa error
- [ ] `npm run dev` server start di port 3000
- [ ] `GET /health` mengembalikan `{ status: "OK", db: "connected" }`
- [ ] Error handler menangkap uncaught exceptions dengan benar
- [ ] Halaman layout Bootstrap tampil di browser

---

## Sprint 1 — Auth & RBAC

### 🎯 Goal
Sistem autentikasi JWT lengkap, RBAC middleware, dan manajemen pengguna.

### 📁 Files to Create
```
root/
├── models/
│   ├── role.model.js
│   └── user.model.js
├── controllers/auth/
│   ├── authController.js
│   └── userController.js
├── services/
│   └── AuthService.js
├── middlewares/
│   ├── authenticate.js       # verifyToken
│   ├── authorize.js          # checkPermission(module, action)
│   └── branchFilter.js       # Auto-filter data by branch
├── routes/
│   ├── auth.routes.js
│   └── user.routes.js
├── validators/
│   └── auth.validator.js
views/
├── auth/
│   ├── login.ejs
└── settings/
    └── users/
        ├── index.ejs
        ├── create.ejs
        └── edit.ejs
```

### 💬 Prompt S-01-A: Auth System

```
Buatkan sistem autentikasi lengkap untuk samudraHRD.

MODELS (sudah ada di schemas/role-user.model.js, import saja):
- Role: { name, slug (enum 5 roles), permissions (array string), is_system_role }
- User: { username, email, password_hash (select:false), role_id, branch_id,
          employee_id, telegram_chat_id,
          is_active, is_locked, failed_login_count, last_login }

Buat controllers/auth/authController.js dengan fungsi:

1. login(req, res):
   - Validasi input (username/email + password) dengan Joi
   - Query user dengan select('+password_hash')
   - Cek is_active dan is_locked (locked_until)
   - Verify bcrypt password
   - Jika failed: increment failed_login_count, jika >= 5: lock 30 menit
   - Jika berhasil: return { access_token, refresh_token, user: {...without sensitive} }
   - Update last_login, reset failed_login_count
   - Catat ke ActivityLog: action=LOGIN

2. refreshToken(req, res):
   - Verify refresh_token
   - Check apakah token ada di Redis blacklist
   - Issue access_token baru
   - Return { access_token }

3. logout(req, res):
   - Tambahkan access_token ke Redis blacklist (TTL = sisa expired time)
   - Catat ActivityLog: action=LOGOUT

4. changePassword(req, res):
   - Verify old_password
   - Hash new_password dengan bcrypt (rounds: 12)
   - Update password_hash
   - Blacklist current token (force relogin)
   - Catat ActivityLog: action=PASSWORD_CHANGE

Buat middlewares/authenticate.js:
- Ambil Bearer token dari Authorization header
- Verify JWT
- Cek token tidak ada di Redis blacklist
- Attach req.user = { id, role, company_id, branch_id, permissions }
- Handle expired, invalid, missing token dengan error yang tepat

Buat middlewares/authorize.js:
- checkPermission(module, action) → middleware factory
- Cek apakah req.user.permissions includes module+':'+action
- Admin selalu lolos (bypass permission check)
- Return 403 jika tidak ada permission

Buat middlewares/branchFilter.js:
- Untuk role kepala_cabang, staff_admin, kasir:
  attach req.branchFilter = { branch_id: req.user.branch_id }
- Untuk admin dan manager_hrd: req.branchFilter = {} (tidak difilter)
- Middleware ini di-apply di semua route yang butuh filter cabang

Buat routes/auth.routes.js:
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout          [authenticate]
POST /api/v1/auth/change-password [authenticate]

Buat views/auth/login.ejs:
- Form login Bootstrap 5.3 yang clean dan professional
- Logo samudraHRD di atas form
- Input username/email + password (show/hide toggle)
- Remember me checkbox
- Tombol Login dengan loading state
- Error message area
- Tidak ada sidebar (layout minimal khusus auth)

Semua validasi menggunakan Joi. Response mengikuti format standar.
Sertakan JSDoc comment untuk setiap fungsi.
```

### 💬 Prompt S-01-B: User Management UI

```
Buatkan fitur manajemen pengguna (User Management) untuk samudraHRD.

Buat controllers/auth/userController.js dengan CRUD:

1. getAllUsers(req, res) — GET /api/v1/users
   - Filter: role, branch_id, is_active, search (nama/username/email)
   - Sort: created_at, username, full_name
   - Pagination: page, limit (default 10)
   - Populate: role_id (name, slug), branch_id (name), employee_id (full_name)
   - Hanya admin & manager_hrd yang bisa akses semua user
   - kepala_cabang hanya bisa lihat user cabangnya

2. createUser(req, res) — POST /api/v1/users
   - Validasi: username unik, email unik, role valid, branch wajib untuk kasir/staff_admin/kepala_cabang
   - Generate password random (12 karakter) jika tidak diisi
   - Hash password dengan bcrypt
   - Kirim email welcome dengan password awal
   - Catat ActivityLog

3. updateUser(req, res) — PUT /api/v1/users/:id
   - Tidak bisa update password di sini (pakai changePassword)
   - Bisa update: role, branch, is_active, telegram_chat_id
   - Admin tidak bisa di-edit oleh non-admin

4. deleteUser(req, res) — DELETE /api/v1/users/:id
   - Soft delete: is_active = false
   - Tidak bisa hapus diri sendiri
   - Tidak bisa hapus system admin

5. resetPassword(req, res) — POST /api/v1/users/:id/reset-password
   - Generate password baru random
   - Kirim via email
   - Force relogin (blacklist semua token)

Buat views/settings/users/index.ejs:
- DataTable dengan kolom: Avatar, Nama, Username, Email, Role (badge warna), Cabang, Status, Last Login, Aksi
- Filter dropdown: Role, Cabang, Status
- Searchbar
- Tombol "Tambah Pengguna" (buka modal)
- Actions: Edit (icon), Reset Password (icon warning), Nonaktifkan (toggle)

Buat views/settings/users/create.ejs dan edit.ejs:
- Form dengan: Nama Lengkap, Username, Email, Role (select), Cabang (select, conditional), Password (opsional saat create)
- Role field mengubah field yang muncul (kasir tidak perlu pilih department, dll.)
- Submit dengan AJAX, tampil SweetAlert2 sukses/error

Gunakan Bootstrap 5.3 untuk semua UI. Validasi form di frontend (Vanilla JS) dan backend (Joi).
```

### ✅ Acceptance Criteria S-01
- [ ] Login berhasil, JWT tersimpan di httpOnly cookie
- [ ] Token expired → 401 dengan pesan jelas
- [ ] Role `kasir` tidak bisa akses endpoint `/api/v1/users`
- [ ] 5x login gagal → akun terkunci
- [ ] Halaman user management menampilkan data dengan pagination

---

## Sprint 2 — Master Data

### 🎯 Goal
CRUD untuk Company, Branch, Department, Position, Salary Level, dan konfigurasi Approval Flow.

### 💬 Prompt S-02-A: Branch Management

```
Buatkan modul Branch Management lengkap untuk samudraHRD.

MODEL: Gunakan branch.model.js yang sudah ada (35 fields termasuk geo-fencing,
meal_allowance_rule, dan overtime_rule sebagai sub-schema).

Buat controllers/branches/branchController.js:

1. getAllBranches(req, res):
   - Filter: is_active, city, search (nama/kode)
   - Sort: name, created_at, city
   - Pagination
   - Sertakan jumlah karyawan aktif per cabang (via aggregate $lookup)

2. getBranchById(req, res):
   - Detail lengkap termasuk sub-schema meal_allowance_rule dan overtime_rule
   - Include stats: total_karyawan, total_aktif

3. createBranch(req, res):
   - Validasi: branch_code unik per company
   - Auto-set company_id dari req.user.company_id
   - Setelah create: otomatis create 1 OvertimeSetting document untuk cabang ini

4. updateBranch(req, res):
   - Bisa update termasuk meal_allowance_rule dan overtime_rule
   - Jika geofence_radius berubah, log ke activity

5. toggleActive(req, res) — PATCH /branches/:id/toggle:
   - Toggle is_active
   - Tidak bisa nonaktifkan cabang yang masih punya karyawan aktif

Buat views/branches/index.ejs:
- Card grid view per cabang (bukan tabel) dengan:
  - Nama cabang, kode, kota
  - Badge: Aktif/Nonaktif
  - Stats cards: Total Karyawan, Hadir Hari Ini (real-time)
  - Tombol: Lihat Detail, Edit, Pengaturan Lembur
- Filter: Kota, Status
- Tombol "Tambah Cabang"

Buat views/branches/detail.ejs:
- Tab layout dengan Bootstrap tabs:
  TAB 1 — Info Umum: alamat, kontak, PIC, peta Google Maps (embed)
  TAB 2 — Pengaturan Uang Makan:
    - Form inline: Nominal, Min Jam Kerja, Toleransi Terlambat
    - Preview: "Karyawan yang hadir ≥ X jam dan terlambat ≤ Y menit akan dapat uang makan Rp Z/hari"
  TAB 3 — Pengaturan Lembur:
    - Form: Tarif/Jam, Max Jam/Hari, Max Jam/Bulan, Multiplier Weekend, Multiplier Hari Libur
  TAB 4 — Daftar Karyawan (mini table, link ke employee list terfilter)

Semua update form menggunakan AJAX + SweetAlert2 konfirmasi.
Wajib catat semua perubahan ke activity_logs.
```

### 💬 Prompt S-02-B: Department, Position & Salary Level

```
Buatkan CRUD untuk Department, Position, dan Salary Level dalam satu file controller.

Buat controllers/branches/orgController.js dengan:

=== DEPARTMENT ===
- CRUD standar dengan validasi code unik per company
- Endpoint assign kepala departemen: PATCH /departments/:id/set-head
  (hanya bisa pilih karyawan aktif di company tersebut)
- Soft delete: tidak bisa hapus jika masih ada positions aktif di dalamnya

=== POSITION ===
- CRUD dengan relasi ke Department dan SalaryLevel
- Field level (hierarki): 1=Staff, 2=Supervisor, 3=Manager, 4=GM, 5=Director
- Saat create/update: validasi salary range (min_salary ≤ base_salary karyawan ≤ max_salary)

=== SALARY LEVEL ===
- CRUD dengan min_salary, max_salary, dan default_components
- default_components mencakup: tenure, position, performance, meal, fuel allowance defaults
- Endpoint: GET /salary-levels/:id/positions → list semua jabatan dengan grade ini

=== STRUKTUR ORGANISASI ===
GET /api/v1/org-chart → return JSON hierarki untuk tampilan org chart

Buat views/settings/organization.ejs:
- Halaman dengan 3 tab: Departemen, Jabatan, Grade Gaji

TAB Departemen:
- Tabel: Nama, Kode, Kepala Dept, Jumlah Jabatan, Jumlah Karyawan, Aksi
- Modal create/edit di halaman yang sama

TAB Jabatan:
- Tabel: Nama Jabatan, Kode, Departemen, Level (badge), Grade Gaji, Jumlah Karyawan
- Filter by departemen
- Modal create/edit

TAB Grade Gaji:
- Card per grade dengan: Nama, Range Gaji (Rp X — Rp Y), daftar jabatan
- Modal create/edit dengan input range gaji dan default components

Buat views/org-chart.ejs:
- Visualisasi org chart menggunakan library OrgChart.js atau d3.js
- Klik node → popup info singkat karyawan + jabatan
- Export PNG button

Semua response API mengikuti format standar. Catat semua perubahan ke activity_logs.
```

### 💬 Prompt S-02-C: Approval Flow Configuration

```
Buatkan UI konfigurasi Approval Flow untuk samudraHRD.

Model: approval_flows collection (module, condition_field, condition_operator,
condition_value, approver_role_id, level, notify_roles)

Buat controllers/system/approvalFlowController.js:

1. getApprovalFlows(req, res):
   - Group by module
   - Populate approver_role_id

2. upsertApprovalFlow(req, res):
   - Jika sudah ada flow untuk module+level yang sama → update
   - Jika belum → create baru

3. deleteApprovalFlow(req, res):
   - Hard delete (admin only)

Buat views/settings/approval-flows.ejs:
- Kartu per modul (Piutang, Cuti, Lembur, Absensi Manual, Payroll, Mutasi)
- Per kartu: tampilkan alur persetujuan secara visual
  Contoh Piutang:
  [Pengajuan Karyawan] → [Jika < 1jt: Kepala Cabang] → [Selesai]
                       → [Jika ≥ 1jt: Manager HRD] → [Selesai]
- Tombol edit per rule
- Visual menggunakan CSS arrows (bukan library eksternal)
- Form edit: Modul, Kondisi (field, operator, nilai), Approver Role, Notify Roles
```

### ✅ Acceptance Criteria S-02
- [ ] CRUD Branch berjalan, geo-fencing radius tersimpan
- [ ] Struktur organisasi tampil sebagai tree
- [ ] Approval flow piutang: `amount >= 1000000` → `manager_hrd`
- [ ] Semua perubahan tercatat di `activity_logs`

---

## Sprint 3 — Employee Management

### 🎯 Goal
Manajemen karyawan lengkap: CRUD, auto-generate ID & QR Code, konfigurasi gaji, upload dokumen, mutasi, dan offboarding dengan validasi piutang.

### 💬 Prompt S-03-A: Employee CRUD & ID Generation

```
Buatkan modul Employee Management lengkap untuk samudraHRD.

MODEL: Gunakan employee.model.js yang sudah ada (49 fields).

Buat services/EmployeeService.js dengan fungsi:

1. generateEmployeeCode(branchCode, status, companyId):
   - Format: [KODE_CABANG]-[STATUS_2CHAR]-[URUT_4DIGIT]
   - KT → KT, KL → KL, Magang → MG
   - Contoh: JKT-KT-0001, SBY-KL-0023
   - Query count karyawan dengan prefix yang sama + 1
   - Return code yang unik dan terurut

2. generateQRCode(employeeCode):
   - Encode string: samudraHRD:[employeeCode]:[timestamp_checksum]
   - Generate PNG dengan qrcode library (ukuran 300x300)
   - Upload ke MinIO/lokal: qrcodes/[employeeCode].png
   - Return URL

3. calculateAge(birthDate): return umur dalam tahun
4. calculateTenure(joinDate): return masa kerja dalam format "X tahun Y bulan"

Buat controllers/employees/employeeController.js:

1. getAllEmployees(req, res):
   - Filter: branch_id (auto dari branchFilter middleware), department_id,
     position_id, status (KT/KL/Magang), payment_cycle, is_active, search
   - Search: full_name (text index), employee_code, nik (partial)
   - Sort: full_name, employee_code, join_date, created_at
   - Pagination: page, limit (default 10, max 100)
   - Populate: branch, department, position
   - Sertakan current salary config (aggregate lookup salary_configs where is_current=true)

2. getEmployeeById(req, res):
   - Populate lengkap: branch, department, position
   - Include: current salary_config, dokumen terbaru, riwayat mutasi, stats absensi bulan ini

3. createEmployee(req, res):
   - Validasi Joi: wajib semua field required
   - Validasi NIK unik per company
   - Panggil EmployeeService.generateEmployeeCode()
   - Panggil EmployeeService.generateQRCode()
   - Simpan employee
   - Buat salary_config awal (wajib ada saat create)
   - Catat ActivityLog: action=CREATE, module=employees

4. updateEmployee(req, res):
   - Tidak bisa update employee_code, nik (perlu proses khusus)
   - Catat ActivityLog dengan old_value dan new_value

5. uploadPhoto(req, res) — POST /employees/:id/photo:
   - Handle multipart upload dengan multer
   - Resize ke 400x400 dengan sharp
   - Upload ke MinIO
   - Update photo_url

Buat views/employees/index.ejs:
- Tabel responsif dengan DataTables
- Kolom: [ ] (checkbox), Avatar, Nama & Kode, Cabang, Departemen/Jabatan,
  Status (badge), Siklus Gaji (badge), Tgl Bergabung, Masa Kerja, Aksi
- Filter panel (collapsible): Cabang, Departemen, Jabatan, Status, Siklus Gaji
- Searchbar di atas tabel
- Tombol aksi: View (eye icon), Edit (pencil icon)
- Bulk action: Export PDF, Export Excel
- Badge warna: KT=biru, KL=hijau, Magang=kuning

Buat views/employees/create.ejs:
- Wizard form 4 langkah (step tabs):
  STEP 1 — Data Pribadi: Nama, NIK, Gender, TTL, Agama, Status Perkawinan, Gol Darah, Alamat, Telepon, Email
  STEP 2 — Data Kepegawaian: Cabang, Departemen, Jabatan, Status (KT/KL/Magang), Siklus Gaji, Tgl Bergabung, Kontrak (start/end), Masa Percobaan
  STEP 3 — Konfigurasi Gaji: 9 komponen gaji (base_salary, tenure, position, performance, daily_rate, meal, fuel, overtime_rate, bonus) dengan input angka + format Rupiah otomatis
  STEP 4 — Review & Submit: Summary semua data sebelum disimpan + preview ID Card
- Validasi per step sebelum lanjut
- Auto-preview Employee Code saat pilih Cabang + Status
- Preview QR Code (placeholder) di step 4
```

### 💬 Prompt S-03-B: Employee Profile & Documents

```
Buatkan halaman detail profil karyawan dengan 5 tab untuk samudraHRD.

Buat views/employees/detail.ejs dengan Bootstrap Tab:

TAB 1 — Profil:
- Card kiri: Foto + nama + badge status + Employee Code + QR Code (klik untuk download PNG)
- Card kanan: Grid info 2 kolom: NIK, TTL, Jenis Kelamin, Agama, Status Perkawinan,
  Alamat, Telepon, Email, Cabang, Departemen, Jabatan, Tgl Bergabung, Masa Kerja,
  Siklus Gaji, Kontrak (start - end), Masa Percobaan
- Info Bank: Nama Bank, No. Rekening (masked: XXXX-XXXX-XXXX-1234), Nama Pemilik
- Kontak Darurat: Nama, Hubungan, Telepon

TAB 2 — Dokumen:
- Grid dokumen per kategori (KTP, KK, NPWP, Ijazah, SKCK, dll.)
- Setiap card: ikon tipe file, nama dokumen, tanggal upload, tombol View dan Download
- Tombol Upload Dokumen (dropdown pilih jenis)
- Modal preview untuk PDF dan gambar

TAB 3 — Konfigurasi Gaji:
- Tabel komponen gaji saat ini:
  | Komponen | Nominal | Catatan |
  Dengan total gaji kotor di bawah
- Tombol "Update Konfigurasi Gaji" → modal form 9 komponen
- Riwayat perubahan gaji (dari salary_histories):
  Timeline vertikal: tanggal, jenis perubahan, gaji lama → gaji baru, oleh siapa

TAB 4 — Riwayat Absensi:
- Mini rekap 3 bulan terakhir: Hadir/Izin/Sakit/Alpa (bar chart kecil)
- Tabel absensi: Tanggal, Check In, Check Out, Durasi, Metode, Status
- Filter: bulan, status

TAB 5 — Riwayat Piutang:
- Summary: Total piutang, Sudah dibayar, Sisa
- Tabel: No. Piutang, Tgl Pengajuan, Nominal, Cicilan, Sisa, Status (badge), Aksi

Buat controllers/employees/employeeDocumentController.js:
- uploadDocument(req, res) → upload ke MinIO, simpan ke employee_documents
- deleteDocument(req, res) → soft delete atau hard delete
- viewDocument(req, res) → generate signed URL dari MinIO
```

### 💬 Prompt S-03-C: Mutasi & Offboarding

```
Buatkan fitur Mutasi Karyawan dan Offboarding untuk samudraHRD.

=== MUTASI KARYAWAN ===

Buat controllers/employees/mutationController.js:

1. createMutation(req, res) — POST /employees/:id/mutate:
   - Validasi: to_branch_id berbeda dengan current branch_id
   - Validasi: effective_date tidak boleh di masa lalu
   - Buat record di mutation_histories
   - Update employees: branch_id, department_id, position_id
   - Buat salary_config baru dengan aturan cabang baru (copy komponen, adjust meal/overtime ke aturan cabang tujuan)
   - Set prorata_processed = false (akan diproses Cron Job akhir bulan)
   - Generate surat mutasi otomatis dari template (jika ada)
   - Notifikasi Telegram ke Manager HRD dan Kepala Cabang tujuan
   - Catat ActivityLog: action=MUTATE_EMPLOYEE

2. getMutationHistory(req, res) — GET /employees/:id/mutations:
   - Return semua mutation_histories untuk karyawan ini
   - Populate: from_branch, to_branch, approved_by

Buat views/employees/mutation-form.ejs:
- Modal form:
  - Info karyawan saat ini (read-only): Nama, Cabang, Dept, Jabatan
  - Cabang Tujuan (select) — dengan info uang makan & lembur cabang tujuan
  - Departemen Baru (select — filtered by cabang tujuan)
  - Jabatan Baru (select)
  - Tanggal Efektif (date picker, min = besok)
  - Alasan Mutasi (textarea)
  - Alert: "Gaji akan dihitung secara prorata pada akhir periode"
  - Tombol Submit

=== OFFBOARDING ===

Buat controllers/employees/offboardingController.js:

1. initiateOffboarding(req, res) — POST /employees/:id/offboard:
   REQUEST BODY: { resign_date, resign_reason, last_working_date }

   STEP 1 — Cek piutang aktif:
   const activeReceivables = await Receivable.find({
     employee_id: id, status: 'active'
   });

   Jika ada piutang aktif → return 409:
   {
     success: false,
     error: {
       code: 'ACTIVE_RECEIVABLE_EXISTS',
       message: 'Karyawan masih memiliki piutang aktif',
       data: {
         receivables: [...activeReceivables dengan remaining_balance],
         total_remaining: sumRemainingBalance,
         options: ['salary_deduction', 'direct_payment']
       }
     }
   }

   STEP 2 — Resolve piutang (jika ada):
   POST /employees/:id/offboard/resolve-receivable
   BODY: { resolution_method: 'salary_deduction' | 'direct_payment' }

   Jika salary_deduction: tandai untuk dipotong dari gaji terakhir
   Jika direct_payment: Kasir harus input bukti pembayaran dulu

   STEP 3 — Finalize offboarding:
   POST /employees/:id/offboard/finalize
   - Set employee: is_active = false, resign_date, resign_reason, deactivated_at
   - Nonaktifkan user account terkait
   - Generate surat pemberhentian otomatis
   - Catat ActivityLog: action=DEACTIVATE_EMPLOYEE

Buat views/employees/offboarding.ejs:
- Stepper UI 3 langkah:
  Step 1: Form resign + info piutang aktif (jika ada)
  Step 2: Resolve piutang (pilih metode + konfirmasi)
  Step 3: Final summary + tombol "Nonaktifkan Karyawan"
- Warning merah jika ada piutang belum diselesaikan
- SweetAlert2 konfirmasi dengan teks "Ketik NONAKTIFKAN untuk konfirmasi"
```

### ✅ Acceptance Criteria S-03
- [ ] Karyawan baru ter-generate Employee Code (format: JKT-KT-0001) dan QR Code PNG
- [ ] Filter karyawan berdasarkan cabang berjalan (staff_admin hanya lihat cabangnya)
- [ ] Mutasi karyawan: `mutation_histories` tercatat, `employees.branch_id` terupdate
- [ ] Offboarding terblokir jika ada piutang aktif
- [ ] Upload foto: ter-resize 400x400 dan tersimpan di MinIO
---

## Sprint 4 — Attendance Core

### 🎯 Goal
Sistem absensi 4 metode: QR Code + Geo-fencing, Button Check-in, Manual (foto + alasan), dan Face Recognition API. Monitoring real-time via Socket.IO.

### 💬 Prompt S-04-A: Attendance Service & 3 Metode Absensi

```
Buatkan modul Attendance untuk samudraHRD yang mendukung 3 metode (QR, Button, Manual).
(Metode ke-4 Face Recognition dibuat di Sprint 11 bersama mobile app)

Buat services/AttendanceService.js dengan fungsi:

1. calculateStatus(checkInTime, schedule):
   - Bandingkan checkInTime dengan schedule.check_in_time + late_tolerance_minutes
   - Return: { status: 'Hadir'|'Terlambat', late_minutes: number }

2. calculateWorkHours(checkIn, checkOut, schedule):
   - Hitung durasi kerja dikurangi jam istirahat
   - Return: { work_hours, overtime_hours }

3. isMealAllowanceEligible(workHours, lateMinutes, branchRule):
   - Cek: workHours >= branchRule.min_work_hours
   - Cek: lateMinutes <= branchRule.late_tolerance_minutes
   - Return: boolean

4. validateGeofence(userLat, userLng, branchLat, branchLng, radiusMeters):
   - Hitung jarak dengan Haversine formula
   - Return: { isValid: boolean, distance: number }

5. generateQRToken(employeeCode):
   - Encode: { emp: employeeCode, ts: Date.now(), sig: hmac(secret) }
   - Return base64 token (valid 30 detik untuk anti-replay)

6. validateQRToken(token):
   - Decode dan verify signature
   - Cek timestamp tidak lebih dari 30 detik yang lalu
   - Return: { valid, employeeCode }

Buat controllers/attendance/attendanceController.js:

1. qrCheckin(req, res) — POST /attendance/qr-checkin:
   BODY: { qr_token, latitude, longitude }
   - Decode & validasi QR token (max 30 detik)
   - Cari employee dari employeeCode dalam token
   - Validasi geofence jika geofence_enabled = true
   - Cek sudah absen hari ini belum (duplikasi)
   - Tentukan: check_in atau check_out (jika check_in sudah ada)
   - Kalkulasi status, late_minutes
   - Jika check_out: hitung work_hours, overtime_hours, meal_eligibility
   - Simpan/update Attendance
   - Emit Socket.IO event: 'attendance:update' ke room branch_id
   - Return: { message, employee_name, status, time }

2. buttonCheckin(req, res) — POST /attendance/button-checkin:
   BODY: { employee_id, latitude, longitude }
   - Hanya bisa dilakukan oleh karyawan sendiri atau admin cabang
   - Proses sama dengan QR, tanpa validasi token
   - Validasi geofence

3. manualAttendance(req, res) — POST /attendance/manual:
   BODY: { employee_id, date, check_in_time, check_out_time, notes }
   FILE: check_in_photo (wajib)
   - Validasi: photo wajib ada (multer middleware)
   - Validasi: notes wajib diisi (min 20 karakter)
   - Foto disimpan ke MinIO: attendance/manual/[employee_id]/[date].jpg
   - Status: manual_status = 'pending_verification'
   - Status absensi: 'Pending' sampai diverifikasi
   - Notifikasi ke Kepala Cabang: "Ada absensi manual yang perlu diverifikasi"

4. verifyManualAttendance(req, res) — PATCH /attendance/:id/verify:
   BODY: { action: 'approve'|'reject', rejection_reason }
   - Hanya Kepala Cabang atau Admin
   - Jika approve: kalkulasi ulang status, work_hours
   - Jika reject: set status = 'Alpa', rejection_reason
   - Notifikasi ke karyawan

5. getAllAttendances(req, res) — GET /attendance:
   - Filter: branch_id (auto), date, date_range, status, method, employee_id
   - Sort: date desc, employee_name
   - Pagination
   - Export: query param ?export=pdf|excel

6. getTodayAttendance(req, res) — GET /attendance/today:
   - Semua karyawan aktif di cabang
   - Merge dengan data absensi hari ini
   - Return list: sudah absen (dengan info) + belum absen

Buat views/attendance/index.ejs:
- Dua tab: "Absensi Hari Ini" dan "Riwayat Absensi"

TAB Absensi Hari Ini:
- Stats row: Total Karyawan, Hadir, Terlambat, Izin/Sakit, Alpa, Belum Absen
- Tabel live update (Socket.IO) dengan kolom: Karyawan, Jam Masuk, Jam Keluar, Durasi, Metode (badge), Status (badge warna)
- Badge metode: QR=biru, Button=hijau, Manual=kuning, Face=ungu
- Real-time update tanpa refresh

TAB Riwayat:
- Filter: Tanggal Range, Cabang, Departemen, Status, Metode
- Tabel dengan export PDF/Excel
- Klik baris → modal detail (termasuk foto jika manual)

Buat views/attendance/manual-verify.ejs:
- Antrian absensi manual yang belum diverifikasi
- Card per item: Foto selfie (thumbnail), nama karyawan, tanggal, jam, alasan
- Tombol Approve (hijau) dan Reject (merah)
- Klik foto → lightbox

Gunakan Socket.IO untuk real-time update di halaman monitoring hari ini.
Semua fungsi async/await dengan try-catch.
```

### 💬 Prompt S-04-B: Attendance Recap & Work Schedule

```
Buatkan fitur Jadwal Kerja, Rekap Periode, dan Cron Job rekap absensi.

=== JADWAL KERJA ===

Buat controllers/attendance/scheduleController.js:
- CRUD work_schedules per cabang
- GET /schedules?branch_id=xxx
- Satu cabang bisa punya multiple jadwal (Shift Pagi, Shift Malam, Normal)
- Tandai satu sebagai is_default

Buat views/attendance/schedules.ejs:
- Kartu per jadwal:
  - Nama jadwal, tipe, hari kerja (chip per hari)
  - Jam masuk → jam keluar (dengan visualisasi bar horizontal)
  - Toleransi terlambat, min jam kerja
  - Badge: Default / Tidak
- Tombol Tambah Jadwal (modal form)
- Toggle is_default per jadwal

=== REKAP PERIODE ===

Buat controllers/attendance/recapController.js:

1. getRecap(req, res) — GET /attendance/recap:
   - Filter: branch_id, department_id, employee_id, period_year, period_month
   - Return data dari attendance_recaps (sudah di-generate Cron Job)
   - Jika belum ada rekap (bulan berjalan): hitung on-the-fly dari attendances
   - Export ke Excel dengan format:

   EXCEL FORMAT:
   Header: Logo, "Rekapitulasi Kehadiran [Cabang] - [Bulan Tahun]"
   Kolom: No | Nama | Dept | Hadir | Terlambat | Izin | Sakit | Alpa | Lembur (jam) | % Kehadiran
   Footer: Total per kolom, rata-rata % kehadiran

2. generateRecap(req, res) — POST /attendance/recap/generate:
   - Manual trigger untuk generate ulang rekap bulan tertentu
   - Hanya Admin/Manager HRD

Buat views/attendance/recap.ejs:
- Filter atas: Cabang, Departemen, Bulan, Tahun
- Stats besar: Total Hadir, Rata-rata Kehadiran %, Total Terlambat, Total Lembur
- Tabel dengan conditional formatting:
  % kehadiran < 80% → highlight merah
  % kehadiran 80-95% → kuning
  % kehadiran > 95% → hijau
- Tombol Export Excel dan Export PDF

=== CRON JOB ===

Buat jobs/attendanceRecapJob.js:
- Schedule: '0 1 1 * *' (jam 01:00 tanggal 1 setiap bulan)
- Fungsi generateMonthlyRecap(year, month):
  1. Ambil semua karyawan aktif
  2. Per karyawan: aggregate attendances untuk bulan tersebut
  3. Hitung semua counter: present, late, permit, sick, alpha, holiday, overtime
  4. Hitung attendance_percentage
  5. Upsert ke attendance_recaps
  6. Log hasil ke winston logger
- Retry logic jika gagal
- Notifikasi ke Manager HRD setelah selesai: "Rekap [Bulan] sudah ter-generate"

=== HARI LIBUR ===

Buat CRUD holidays (admin/manager_hrd):
- Create: name, date, type (national/branch/company), branch_id (null = semua)
- Import bulk dari CSV: template Excel dengan kolom Nama, Tanggal, Tipe, Cabang
- Kalender view tahunan (gunakan FullCalendar.js)
```

### ✅ Acceptance Criteria S-04
- [ ] Check-in QR Code berhasil, status Hadir/Terlambat terhitung otomatis
- [ ] Geo-fencing menolak check-in jika di luar radius
- [ ] Absensi manual muncul di antrian verifikasi kepala cabang
- [ ] Dashboard monitoring real-time update saat ada karyawan absen (Socket.IO)
- [ ] Rekap bulan lalu ter-generate otomatis pada tanggal 1

---

## Sprint 5 — Cuti & Lembur

### 💬 Prompt S-05: Leave & Overtime

```
Buatkan modul Cuti dan Lembur lengkap untuk samudraHRD.

=== CUTI ===

Buat controllers/attendance/leaveController.js:

1. getLeaveTypes(req, res) + CRUD leave_types (admin/manager_hrd):
   - name, code, max_days_per_year, requires_document, is_paid, applicable_status, min_tenure_months

2. submitLeaveRequest(req, res) — POST /leave-requests:
   BODY: { leave_type_id, start_date, end_date, reason }
   FILE: document (opsional/wajib tergantung leave_type.requires_document)
   - Validasi: tanggal tidak di masa lalu
   - Hitung total_days (exclude hari libur & akhir pekan)
   - Cek saldo cuti (jika leave_type.max_days_per_year > 0)
   - Cek tidak ada cuti/lembur yang overlap di tanggal yang sama
   - Buat leave_request dengan status = pending
   - Notifikasi Telegram ke Kepala Cabang

3. processLeaveRequest(req, res) — PATCH /leave-requests/:id/process:
   BODY: { action: 'approve'|'reject', notes }
   - Validasi role sesuai approval_flow
   - Update status + approval_steps
   - Notifikasi ke karyawan
   - Jika approved: update attendances untuk tanggal cuti (status=Izin)

4. getLeaveRequests(req, res):
   - Filter: branch_id, status, leave_type_id, date_range, employee_id
   - Populate: employee, leave_type
   - Include: pending_count untuk badge di menu

5. getLeaveBalance(req, res) — GET /employees/:id/leave-balance:
   - Per jenis cuti: kuota setahun, sudah dipakai, sisa
   - Return array per leave_type

Buat views/attendance/leave/index.ejs:
- 2 tab: "Pengajuan Cuti" dan "Riwayat Cuti"
- Tab Pengajuan: Tabel approval queue (untuk kepala cabang) + form baru
- Tab Riwayat: Tabel semua cuti dengan filter

Buat views/attendance/leave/form.ejs:
- Pilih jenis cuti → tampilkan saldo tersisa
- Date range picker
- Kalender mini preview (highlight tanggal yang dipilih, exclude hari libur)
- Upload dokumen (conditional, dengan preview)
- Kalkulator otomatis: "Anda mengajukan X hari kerja"

=== LEMBUR ===

Buat controllers/attendance/overtimeController.js:

1. submitOvertimeRequest(req, res):
   BODY: { overtime_date, hours_requested, reason, attendance_id }
   - Validasi: hours_requested tidak melebihi max_hours_per_day cabang
   - Validasi: total jam lembur bulan ini tidak melebihi max_hours_per_month
   - Cek hari masuk daftar eligible_days cabang
   - Hitung estimasi overtime_pay = hours * rate (sesuai overtime_settings cabang)
   - Notifikasi ke Kepala Cabang

2. processOvertimeRequest(req, res):
   BODY: { action: 'approve'|'reject', hours_actual, notes }
   - hours_actual bisa berbeda dari hours_requested
   - Recalculate overtime_pay berdasarkan hours_actual
   - Update attendance.overtime_hours

3. getOvertimeRequests(req, res):
   - Filter: branch_id, status, date_range

Buat views/attendance/overtime/index.ejs:
- Tabel pengajuan lembur dengan kolom:
  Karyawan, Tanggal, Jam Diajukan, Jam Aktual, Estimasi Bayar, Status, Aksi
- Badge status: pending=kuning, approved=hijau, rejected=merah
- Modal approval: input hours_actual + catatan

Buat views/attendance/overtime/form.ejs:
- Pilih tanggal → auto-load info overtime_settings cabang
- Input jam lembur dengan preview kalkulasi biaya real-time
- "Estimasi biaya lembur: Rp X.XXX" (update saat jam diubah)
```

---

## Sprint 6 — Payroll Engine

### 🎯 Goal
Inti sistem penggajian: kalkulasi otomatis, prorata untuk mutasi/masuk-tengah-periode, preview, approval, lock, dan generate slip gaji PDF.

### 💬 Prompt S-06-A: Payroll Service (Core Engine)

```
Buatkan PayrollService.js sebagai mesin kalkulasi gaji utama samudraHRD.
Ini adalah bagian PALING KRITIS dari aplikasi.

Buat services/PayrollService.js dengan fungsi-fungsi berikut:

=== calculateEmployeePayroll(employeeId, payrollId, periodStart, periodEnd) ===

FUNGSI INI MENGHITUNG GAJI PER KARYAWAN. Alurnya:

STEP 1 — Ambil data yang diperlukan:
  const employee = await Employee.findById(employeeId).populate('branch_id position_id');
  const salaryConfig = await SalaryConfig.findOne({ employee_id: employeeId, is_current: true });
  const branch = employee.branch_id;
  const overtimeSetting = await OvertimeSetting.findOne({ branch_id: branch._id });

STEP 2 — Cek apakah ada mutasi di periode ini:
  const mutations = await MutationHistory.find({
    employee_id: employeeId,
    effective_date: { $gte: periodStart, $lte: periodEnd }
  });
  const isProrata = mutations.length > 0 || isNewEmployee || isResigning;

STEP 3A — Jika TIDAK prorata (normal):
  const recap = await AttendanceRecap.findOne({
    employee_id: employeeId,
    period_year, period_month
  });
  Gunakan present_days, late_days, total_overtime_hours dari recap.
  Kalkulasi semua 9 komponen gaji:

  let components = {
    base_salary: salaryConfig.base_salary,
    tenure_allowance: salaryConfig.tenure_allowance,
    position_allowance: salaryConfig.position_allowance,
    performance_allowance: salaryConfig.performance_allowance,
    daily_pay: employee.payment_cycle === 'daily'
                 ? salaryConfig.daily_rate * recap.present_days : 0,
    meal_allowance: salaryConfig.meal_allowance * recap.meal_eligible_days,
    fuel_allowance: salaryConfig.fuel_allowance,
    overtime_pay: recap.total_overtime_hours * (salaryConfig.overtime_rate_per_hour || overtimeSetting.rate_per_hour),
    bonus: salaryConfig.bonus,
  };
  let gross = Object.values(components).reduce((a, b) => a + b, 0);

STEP 3B — Jika ADA prorata (split per segmen):
  Bagi periode menjadi segmen-segmen berdasarkan tanggal mutasi:
  Segmen 1: periodStart → mutation.effective_date - 1 hari (konfigurasi cabang asal)
  Segmen 2: mutation.effective_date → periodEnd (konfigurasi cabang tujuan)

  Per segmen: ambil working_days, kalkulasi komponen dengan salary_config yang sesuai
  Simpan prorata_segments array untuk audit
  Gabungkan hasil semua segmen

STEP 4 — Hitung potongan piutang:
  const installments = await ReceivableInstallment.find({
    employee_id: employeeId,
    status: { $in: ['pending', 'overdue'] },
    due_date: { $gte: periodStart, $lte: periodEnd }
  });
  let receivable_deduction = installments.reduce((sum, inst) => sum + inst.amount, 0);

STEP 5 — Hitung net:
  let net_amount = gross - receivable_deduction;
  if (net_amount < 0) net_amount = 0; // Gaji tidak boleh negatif

STEP 6 — Simpan ke payroll_details:
  Upsert PayrollDetail dengan semua komponen + flag is_prorata

STEP 7 — Update cicilan piutang:
  Untuk setiap installment yang diproses: set payroll_detail_id = detailId
  (Status masih 'pending', akan di-update ke 'paid' saat payroll berstatus PAID)

Return: { success, detail_id, gross_amount, net_amount, is_prorata }

=== calculateWorkingDays(start, end, branchId) ===
  Hitung hari kerja dalam range (exclude holidays dan hari libur cabang)
  Gunakan work_schedule.work_days untuk menentukan hari kerja

=== processBatchPayroll(payrollId) ===
  FUNGSI INI DIPANGGIL OLEH BACKGROUND JOB (Agenda.js):
  1. Ambil payroll header
  2. Ambil semua karyawan aktif di cabang dengan payment_cycle yang sesuai
  3. Update payroll.status = 'processing'
  4. Loop setiap karyawan: panggil calculateEmployeePayroll()
  5. Setelah semua selesai: update summary di payroll header (total_employees, total_gross, total_net, dll.)
  6. Update payroll.status = 'reviewed'
  7. Notifikasi ke Manager HRD: "Payroll [periode] cabang [X] selesai diproses, menunggu approval"
  8. Catat ke ActivityLog

Sertakan error handling yang baik: jika satu karyawan gagal, catat error tapi lanjut ke karyawan berikutnya.
Semua operasi DB dalam satu batch menggunakan bulkWrite() untuk performa.
```

### 💬 Prompt S-06-B: Payroll Controller & UI

```
Buatkan controller dan UI untuk modul Payroll samudraHRD.

Buat controllers/payroll/payrollController.js:

1. initPayroll(req, res) — POST /payrolls:
   BODY: { branch_id, period_start, period_end, cycle_type }
   - Validasi: tidak ada payroll DRAFT/PROCESSING untuk branch+periode yang sama
   - Buat payroll header (status=draft)
   - Trigger Agenda.js background job: processBatchPayroll(payrollId)
   - Return: { payroll_id, message: 'Payroll sedang diproses...' }

2. getPayrolls(req, res) — GET /payrolls:
   - Filter: branch_id, status, cycle_type, period_year, period_month
   - Populate: branch, processed_by, approved_by
   - Sort: period_start desc

3. getPayrollDetail(req, res) — GET /payrolls/:id:
   - Include semua payroll_details dengan employee info
   - Summary: total_employees, total_gross, total_deductions, total_net

4. previewPayroll(req, res) — GET /payrolls/:id/preview:
   - Detail per karyawan: nama, gross, deductions, net
   - Highlight karyawan dengan is_prorata = true
   - Highlight karyawan dengan receivable_deduction > 0

5. approvePayroll(req, res) — PATCH /payrolls/:id/approve:
   - Hanya manager_hrd
   - Set status = approved, approved_by, approved_at
   - Notifikasi ke processed_by

6. lockPayroll(req, res) — PATCH /payrolls/:id/lock:
   - Set status = locked, is_locked = true
   - Update semua receivable_installments yang terkait: status = paid
   - Update receivables.paid_amount dan remaining_balance
   - Generate financial_journal entries (debet: Beban Gaji, kredit: Kas/Bank)
   - Notifikasi ke kasir untuk proses pembayaran

7. generateSlips(req, res) — POST /payrolls/:id/generate-slips:
   - Background job untuk generate semua slip PDF
   - Progress bisa dipantau via GET /payrolls/:id/slip-progress

8. adjustPayroll(req, res) — POST /payrolls/:id/adjust:
   BODY: { employee_id, component: 'bonus'|'other_allowances'|'other_deductions', amount, notes }
   - Hanya sebelum status = locked
   - Update payroll_detail + recalculate gross/net
   - Catat ke ActivityLog dengan old_value dan new_value

Buat views/payroll/index.ejs:
- Tabel daftar payroll: Periode, Cabang, Siklus, Status (badge), Total Karyawan, Total Gaji, Aksi
- Status badge: draft=abu, processing=biru loading, reviewed=kuning, approved=hijau, locked=hitam
- Tombol: Lihat Detail, Approve, Lock, Generate Slip, Export Bank

Buat views/payroll/detail.ejs:
- Header info: Cabang, Periode, Status, Summary finansial
- Tabel detail per karyawan:
  Nama | Hadir | Gaji Pokok | Tunjangan Total | Lembur | Uang Makan | Potongan Piutang | Gaji Bersih | Prorata?
- Row highlight: kuning jika is_prorata, merah jika ada large receivable_deduction
- Tombol per row: Lihat breakdown lengkap (modal)
- Modal breakdown: card per komponen gaji + perhitungan detail
- Tombol Adjust Gaji (untuk koreksi manual sebelum locked)
- Tombol: Approve Payroll, Lock Payroll, Generate Semua Slip

Buat views/payroll/slip-template.ejs (template HTML untuk generate PDF):
- Header: Logo perusahaan, nama perusahaan, judul "SLIP GAJI"
- Info karyawan: Nama, Employee Code, Jabatan, Departemen, Cabang, Periode
- Tabel Pendapatan: tiap komponen + nominal
- Tabel Potongan: cicilan piutang (jika ada)
- GAJI BERSIH: angka besar di bawah
- Tanda tangan: Manager HRD / Kepala Cabang
- Footer: watermark "KONFIDENSIAL"
- QR Code kecil untuk verifikasi keaslian slip
```

### 💬 Prompt S-06-C: PDF Generation & Salary Slip

```
Buatkan PdfService.js untuk generate slip gaji menggunakan Puppeteer.

Buat services/PdfService.js:

=== generateSalarySlip(payrollDetailId) ===

1. Ambil data lengkap:
   const detail = await PayrollDetail.findById(id)
     .populate('employee_id branch_id payroll_id salary_config_id');

2. Render HTML dari EJS template:
   const html = await ejs.renderFile(
     'views/payroll/slip-template.ejs',
     { employee, detail, company, payroll }
   );

3. Generate PDF dengan Puppeteer:
   const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
   const page = await browser.newPage();
   await page.setContent(html, { waitUntil: 'networkidle0' });
   const pdf = await page.pdf({
     format: 'A5',
     printBackground: true,
     margin: { top: '1cm', bottom: '1cm', left: '1cm', right: '1cm' }
   });
   await browser.close();

4. Upload ke MinIO:
   const filename = `payslips/${year}/${month}/${slip_number}.pdf`;
   await minioClient.putObject(BUCKET, filename, pdf);
   const url = await minioClient.presignedGetObject(BUCKET, filename, 24*60*60);

5. Simpan ke salary_slips collection:
   await SalarySlip.create({ payroll_id, payroll_detail_id, employee_id, pdf_url: url, ... });

6. Return: { slip_id, pdf_url }

=== generateBatchSlips(payrollId) ===
  Loop semua payroll_details, panggil generateSalarySlip() per karyawan
  Progress tracking: simpan ke Redis key payroll:slip-progress:[payrollId]
  Update progressnya per karyawan selesai

=== Endpoint progress: GET /payrolls/:id/slip-progress ===
  Ambil dari Redis: { total, done, percentage, errors }

=== generateExportExcel(payrollId) ===
  Gunakan ExcelJS untuk generate file .xlsx:
  - Sheet 1: Summary (total per komponen untuk semua karyawan)
  - Sheet 2: Detail per karyawan (semua kolom)
  - Sheet 3: Format Transfer Bank (BCA: no_rek, nama, nominal)
  - Style: header bold, number format Rupiah, alternating row color

Buat services/ExcelService.js:
  generatePayrollExcel(payrollId) → Buffer xlsx
  generateAttendanceExcel(filters) → Buffer xlsx
  generateEmployeeExcel(filters) → Buffer xlsx
  generateReceivableExcel(filters) → Buffer xlsx
  (Setiap fungsi return Buffer yang bisa langsung di-send sebagai download)
```

### ✅ Acceptance Criteria S-06
- [ ] `POST /payrolls` trigger background job, status berubah ke `processing`
- [ ] Prorata: karyawan mutasi tanggal 15 → gaji split 2 segmen di `prorata_segments`
- [ ] Payroll `locked` → `receivable_installments` status berubah ke `paid`
- [ ] Slip gaji PDF ter-generate dan dapat didownload
- [ ] Export Excel berisi 3 sheet (summary, detail, format bank)

---

## Sprint 7 — Piutang & Receivables

### 💬 Prompt S-07-A: Receivable Engine

```
Buatkan modul Piutang (Receivable) lengkap untuk samudraHRD.

Buat services/ReceivableService.js:

1. validateNewRequest(employeeId, amount):
   - Cek apakah ada receivables dengan status = 'active' → throw error ACTIVE_RECEIVABLE_EXISTS
   - Ambil receivable_settings untuk company
   - Ambil employee.status (KT/KL/Magang) → cek max_amount
   - Cek masa kerja >= min_tenure_months
   - Cek employee tidak di-blacklist (is_blacklisted di receivables)
   - Return: { isValid, reason }

2. determineApprovalLevel(amount, settings):
   - amount < settings.max_amount_branch_approval → 'branch'
   - else → 'hrd'

3. generateInstallmentSchedule(receivableId, startDate, count, amount):
   - Generate N records di receivable_installments
   - due_date: startDate + (index * 30 hari)
   - Simpan semua dengan bulkWrite()

4. processPayment(installmentId, amount, method, recordedBy):
   - Update receivable_installment: paid_amount, status
   - Update receivable.paid_amount += amount
   - Jika remaining_balance <= 0: set receivable.status = 'completed'
   - Buat ReceivablePayment record
   - Buat FinancialJournal entry
   - Return: { remaining_balance, is_completed }

5. checkAndBlacklist(employeeId):
   - Count overdue installments untuk employee ini
   - Jika >= settings.max_overdue_count_blacklist: set blacklist flag
   - Notifikasi ke Manager HRD

Buat controllers/receivables/receivableController.js:

1. submitRequest(req, res) — POST /receivables:
   BODY: { amount, purpose, installment_count, installment_amount, payment_method }
   - Panggil ReceivableService.validateNewRequest()
   - Generate receivable_number: RCV-[KODE_CABANG]-[YYYYMM]-[URUT_4DIGIT]
   - Tentukan approval_level
   - Buat Receivable document
   - Notifikasi Telegram:
     Jika branch: notif ke Kepala Cabang + info ke Manager HRD
     Jika hrd: notif ke Manager HRD

2. processApproval(req, res) — PATCH /receivables/:id/process:
   BODY: { action: 'approve'|'reject', rejection_reason }
   - Validasi role sesuai approval_level
   - Jika approve: set status = approved
   - Buat installment schedule: panggil generateInstallmentSchedule()
   - Set disbursed_at = null (belum dicairkan)
   - Notifikasi ke karyawan

3. recordDisbursement(req, res) — POST /receivables/:id/disburse:
   BODY: { disbursement_method: 'cash'|'transfer', proof_url }
   - Set disbursed_at = now, status = active
   - Buat FinancialJournal: Debet=Piutang Karyawan, Kredit=Kas/Bank

4. recordDirectPayment(req, res) — POST /receivable-payments:
   BODY: { installment_id, amount, payment_method, receipt_url }
   - Hanya kasir atau staff_admin
   - Panggil ReceivableService.processPayment()
   - Upload bukti pembayaran ke MinIO

5. getReceivables(req, res):
   - Filter: branch_id, status, employee_id, date_range
   - Include: remaining_balance, installment progress (X/N lunas)

6. getAgingReport(req, res) — GET /receivables/aging:
   - Group by usia keterlambatan: Current (belum jatuh tempo), 1-30 hari, 31-60, 61-90, >90 hari
   - Total per bucket
   - Hanya admin/manager_hrd

Buat views/receivables/index.ejs:
- 3 tab: Daftar Piutang | Menunggu Approval | Laporan Aging

TAB Daftar:
- Tabel: No. Piutang, Karyawan, Cabang, Nominal, Sudah Bayar, Sisa, Cicilan, Status, Aksi
- Filter: Status, Cabang, Tanggal
- Progress bar cicilan: 3/12 cicilan lunas

TAB Approval:
- Card antrian per pengajuan:
  Nama karyawan | Nominal (merah jika >= 1jt) | Tujuan | Tgl Pengajuan
  Tombol: Setujui (hijau) | Tolak (merah) | Lihat Detail
- Badge "HRD Required" jika nominal >= 1jt

TAB Aging:
- Tabel berwarna:
  Current (hijau) | 1-30 hari (kuning) | 31-60 hari (oranye) | 61-90 hari (merah muda) | >90 hari (merah)
- Chart donut distribusi

Buat views/receivables/detail.ejs:
- Info piutang: nominal, tujuan, status, tanggal
- Progress bar: Rp X dari Rp Y sudah terbayar (% circle)
- Jadwal cicilan (tabel):
  No | Jatuh Tempo | Nominal | Bayar | Status | Metode | Tgl Bayar
  Row color: paid=hijau, overdue=merah, pending=normal
- Tombol "Catat Pembayaran" (kasir) → modal dengan upload bukti
- Riwayat pembayaran di bawah
```

### 💬 Prompt S-07-B: Receivable Cron Jobs

```
Buatkan Cron Jobs untuk modul Piutang samudraHRD.

Buat jobs/receivableJob.js:

=== JOB 1: Scan Jatuh Tempo (setiap hari jam 07:00) ===
Schedule: '0 7 * * *'

async function checkDueDates() {
  const today = new Date();
  const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

  // Cari cicilan yang jatuh tempo dalam 3 hari
  const upcoming = await ReceivableInstallment.find({
    due_date: { $gte: today, $lte: threeDaysLater },
    status: 'pending',
    reminder_sent_at: null  // Belum pernah di-reminder
  }).populate('receivable_id employee_id');

  for (const installment of upcoming) {
    // Notifikasi ke karyawan
    await NotificationService.send({
      user_id: installment.employee_id.user_id,
      type: 'receivable_due',
      title: 'Cicilan Piutang Jatuh Tempo',
      message: `Cicilan ke-${installment.installment_number} sebesar Rp ${formatRupiah(installment.amount)} jatuh tempo pada ${formatDate(installment.due_date)}`,
      channel: 'telegram'
    });

    // Notifikasi ke Kasir cabang
    await NotificationService.notifyRole('kasir', installment.receivable_id.branch_id, {
      message: `Cicilan piutang ${installment.employee_id.full_name} jatuh tempo ${formatDate(installment.due_date)}`
    });

    // Update reminder_sent_at
    await ReceivableInstallment.findByIdAndUpdate(installment._id, {
      reminder_sent_at: new Date()
    });
  }
}

=== JOB 2: Mark Overdue (setiap hari jam 00:01) ===
Schedule: '1 0 * * *'

async function markOverdueInstallments() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const overdue = await ReceivableInstallment.updateMany(
    { due_date: { $lt: yesterday }, status: 'pending' },
    { $set: { status: 'overdue' }, $inc: { overdue_count: 1 } }
  );

  // Cek blacklist threshold
  const overdueEmployees = await ReceivableInstallment.aggregate([
    { $match: { status: 'overdue' } },
    { $group: { _id: '$employee_id', total_overdue: { $sum: 1 } } },
    { $match: { total_overdue: { $gte: settings.max_overdue_count_blacklist } } }
  ]);

  for (const emp of overdueEmployees) {
    await ReceivableService.checkAndBlacklist(emp._id);
  }
}

Sertakan logging dengan winston untuk setiap job yang berjalan.
Buat helper function formatRupiah(number) dan formatDate(date) di utils/formatter.js.
```

### ✅ Acceptance Criteria S-07
- [ ] Pengajuan piutang Rp 500.000 → notif ke Kepala Cabang (bukan Manager HRD)
- [ ] Pengajuan piutang Rp 2.000.000 → notif ke Manager HRD
- [ ] Karyawan dengan piutang aktif tidak bisa ajukan baru
- [ ] Cicilan H-3 → notifikasi Telegram ke karyawan dan kasir
- [ ] Cicilan via potong gaji: `receivable_deduction` masuk ke `payroll_detail`
- [ ] Laporan aging menampilkan data terkelompok dengan benar
---

## Sprint 8 — Dashboard & Laporan

### 💬 Prompt S-08: Dashboard & Reports

```
Buatkan Dashboard dan modul Laporan lengkap untuk samudraHRD.

=== DASHBOARD API ===

Buat controllers/dashboard/dashboardController.js:

1. getAdminDashboard(req, res) — GET /dashboard/admin:
   Data yang dikembalikan:
   {
     employees: {
       total: number,            // Semua karyawan aktif
       by_status: { KT, KL, Magang },
       new_this_month: number,   // Bergabung bulan ini
       resigned_this_month: number
     },
     attendance_today: {
       present: number,
       late: number,
       permit: number,
       sick: number,
       alpha: number,
       not_yet: number,          // Belum absen sama sekali
       attendance_rate: number   // % hadir
     },
     payroll_this_month: {
       total_processed: number,
       status_draft: number,
       status_approved: number,
       total_amount: number
     },
     receivables: {
       total_active: number,
       total_outstanding: number,  // Total sisa piutang
       due_this_week: number,      // Cicilan jatuh tempo minggu ini
       overdue_count: number
     },
     leave_pending: number,
     overtime_pending: number,
     alerts: [
       { type, message, count }   // Kontrak habis, masa percobaan, dll.
     ],
     attendance_chart_30days: [   // Array 30 hari terakhir
       { date, present, absent }
     ],
     employee_distribution: {     // Pie chart
       by_branch: [{ name, count }],
       by_department: [{ name, count }]
     },
     employees_not_checkin: [     // List karyawan belum absen
       { employee_code, full_name, branch_name }
     ]
   }

2. getBranchDashboard(req, res) — GET /dashboard/branch:
   Data yang sama tapi difilter by req.user.branch_id

3. getKasirDashboard(req, res) — GET /dashboard/kasir:
   {
     payments_today: [{ employee, amount, cycle_type }],
     installments_due_today: [{ employee, receivable_number, amount }],
     installments_overdue: [{ employee, receivable_number, amount, days_overdue }]
   }

SEMUA QUERY HARUS EFISIEN:
- Gunakan MongoDB Aggregate Pipeline, BUKAN multiple queries terpisah
- Cache hasil di Redis dengan TTL 5 menit (key: dashboard:[role]:[branch_id])
- Invalidate cache saat ada event: attendance check-in, payroll update, dll.

Buat views/dashboard/admin.ejs:
- Layout 2 kolom (sidebar 25% + main 75%)
- ROW 1: 6 stat cards kecil (Total Karyawan, Hadir Hari Ini, Pending Approval, Payroll Bulan Ini, Piutang Aktif, Lembur Pending) — masing-masing dengan icon Bootstrap Icons + warna berbeda
- ROW 2: Chart kehadiran 30 hari (Line Chart - Chart.js) + Pie chart distribusi karyawan
- ROW 3: Tabel "Karyawan Belum Absen" (real-time, Socket.IO) + Alert cards (kontrak habis, dll.)
- ROW 4: Recent Activity (5 aktivitas terakhir dari activity_logs)

Buat views/dashboard/branch.ejs:
- Versi lebih sederhana hanya data cabangnya sendiri
- Fokus pada: kehadiran hari ini (tabel live) + pengajuan menunggu + jadwal shift hari ini

=== LAPORAN ===

Buat controllers/reports/reportController.js:

1. employeeReport(req, res) — GET /reports/employees:
   Filter: branch, dept, status, join_date_range
   Format: tabel + export PDF/Excel

2. attendanceReport(req, res) — GET /reports/attendance:
   Filter: branch, dept, employee, period_range, status
   Group by: per karyawan atau per hari
   Export: Excel (seperti spesifikasi di Sprint 4)

3. payrollReport(req, res) — GET /reports/payroll:
   Filter: branch, cycle_type, period_range
   Summary per cabang + detail per karyawan
   Export: Excel multi-sheet

4. receivableReport(req, res) — GET /reports/receivables:
   Filter: branch, status, date_range
   Include: aging analysis
   Export: Excel

Buat views/reports/index.ejs:
- Menu laporan dengan card grid:
  📊 Laporan Karyawan | 📅 Laporan Kehadiran | 💰 Laporan Gaji | 📋 Laporan Piutang
- Setiap card: klik → halaman filter + preview data + tombol export

Setiap halaman laporan harus:
1. Tampilkan filter form di atas
2. Preview data dalam tabel (max 50 baris)
3. Tombol "Export Excel" dan "Export PDF" yang download file langsung
4. Tombol "Kirim ke Email" (kirim file ke email yang diinput)

Gunakan Chart.js untuk semua chart. Semua chart harus responsive.
```

---

## Sprint 9 — Notifikasi & Telegram Bot

### 💬 Prompt S-09-A: Notification Service

```
Buatkan sistem notifikasi terpusat dan Telegram Bot untuk samudraHRD.

=== NOTIFICATION SERVICE ===

Buat services/NotificationService.js:

async send({ user_id, company_id, type, title, message, channel, reference_id, reference_type, action_url }):
  1. Simpan ke notifications collection
  2. Berdasarkan channel:
     - 'in_app'   → emit Socket.IO event ke room user_[user_id]
     - 'email'    → panggil EmailService.send()
     - 'telegram' → panggil TelegramService.sendMessage()
  3. Jika gagal: retry 3x dengan exponential backoff
  4. Update is_sent, sent_at, atau send_error

async notifyRole(roleSlug, branchId, notifData):
  Ambil semua users dengan role=roleSlug dan branch_id=branchId
  Panggil send() untuk setiap user

async notifyCompany(companyId, notifData):
  Notifikasi ke semua user aktif di company

Buat GET /notifications endpoint:
  Ambil notifikasi in_app untuk req.user, is_read=false
  Pagination: page, limit=20
  Include: unread_count

Buat PATCH /notifications/:id/read endpoint:
Buat PATCH /notifications/read-all endpoint:

=== EMAIL SERVICE ===

Buat services/EmailService.js dengan nodemailer:

send({ to, subject, template, data }):
  - Load EJS template dari views/emails/[template].ejs
  - Render dengan data
  - Send via SMTP
  - Template yang ada:
    - welcome.ejs (user baru)
    - leave-approved.ejs
    - leave-rejected.ejs
    - salary-slip.ejs (dengan attachment PDF)
    - payroll-processed.ejs
    - contract-expiry.ejs
    - password-reset.ejs

Buat views/emails/ folder dengan template email HTML yang profesional.
Email template harus responsive dengan tabel-based layout (untuk kompatibilitas email client).

=== IN-APP NOTIFIKASI UI ===

Di views/layouts/main.ejs:
- Bell icon di navbar dengan badge count (unread_count)
- Dropdown notifikasi (max 5 terbaru + link "Lihat Semua")
- Setiap item: icon tipe, teks, waktu relative (2 menit lalu), dot unread
- Klik item → mark as read + navigate ke action_url
- Auto-update count via Socket.IO event 'notification:new'
```

### 💬 Prompt S-09-B: Telegram Bot

```
Buatkan Telegram Bot lengkap untuk samudraHRD menggunakan node-telegram-bot-api.

Buat services/TelegramService.js:

=== BOT SETUP ===
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

=== COMMAND HANDLERS ===

1. /start:
   bot.onText(/\/start/, async (msg) => {
     const chatId = msg.chat.id;
     await bot.sendMessage(chatId,
       '🏢 *Selamat datang di samudraHRD Bot!*\n\n' +
       'Bot ini digunakan untuk notifikasi sistem HRD, Absensi & Payroll.\n\n' +
       '📌 Untuk mendaftarkan akun Telegram Anda:\n' +
       'Kirim: /register [kode_karyawan]\n\n' +
       'Contoh: /register JKT-KT-0001',
       { parse_mode: 'Markdown' }
     );
   });

2. /register [employee_code]:
   - Cari employee dengan employee_code
   - Cari user yang terhubung ke employee
   - Generate OTP 6 digit, simpan ke Redis (TTL 10 menit)
   - Kirim OTP ke nomor telepon atau email karyawan (bukan Telegram)
   - Reply: "Kode verifikasi telah dikirim ke email Anda. Gunakan /verify [kode] untuk konfirmasi."

3. /verify [otp_code]:
   - Verify OTP dari Redis
   - Update users.telegram_chat_id = chatId, telegram_verified = true
   - Reply: "✅ Akun Telegram berhasil terhubung! Anda akan menerima notifikasi penting di sini."

4. /saldo:
   - Cek apakah chat_id terdaftar
   - Return piutang aktif + remaining_balance
   - Format:
     "💳 *Piutang Aktif Anda*\n
      No: RCV-JKT-202501-0001\n
      Nominal: Rp 2.000.000\n
      Sisa: Rp 1.400.000\n
      Cicilan berikutnya: 15 Februari 2025 (Rp 200.000)"

5. /cutitersisa:
   - Return saldo cuti per jenis
   - Format tabel sederhana

6. /kehadiran [bulan] [tahun]:
   - Return rekap kehadiran dari attendance_recaps
   - Format:
     "📅 *Rekap Kehadiran Januari 2025*\n
      Hadir: 22 hari\n
      Terlambat: 2 hari\n
      Izin: 1 hari\n
      Alpa: 0 hari\n
      Persentase: 95.6%"

7. /slip [bulan] [tahun]:
   - Cari salary_slip untuk periode tersebut
   - Kirim file PDF sebagai document attachment
   - bot.sendDocument(chatId, pdf_url, { caption: 'Slip Gaji Anda' })

=== SEND FUNCTIONS (dipanggil dari NotificationService) ===

sendMessage(chatId, text, options):
  bot.sendMessage(chatId, text, { parse_mode: 'Markdown', ...options })

sendDocument(chatId, fileUrl, caption):
  bot.sendDocument(chatId, fileUrl, { caption })

sendApprovalRequest(chatId, type, data, approvalId):
  Kirim pesan dengan inline keyboard:
  [✅ Setujui] [❌ Tolak]
  bot.sendMessage(chatId, text, {
    reply_markup: {
      inline_keyboard: [[
        { text: '✅ Setujui', callback_data: `approve:${type}:${approvalId}` },
        { text: '❌ Tolak', callback_data: `reject:${type}:${approvalId}` }
      ]]
    }
  })

=== CALLBACK QUERY (inline button handler) ===

bot.on('callback_query', async (query) => {
  const [action, type, id] = query.data.split(':');
  // Proses approve/reject via API internal
  // Update pesan setelah aksi: "✅ Disetujui oleh [nama] pada [waktu]"
});

=== FORMAT PESAN NOTIFIKASI ===

Buat fungsi formatter per tipe notifikasi:
- formatLeaveRequest(data)      → teks pengajuan cuti
- formatReceivableRequest(data) → teks pengajuan piutang
- formatSalarySlip(data)        → teks slip gaji tersedia
- formatInstallmentDue(data)    → teks cicilan jatuh tempo

Setiap formatter return string Markdown yang rapi dengan emoji yang relevan.
```

### ✅ Acceptance Criteria S-09
- [ ] `/register JKT-KT-0001` → OTP terkirim ke email karyawan
- [ ] `/slip 1 2025` → Bot kirim file PDF slip gaji
- [ ] Kepala Cabang terima notif Telegram saat ada cuti pending + tombol Approve/Tolak
- [ ] Bell icon navbar update count real-time tanpa refresh (Socket.IO)

---

## Sprint 10 — Dokumen, Persuratan & ID Card

### 💬 Prompt S-10: Document Management

```
Buatkan modul Persuratan, Template Dokumen, dan ID Card Generator untuk samudraHRD.

=== TEMPLATE MANAGEMENT ===

Buat controllers/documents/templateController.js:
- CRUD document_templates
- Template menggunakan variabel dalam format: {{variable_name}}
- Available variables: employee.*,  branch.*, company.*, position.*, department.*,
  date_today, signature_name, signature_position

Buat views/documents/templates/editor.ejs:
- Rich text editor menggunakan TinyMCE atau Quill.js
- Panel kanan: daftar available_variables yang bisa diklik → auto-insert ke cursor
- Preview button: render template dengan data sample karyawan
- Page settings: ukuran kertas, orientasi

=== GENERATE SURAT ===

Buat controllers/documents/hrDocumentController.js:

1. generateDocument(req, res) — POST /documents/generate:
   BODY: { template_id, employee_id, extra_data }
   - Load template
   - Ambil data karyawan + semua relasi
   - Replace semua {{variable}} dengan data nyata
   - Generate PDF dengan Puppeteer
   - Simpan ke hr_documents + MinIO
   - Return: { document_id, pdf_url, preview_html }

2. getDocuments(req, res):
   - Filter: employee_id, template_type, date_range
   - Hanya bisa akses dokumen karyawan di cabangnya

3. signDocument(req, res) — POST /documents/:id/sign:
   - Set signed_by, signer_name, signer_position, status = signed
   - Tambahkan tanda tangan digital (nama + jabatan) ke PDF (re-render)

Buat views/documents/index.ejs:
- List template surat yang tersedia (card grid):
  📄 Surat Pengangkatan | ⚠️ Surat Peringatan | 🔄 Surat Mutasi | 🏁 Surat Pemberhentian | dll.
- Klik template → modal pilih karyawan + isi extra_data
- Generate → preview HTML → Approve & Cetak

Buat views/documents/history.ejs:
- Riwayat semua dokumen yang pernah di-generate
- Filter: karyawan, tipe, tanggal
- Download PDF per dokumen

=== ID CARD GENERATOR ===

Buat services/IdCardService.js:

generateIdCard(employeeId):
  1. Ambil data karyawan + company + branch
  2. Render HTML template id-card-template.ejs:
     - Ukuran: 85.6mm × 54mm (standard kartu)
     - Depan: Logo company, Nama, Employee Code, Jabatan, Foto, QR Code
     - Belakang: Cabang, Departemen, Telp Darurat, Tgl Berlaku
  3. Generate PDF dengan Puppeteer (2 halaman: depan & belakang)
  4. Upload ke MinIO
  5. Simpan URL ke employee record

Buat views/documents/id-card-template.ejs:
- Design ID Card yang profesional dengan CSS:
  - Background gradient dengan warna brand perusahaan
  - Border radius, shadow
  - Layout yang presisi sesuai ukuran kartu fisik
  - QR Code terintegrasi di pojok kanan bawah

Buat endpoint:
GET /employees/:id/id-card → download PDF ID card
POST /employees/bulk-id-cards → generate ID card untuk multiple karyawan sekaligus
  BODY: { employee_ids: [...] }
  Return: ZIP file berisi semua PDF ID card
```

---

## Sprint 11 — Mobile App & Face Recognition

### 💬 Prompt S-11-A: React Native Expo Setup

```
Buatkan project React Native Expo untuk aplikasi mobile samudraHRD Android.
Ini adalah aplikasi khusus untuk Face Recognition Attendance.

SETUP:
npx create-expo-app samudraHRD-Mobile --template blank
cd samudraHRD-Mobile

Install dependencies:
- expo-camera (untuk akses kamera)
- expo-face-detector (face detection dasar)
- expo-location (GPS untuk geo-fencing)
- expo-secure-store (simpan JWT token)
- expo-notifications (push notification via FCM)
- axios (HTTP requests ke backend API)
- @react-navigation/native + @react-navigation/stack
- react-native-paper (UI components)
- react-native-vector-icons

Buat struktur folder:
mobile/
├── 
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── HomeScreen.js
│   │   ├── AttendanceScreen.js  ← UTAMA
│   │   ├── HistoryScreen.js
│   │   └── ProfileScreen.js
│   ├── components/
│   │   ├── FaceCamera.js
│   │   └── LivenessDetector.js
│   ├── services/
│   │   ├── ApiService.js
│   │   └── AuthService.js
│   └── utils/
│       └── formatters.js
├── App.js
└── app.json

Buat App.js dengan React Navigation:
- Stack: Login → (Home, Attendance, History, Profile)
- Auth check saat startup dari SecureStore
- Global axios interceptor untuk token refresh

Buat LoginScreen.js:
- Form: username + password
- Loading spinner saat login
- Error message
- Simpan token ke SecureStore
- Navigate ke Home jika sukses
```

### 💬 Prompt S-11-B: Face Recognition Attendance Screen

```
Buatkan AttendanceScreen.js untuk face recognition attendance di React Native Expo.

=== ALUR LENGKAP ===

STEP 1: Permission check
  - Minta izin kamera (expo-camera)
  - Minta izin lokasi (expo-location)
  - Jika ditolak: tampilkan instruksi cara enable

STEP 2: Ambil lokasi GPS
  const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });

STEP 3: Kamera dengan face detection
  Buat komponen FaceCamera.js:
  - Gunakan expo-camera dengan Camera.Constants.Type.front (kamera depan)
  - Enable expo-face-detector: real-time face detection
  - Visual feedback:
    - Overlay oval/circle di tengah layar sebagai guide wajah
    - Warna abu: belum terdeteksi wajah
    - Warna kuning: wajah terdeteksi, sedang analisis
    - Warna hijau: siap capture
  - Auto-capture saat wajah terdeteksi stabil (0.5 detik steady)

STEP 4: Liveness Detection (anti-spoofing sederhana)
  Buat LivenessDetector.js:
  Challenge-response sederhana:
  - Tampilkan instruksi: "Kedipkan mata" ATAU "Palingkan wajah ke kanan"
  - Deteksi gerakan yang diminta via face landmarks
  - Timeout 10 detik, jika gagal: retry
  - Jika lulus: lanjut capture

STEP 5: Capture dan kirim ke server
  1. Capture frame kamera: await cameraRef.current.takePictureAsync({ quality: 0.7, base64: true })
  2. Resize gambar ke 640x640
  3. Kirim ke API:
     POST /api/v1/attendance/face-checkin
     {
       employee_id: currentUser.employee_id,
       face_image: base64String,  // base64 JPEG
       latitude: location.coords.latitude,
       longitude: location.coords.longitude
     }

STEP 6: Handle response
  - 200 Success: animasi check centang hijau + pesan "Check-in Berhasil! 08:00 WIB"
  - 401 (wajah tidak cocok): pesan error merah + tombol retry
  - 403 (anti-spoofing gagal): pesan peringatan
  - 409 (sudah absen): tampilkan waktu check-in sebelumnya
  - Jaringan error: simpan ke local queue, retry saat online (offline mode basic)

STEP 7: UI Screen lengkap
  - Header: tanggal hari ini + jam live (update setiap detik)
  - Preview kamera (full screen 60% layar)
  - Status indicator: "Posisikan wajah dalam lingkaran"
  - Tombol manual (fallback): "Absen Manual" → link ke web app
  - History hari ini: jam check-in dan check-out

Buat tampilan yang intuitif dan responsif.
Gunakan Animated API React Native untuk animasi transisi.
Handle semua error case dengan pesan yang user-friendly dalam Bahasa Indonesia.
```

### 💬 Prompt S-11-C: Backend Face Recognition API

```
Buatkan backend endpoint untuk Face Recognition attendance samudraHRD.

Buat controllers/attendance/faceAttendanceController.js:

POST /api/v1/attendance/face-checkin:

1. Parse request:
   const { employee_id, face_image, latitude, longitude } = req.body;
   // face_image adalah base64 JPEG string

2. Validasi geo-fencing:
   const branch = await Branch.findById(employee.branch_id);
   const isInZone = AttendanceService.validateGeofence(
     latitude, longitude,
     branch.latitude, branch.longitude,
     branch.geofence_radius
   );
   if (!isInZone) return res.status(403).json({ error: { code: 'OUT_OF_ZONE', distance } });

3. Load face encoding karyawan dari DB:
   const employee = await Employee.findById(employee_id).select('+face_encoding');
   if (!employee.face_encoding) {
     return res.status(400).json({ error: { code: 'FACE_NOT_REGISTERED' } });
   }

4. Face comparison:
   Gunakan salah satu approach:
   OPTION A (Cloud): AWS Rekognition CompareFaces API
   OPTION B (Self-hosted): Kirim kedua gambar ke Python microservice (face_recognition library)
   OPTION C (Simple): face-api.js di Node.js

   Buat FaceRecognitionService.js:
   async compareFaces(referenceBase64, targetBase64):
     // Implementasi sesuai option yang dipilih
     return { isMatch: boolean, confidence: number (0-1) }

5. Threshold check:
   if (confidence < 0.80) return 401 FACE_NOT_RECOGNIZED

6. Liveness check (opsional, basic):
   Periksa apakah gambar memiliki karakteristik foto live vs foto foto
   (blur detection, noise analysis, dll.)

7. Proses attendance (sama dengan qrCheckin):
   - Cek duplikasi hari ini
   - Kalkulasi status (Hadir/Terlambat)
   - Simpan ke attendances dengan method='Face', check_in_photo_url=saved_photo_url
   - Emit Socket.IO

8. Simpan foto untuk audit:
   Simpan foto selfie ke MinIO: attendance/face/[employee_id]/[date]_[timestamp].jpg

Buat endpoint untuk register wajah:
POST /api/v1/employees/:id/register-face:
  BODY: { face_image (base64) }
  - Generate face encoding dari gambar
  - Simpan ke employees.face_encoding (encrypted)
  - face_registered_at = now

Buat endpoint untuk update wajah:
PUT /api/v1/employees/:id/face-encoding:
  - Admin atau karyawan sendiri
  - Sama seperti register tapi overwrite

Sertakan dokumentasi di Postman Collection untuk semua endpoint face recognition.
```

---

## Sprint 12 — Testing, Audit Trail & Finalisasi

### 💬 Prompt S-12-A: Testing Setup

```
Buatkan konfigurasi testing lengkap untuk samudraHRD menggunakan Jest.

=== SETUP ===

Buat jest.config.js:
{
  testEnvironment: 'node',
  setupFilesAfterFramework: ['./tests/setup.js'],
  coverageThreshold: { global: { lines: 70, functions: 70 } },
  testMatch: ['**/*.test.js']
}

Buat tests/setup.js:
- Connect ke MongoDB in-memory (mongodb-memory-server)
- Seed data: 1 company, 1 branch, roles (5 default), 1 admin user
- Clear all collections setelah setiap test
- Disconnect setelah semua test

=== UNIT TESTS ===

Buat tests/unit/PayrollService.test.js:

describe('PayrollService', () => {
  describe('calculateEmployeePayroll', () => {
    test('TC-001: Normal kalkulasi tanpa prorata', async () => {
      // Setup: karyawan aktif 1 bulan penuh, hadir 22 hari
      // Expected: gaji = base + semua tunjangan + uang makan 22 hari + lembur
      // Assert: gross_amount correct, net = gross - piutang
    });

    test('TC-002: Prorata — karyawan mutasi tanggal 15', async () => {
      // Setup: mutation_histories dengan effective_date = 15 Maret
      // Branch A: meal_allowance=20000, Branch B: meal_allowance=30000
      // Expected: prorata_segments.length = 2
      // Expected: meal_allowance = (14 * 20000) + (16 * 30000) = 760000
    });

    test('TC-003: Potongan piutang masuk ke net', async () => {
      // Setup: ada installment jatuh tempo di periode ini
      // Expected: receivable_deduction = installment.amount
      // Expected: net_amount = gross - receivable_deduction
    });

    test('TC-004: Payroll terkunci tidak bisa diubah', async () => {
      // Setup: payroll dengan is_locked = true
      // Expected: throw error PAYROLL_LOCKED
    });
  });
});

Buat tests/unit/ReceivableService.test.js:

describe('ReceivableService', () => {
  test('TC-005: Tolak pengajuan jika ada piutang aktif', async () => {
    // Setup: karyawan dengan receivable status='active'
    // Expected: validateNewRequest returns { isValid: false, reason: 'ACTIVE_RECEIVABLE' }
  });

  test('TC-006: Amount < 1jt → approval level = branch', async () => {
    // Expected: determineApprovalLevel(500000, settings) = 'branch'
  });

  test('TC-007: Amount >= 1jt → approval level = hrd', async () => {
    // Expected: determineApprovalLevel(1500000, settings) = 'hrd'
  });

  test('TC-008: Saldo berkurang setelah pembayaran', async () => {
    // Setup: receivable amount=1000000, paid=0
    // Action: processPayment(installmentId, 200000, 'cash', userId)
    // Expected: remaining_balance = 800000
  });
});

Buat tests/unit/AttendanceService.test.js:

describe('AttendanceService', () => {
  test('TC-009: Hadir tepat waktu', () => {
    // check_in = 08:00, schedule check_in = 08:00, tolerance = 10 menit
    // Expected: status='Hadir', late_minutes=0
  });

  test('TC-010: Terlambat 25 menit', () => {
    // check_in = 08:25, schedule=08:00, tolerance=10
    // Expected: status='Terlambat', late_minutes=25
  });

  test('TC-011: Geo-fencing valid', () => {
    // User 50m dari kantor, radius=100m
    // Expected: isValid=true
  });

  test('TC-012: Geo-fencing invalid', () => {
    // User 200m dari kantor, radius=100m
    // Expected: isValid=false, distance=200
  });
});

=== INTEGRATION TESTS ===

Buat tests/integration/auth.test.js:
- Test login success + mendapat token
- Test login failed 5x → akun terkunci
- Test token expired → refresh token
- Test RBAC: kasir tidak bisa akses /payrolls

Buat tests/integration/payroll.test.js:
- Test end-to-end payroll: create → process → approve → lock → generate slip
- Verify payroll tidak bisa di-edit setelah locked

=== POSTMAN COLLECTION ===

Buat postman/samudraHRD.postman_collection.json dengan:
- Folder per modul (Auth, Employees, Attendance, Payroll, Receivables)
- Pre-request script: auto-set Authorization header dari environment variable
- Environment: Development (localhost:3000), Staging (staging.samudraHRD.id)
- Test scripts di setiap request: check status code, response format, required fields
- Contoh data (test fixtures) per request
```

### 💬 Prompt S-12-B: Audit Trail & Security Hardening

```
Buatkan sistem Audit Trail lengkap dan security hardening untuk samudraHRD.

=== AUDIT TRAIL MIDDLEWARE ===

Buat middlewares/auditLogger.js:

const auditLog = (module, action) => async (req, res, next) => {
  // Capture response body
  const originalJson = res.json.bind(res);
  let responseBody;
  res.json = (body) => {
    responseBody = body;
    return originalJson(body);
  };

  const startTime = Date.now();
  await next();

  // Setelah response terkirim
  if (req.user && responseBody?.success) {
    const oldValue = res.locals.oldValue || null;  // Di-set oleh controller sebelum update
    const newValue = res.locals.newValue || null;

    await ActivityLog.create({
      user_id: req.user.id,
      company_id: req.user.company_id,
      action: action,
      module: module,
      table_affected: module,
      record_id: req.params.id || responseBody?.data?._id,
      old_value: oldValue,
      new_value: newValue,
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get('user-agent'),
      description: `${action} ${module} by ${req.user.username}`,
      timestamp: new Date(),
    });
  }
};

Gunakan middleware ini di route:
router.put('/:id', authenticate, authorize('employees', 'update'),
  auditLog('employees', 'UPDATE'), employeeController.update);

=== AUDIT LOG VIEWER ===

Buat views/settings/audit-logs.ejs:
- Filter: user, module, action, date_range, IP
- Tabel: Timestamp | User | Action (badge warna) | Module | Record ID | IP | Deskripsi
- Klik baris → modal detail: tampilkan old_value vs new_value sebagai JSON diff
- Export ke CSV

Buat GET /api/v1/audit-logs dengan pagination dan filter.

=== SECURITY HARDENING ===

Update app.js dengan:

1. Helmet.js konfigurasi lengkap:
   app.use(helmet({
     contentSecurityPolicy: {
       directives: {
         defaultSrc: ["'self'"],
         scriptSrc: ["'self'", "cdn.jsdelivr.net", "cdnjs.cloudflare.com"],
         styleSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
         imgSrc: ["'self'", "data:", "*.amazonaws.com", "*.minio.local"],
       }
     },
     hsts: { maxAge: 31536000, includeSubDomains: true }
   }));

2. Rate limiting per endpoint:
   - Auth endpoints: 10 req/15 menit per IP
   - API endpoints: 100 req/menit per user
   - Export endpoints: 10 req/jam per user (PDF/Excel berat)
   - Face checkin: 20 req/menit per employee_id

3. Input sanitization:
   const mongoSanitize = require('express-mongo-sanitize');
   app.use(mongoSanitize());  // Prevent NoSQL injection ($where, dll.)

4. Tambahkan field ke semua responses:
   X-Request-ID header (uuid per request untuk tracing)
   X-Response-Time header

5. Buat middlewares/requestId.js:
   Tambahkan request ID ke setiap request untuk correlation logging
```

### 💬 Prompt S-12-C: Performance & Final Polish

```
Buatkan optimasi performa dan finalisasi untuk samudraHRD.

=== REDIS CACHING ===

Buat utils/cache.js dengan ioredis:

const cache = {
  async get(key) { ... },
  async set(key, value, ttlSeconds) { ... },
  async del(key) { ... },
  async invalidatePattern(pattern) { ... }  // Hapus semua key yang match pattern
};

Implementasikan caching di:
1. Dashboard data → TTL 5 menit, invalidate saat ada event
2. Branch list → TTL 1 jam, invalidate saat ada update branch
3. Holiday list → TTL 24 jam, invalidate saat ada update holidays
4. Salary levels → TTL 1 jam

=== SOCKET.IO SETUP ===

Buat config/socket.js:

io.on('connection', (socket) => {
  // Join room berdasarkan role dan branch
  socket.on('join', ({ token }) => {
    const user = verifyToken(token);
    socket.join(`user_${user.id}`);
    socket.join(`branch_${user.branch_id}`);
    socket.join(`company_${user.company_id}`);
    if (user.role === 'admin' || user.role === 'manager_hrd') {
      socket.join('all_managers');
    }
  });
});

// Fungsi untuk emit dari server:
const emitToUser = (userId, event, data) => io.to(`user_${userId}`).emit(event, data);
const emitToBranch = (branchId, event, data) => io.to(`branch_${branchId}`).emit(event, data);
const emitToManagers = (event, data) => io.to('all_managers').emit(event, data);

Events yang perlu di-emit:
- 'attendance:checkin'  → room branch → update monitoring dashboard
- 'notification:new'   → room user   → update bell badge
- 'payroll:status'      → room branch → update payroll status
- 'receivable:new'      → room managers → notif pengajuan baru

=== PAGINATION HELPER ===

Buat utils/pagination.js:

const paginate = async (Model, query, options) => {
  const { page = 1, limit = 10, sort = '-created_at', populate = [] } = options;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Model.find(query).sort(sort).skip(skip).limit(limit).populate(populate),
    Model.countDocuments(query)
  ]);

  return {
    data,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(total / limit),
      has_next: page < Math.ceil(total / limit),
      has_prev: page > 1
    }
  };
};

=== FINAL CHECKLIST ===

Buat file DEPLOYMENT.md dengan checklist:

PRE-DEPLOYMENT:
- [ ] Semua .env.example terdokumentasi
- [ ] npm audit tidak ada critical vulnerability
- [ ] Jest coverage >= 70%
- [ ] Semua Postman tests pass di staging
- [ ] MongoDB indexes verified (db.collection.getIndexes())
- [ ] Redis connection test
- [ ] MinIO bucket policies set (private)
- [ ] Telegram bot token ditest di staging
- [ ] Rate limiting dikonfigurasi sesuai load

POST-DEPLOYMENT:
- [ ] Health check endpoint responds OK
- [ ] Seed data: 5 roles default ter-insert
- [ ] Admin user pertama dapat login
- [ ] Cron jobs terdaftar di Agenda
- [ ] Socket.IO connection test dari browser
- [ ] File upload test ke MinIO
- [ ] Send test email
- [ ] Send test Telegram message

Buat file README.md yang komprehensif dengan:
- Deskripsi project
- Tech stack
- Cara install dan setup lokal (langkah-langkah detail)
- Cara menjalankan tests
- Environment variables guide
- API documentation link (Postman)
- Known limitations (v1.0)
- Roadmap Phase 2
```

### ✅ Acceptance Criteria S-12
- [ ] Jest coverage >= 70% di semua service kritis
- [ ] TC-001 s/d TC-012 semua pass
- [ ] Semua Postman tests pass di environment staging
- [ ] Audit log mencatat perubahan payroll dengan old_value dan new_value
- [ ] Dashboard load < 1 detik (data dari Redis cache)
- [ ] Rate limiting bekerja: 11 request login dalam 15 menit → 429

---

## 📖 Panduan Penggunaan Prompt Vibe Coding

### Tips Terbaik untuk Antigravity AI

**1. Berikan Konteks Sebelum Prompt:**
```
Kita sedang mengerjakan Sprint [X] dari project samudraHRD.
File yang sudah ada: [sebutkan file relevan]
Berikut promptnya:
[isi prompt]
```

**2. Jika Hasil Tidak Sesuai, Gunakan Follow-up Prompt:**
```
Revisi fungsi [nama_fungsi] agar:
- [perbaikan 1]
- [perbaikan 2]
Tetap pertahankan [bagian yang sudah benar].
```

**3. Untuk Bug Fixing:**
```
Ada error di [file/fungsi]:
Error: [pesan error lengkap]
Stack trace: [stack trace]
File yang terlibat: [file list]
Tolong perbaiki dengan penjelasan penyebabnya.
```

**4. Untuk Code Review:**
```
Review kode berikut dan berikan saran perbaikan untuk:
- Performance
- Security vulnerability
- Edge cases yang belum ditangani
- Konsistensi dengan pattern yang ada
[paste kode]
```

**5. Untuk Generate Test:**
```
Berdasarkan fungsi [nama_fungsi] berikut, buatkan Jest unit test
yang mencakup: happy path, edge cases, dan error cases.
[paste fungsi]
```

---

## 🔗 Referensi Cepat

| Kebutuhan | Sprint |
|-----------|--------|
| Setup project dari nol | S-00 |
| Sistem login + JWT Auth | S-01-A |
| User management | S-01-B |
| CRUD cabang + geo-fencing | S-02-A |
| Struktur org + grade gaji | S-02-B |
| Tambah karyawan baru | S-03-A |
| Upload dokumen karyawan | S-03-B |
| Mutasi karyawan | S-03-C |
| Absensi QR + Button + Manual | S-04-A |
| Rekap absensi + Cron Job | S-04-B |
| Sistem cuti | S-05 |
| Sistem lembur | S-05 |
| Engine kalkulasi gaji (CORE) | S-06-A |
| UI payroll + approval | S-06-B |
| Generate slip PDF | S-06-C |
| Engine piutang + validasi | S-07-A |
| Cron job piutang jatuh tempo | S-07-B |
| Dashboard multi-role | S-08 |
| Notifikasi in-app + email | S-09-A |
| Telegram Bot | S-09-B |
| Template surat + generate | S-10 |
| ID Card generator | S-10 |
| Setup mobile React Native | S-11-A |
| Face recognition attendance | S-11-B |
| Backend API face recognition | S-11-C |
| Jest unit + integration test | S-12-A |
| Audit trail middleware | S-12-B |
| Redis caching + Socket.IO | S-12-C |

---

*Dokumen ini dibuat untuk project samudraHRD v1.0 MVP*
*Stack: Node.js · Express.js · MongoDB · Bootstrap 5 · EJS · React Native Expo*
*Pendekatan: Agile / Iterative — Sprint 2 minggu*