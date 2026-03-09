**SOFTWARE REQUIREMENTS SPECIFICATION**

**SISTEM APLIKASI HRD, PRESENSI & PAYROLL**

_IEEE Std 830-1998 Compliant Format_

| Dokumen | SRS - Software Requirements Specification |
| --- | --- |
| Standar | IEEE 830-1998 (adaptasi) |
| Versi | 1.0 |
| Backend | Node.js v20 LTS + Express.js v4 |
| Frontend | Bootstrap 5.3 + EJS v3 |
| Admin Template | UBold Admin Dashboard (Express+EJS) |
| Build Tool | Gulp (SCSS→CSS + Plugin copy) |
| Database | MongoDB 7.x + Mongoose 8.x |
| Mobile | React Native Expo SDK 51 (Android) |
| Testing | TestSprite AI + Postman |

# **1\. PENDAHULUAN**

## **1.1 Tujuan Dokumen**

Dokumen SRS ini mendeskripsikan secara lengkap seluruh kebutuhan fungsional dan non-fungsional Sistem Aplikasi HRD, Presensi, dan Payroll. Dokumen ini menjadi acuan utama bagi tim pengembang, QA engineer, dan stakeholder dalam proses desain, implementasi, dan pengujian sistem.

## **1.2 Lingkup Sistem**

Sistem diberi nama: SIHAPAY (Sistem Informasi HRD, Absensi, dan Payroll).

- Platform Web: Diakses via browser modern oleh 5 peran pengguna. Dibangun di atas template admin UBold (Express+EJS) dengan Gulp build pipeline.
- Platform Mobile (Android): Aplikasi React Native Expo khusus untuk metode absensi face recognition.
- Backend API: RESTful API Node.js + Express.js yang melayani kedua platform. Backend logic di root-level folder (config/, controllers/, middlewares/, services/).
- Database: MongoDB dengan 33 collections yang saling terhubung via referensi ObjectId.

## **1.3 Definisi, Akronim, dan Singkatan**

| **Singkatan** | **Kepanjangan / Definisi** |
| --- | --- |
| SRS | Software Requirements Specification |
| PRD | Product Requirements Document |
| ERD | Entity Relationship Diagram (MongoDB Schema Diagram) |
| RBAC | Role-Based Access Control |
| JWT | JSON Web Token |

| API | Application Programming Interface |
| ODM | Object Document Mapper (Mongoose) |
| CRUD | Create, Read, Update, Delete |
| KT  | Karyawan Tetap |
| KL  | Karyawan Luar / Karyawan Lepas |
| FCM | Firebase Cloud Messaging (Push Notification) |
| TTL | Time-To-Live (MongoDB index untuk auto-expire documents) |
| UAT | User Acceptance Testing |

# **2\. DESKRIPSI UMUM SISTEM**

## **2.1 Perspektif Produk**

SIHAPAY adalah sistem informasi mandiri (standalone) yang dapat diintegrasikan dengan layanan eksternal seperti Telegram Bot API, layanan email SMTP, dan storage cloud (MinIO/S3). Sistem ini dirancang untuk mendukung perusahaan dengan struktur multi-cabang.

## **2.2 Fungsi Utama Sistem**

| **No** | **Fungsi** | **Deskripsi** |
| --- | --- | --- |
| F-01 | Manajemen Karyawan | CRUD data karyawan, generate ID+QR, konfigurasi gaji, dokumen |
| F-02 | Manajemen Cabang | CRUD cabang, geo-fencing, aturan uang makan, lembur per cabang |
| F-03 | Presensi Multi-Metode | 4 metode: QR Code, Button, Manual+Foto, Face Recognition (Android) |
| F-04 | Manajemen Cuti | Pengajuan cuti, approval bertingkat, saldo cuti per karyawan |
| F-05 | Manajemen Lembur | Setting lembur per cabang, pengajuan, approval, kalkulasi ke payroll |
| F-06 | Rekap Presensi | Rekap bulanan otomatis via Cron Job, export PDF/Excel |
| F-07 | Payroll Batch | Kalkulasi gaji otomatis (termasuk prorata & mutasi), preview, approve, lock |
| F-08 | Slip Gaji | Generate PDF slip gaji, kirim via Telegram Bot |
| F-09 | Manajemen Piutang | Pengajuan, approval bertingkat, cicilan, pembayaran multi-metode |
| F-10 | Jurnal Keuangan | Auto-generate jurnal debit/kredit untuk payroll dan piutang |
| F-11 | Laporan & Dashboard | Dashboard per role, laporan Excel/PDF, monitoring real-time (Socket.IO) |
| F-12 | Persuratan & Dokumen | Template surat HR, generate surat mutasi/peringatan/pengangkatan, ID Card+QR |
| F-13 | Notifikasi Telegram | Slip gaji, approval, cicilan jatuh tempo, alert kontrak habis |
| F-14 | Audit Trail | Log semua aktivitas CRUD+approval dengan TTL 2 tahun |
| F-15 | Manajemen Pengguna | CRUD users, assign role, session management |

## **2.3 Karakteristik Pengguna**

| **Peran** | **Kompetensi Teknis** | **Tanggung Jawab Utama** |
| --- | --- | --- |
| Administrator | Tinggi - IT/Developer | Konfigurasi sistem, manajemen pengguna, pemeliharaan data master |
| Manager HRD | Menengah - HRD profesional | Approval piutang besar, payroll bulanan, laporan SDM komprehensif |
| Kepala Cabang | Menengah - Manajer lapangan | Approval cuti/lembur/piutang cabang, monitoring kehadiran harian |
| Staff Admin Cabang | Rendah-Menengah - Admin | Input absensi manual, generate dokumen, pengajuan piutang |
| Kasir Cabang | Rendah - Operasional | Proses pembayaran gaji harian, catat cicilan piutang tunai |

# **3\. SPESIFIKASI KEBUTUHAN FUNGSIONAL**

## **3.1 Modul Autentikasi & Keamanan**

**REQ-AUTH-001: Login dengan JWT**

Deskripsi: Sistem harus mengautentikasi pengguna menggunakan kombinasi username/email dan password.

- Input: username/email (String), password (String).
- Output: access_token (JWT, exp 1 jam), refresh_token (JWT, exp 7 hari).
- Sistem hash password menggunakan bcrypt (salt rounds = 12).
- Maksimum 5 kali percobaan login gagal → akun terkunci 30 menit, notifikasi email terkirim.
- JWT payload berisi: user_id, role, company_id, branch_id.



**REQ-AUTH-003: RBAC Middleware**

- Setiap endpoint API dilindungi middleware verifyToken dan checkPermission(module, action).
- Permissions tersimpan di collection roles sebagai array string, contoh: \['employees:read', 'employees:create'\].
- Data yang dikembalikan otomatis difilter berdasarkan branch_id user (kecuali admin & manager_hrd).

## **3.2 Modul Karyawan**

**REQ-EMP-001: Pendaftaran Karyawan**

Endpoint: POST /api/employees

- Field wajib: full_name, nik, branch_id, department_id, position_id, status, join_date, payment_cycle.
- Employee Code di-generate otomatis: format \[KODE_CABANG\]-\[STATUS_2CHAR\]-\[URUT_4DIGIT\]. Contoh: JKT-KT-0001.
- QR Code di-generate dari Employee Code menggunakan library qrcode, disimpan sebagai base64 PNG.
- Konfigurasi gaji awal wajib diisi saat pendaftaran (salary_configs collection).
- Validasi: NIK unik dalam company, kontrak karyawan tidak boleh tumpang tindih.

**REQ-EMP-002: Mutasi Karyawan**

Endpoint: POST /api/employees/:id/mutate

- Buat record di mutation_histories dengan: from_branch_id, to_branch_id, effective_date, reason.
- Update employees: branch_id, department_id, position_id berdasarkan mutasi terbaru.
- Cron Job akhir bulan membaca mutation_histories untuk kalkulasi prorata payroll.
- Generate surat mutasi otomatis dari template jika tersedia.

**REQ-EMP-003: Profil Karyawan Lengkap**

Endpoint: GET /api/employees/:id (dengan query expand=documents,salary_config,history)

- Response mencakup: data pribadi, daftar dokumen (employee_documents), konfigurasi gaji aktif (salary_configs), riwayat kenaikan gaji, foto dokumen.

## **3.3 Modul Presensi**

**REQ-ATT-001: Absensi QR Code**

Endpoint: POST /api/attendances/qr-checkin

- Payload: qr_token (encrypted employee_code + timestamp), latitude, longitude, branch_id.
- Verifikasi: decrypt token → validasi employee_code → cek geo-fencing (jarak ke koordinat cabang ≤ geofence_radius).
- Jika geo-fencing aktif dan karyawan di luar radius → 403 Forbidden dengan pesan 'Di luar area absensi'.
- Cek duplikasi: satu karyawan hanya boleh check-in sekali per hari (kecuali check-out).

**REQ-ATT-002: Absensi Manual dengan Foto**

Endpoint: POST /api/attendances/manual

- Payload: employee_id, date, check_in_time, check_out_time (opsional), photo (multipart file), notes (wajib).
- Foto disimpan ke MinIO/S3 dengan nama: attendance/\[employee_id\]/\[date\]\_\[timestamp\].jpg.
- Foto harus menyertakan timestamp watermark (diproses di client sebelum upload).
- Status otomatis 'pending_verification' → masuk ke antrian persetujuan Kepala Cabang.

**REQ-ATT-003: Absensi Face Recognition (Mobile API)**

Endpoint: POST /api/attendances/face-checkin

- Payload: employee_id, face_image (base64 JPEG), latitude, longitude.
- Server proses liveness detection → face comparison dengan face_encoding di employees collection.
- Confidence threshold: ≥ 0.80 untuk dianggap match. Jika < 0.80 → 401 dengan pesan 'Wajah tidak dikenali'.
- Jika liveness check gagal → 403 dengan pesan 'Deteksi foto/video palsu'.
- Foto absensi tetap disimpan untuk audit log.

**REQ-ATT-004: Rekap Periode Otomatis (Cron Job)**

Cron Schedule: 0 1 1 \* \* (jam 01:00 tanggal 1 setiap bulan)

- Query attendances per karyawan untuk bulan sebelumnya.
- Hitung: present_days, absent_days, sick_days, permit_days, alpha_days, late_count, total_late_minutes, total_overtime_hours, attendance_percentage.
- Upsert ke attendance_recaps (update jika sudah ada, insert jika belum).
- Notifikasi ke Manager HRD jika rekap selesai di-generate.

## **3.4 Modul Payroll**

**REQ-PAY-001: Inisiasi Batch Payroll**

Endpoint: POST /api/payrolls

- Payload: branch_id, period_start, period_end, cycle_type.
- Sistem buat payroll header (status = draft) dan trigger background job kalkulasi.
- Background job (Agenda.js) proses setiap karyawan di cabang tersebut secara async.

**REQ-PAY-002: Kalkulasi Komponen Gaji**

Logika kalkulasi per karyawan (dalam PayrollService.calculate):

base = salary_config.base_salary tenure = salary_config.tenure_allowance position = salary_config.position_allowance performance = salary_config.performance_allowance fuel = salary_config.fuel_allowance // Uang makan: hanya jika memenuhi syarat cabang meal = attendance.is_meal_allowance_eligible ? salary_config.meal_allowance \* present_days : 0 // Harian: untuk KL/Magang dengan siklus harian daily = (cycle_type === 'daily') ? salary_config.daily_rate \* present_days : 0 // Lembur overtime = total_overtime_hours \* overtime_settings.rate_per_hour // Prorata (jika ada mutasi di periode ini) if (is_prorata) → split kalkulasi per periode mutasi gross = base + tenure + position + performance + meal + fuel + daily + overtime + bonus // Potongan HANYA piutang deduction = receivable_installment.amount (jika jatuh tempo di periode ini) net = gross - deduction

**REQ-PAY-003: Lock & Approval Payroll**

- Endpoint PATCH /api/payrolls/:id/approve → status = approved.
- Endpoint PATCH /api/payrolls/:id/lock → status = locked, is_locked = true.
- Setelah locked: semua field payroll_details menjadi read-only.
- Jika ada koreksi setelah locked: hanya Admin yang dapat unlock, dengan alasan yang tercatat di activity_logs.

**REQ-PAY-004: Generate dan Kirim Slip Gaji**

- Endpoint POST /api/payrolls/:id/generate-slips → background job generate semua slip.
- PDF slip gaji dibuat menggunakan Puppeteer (render HTML template ke PDF).
- File tersimpan di MinIO: payslips/\[year\]/\[month\]/\[employee_id\]\_\[period\].pdf.
- Setelah generate, sistem kirim PDF ke Telegram DM karyawan (jika telegram_chat_id ada).
- Email dikirim ke email karyawan sebagai backup.

## **3.5 Modul Piutang**

**REQ-REC-001: Validasi Pengajuan Piutang**

Endpoint: POST /api/receivables

- Validasi 1: Karyawan tidak boleh mengajukan jika ada receivables dengan status = 'active'.
- Validasi 2: Nominal tidak boleh melebihi limit berdasarkan status karyawan (dari receivable_settings).
- Validasi 3: installment_count harus antara 1-24 cicilan.
- Routing approval otomatis: amount &lt; max_amount_branch_approval → approval_level = 'branch'; amount &gt;= → approval_level = 'hrd'.
- Notifikasi Telegram + email terkirim ke approver yang sesuai.

**REQ-REC-002: Penjadwalan Cicilan Otomatis**

Trigger: Setelah piutang berstatus approved.

- Generate N records di receivable_installments (N = installment_count).
- due_date dihitung berdasarkan: tanggal_approve + (installment_number × 30 hari) untuk cicilan bulanan.
- Cron Job harian: scan due_date yang H-3 → kirim notifikasi Telegram ke karyawan dan Kasir.
- Cron Job harian: scan due_date yang lewat dan status masih pending → update status = 'overdue'.

**REQ-REC-003: Pemotongan Cicilan via Payroll**

- Saat proses payroll, PayrollService query receivable_installments dimana: employee_id match, due_date dalam periode payroll, status = 'pending'/'overdue'.
- Jumlah cicilan dimasukkan ke receivable_deduction di payroll_details.
- Setelah payroll paid, update receivable_installments status = 'paid' dan kurangi remaining_balance di receivables.

## **3.6 Modul Notifikasi Telegram**

**REQ-NOTIF-001: Registrasi Telegram**

- Karyawan kirim /start ke bot → bot reply dengan instruksi /register \[employee_code\].
- Sistem verifikasi employee_code → kirim OTP 6 digit via sistem.
- Karyawan kirim /verify \[otp\] → simpan telegram_chat_id ke users collection.

**REQ-NOTIF-002: Notifikasi Terjadwal**

| **Event** | **Trigger** | **Penerima & Format** |
| --- | --- | --- |
| Slip Gaji Terbit | Payroll di-generate | Karyawan - PDF attachment |
| Pengajuan Cuti | Submit cuti | Kepala Cabang - text + link approve |
| Cuti Disetujui/Ditolak | Approval cuti | Karyawan - text notifikasi |
| Cicilan Jatuh Tempo | H-3 cron job | Karyawan + Kasir - text dengan nominal |
| Piutang Baru (info) | Submit piutang < 1jt | Manager HRD - text informasi |
| Piutang Butuh Approval | Submit piutang ≥ 1jt | Manager HRD - text + link approve |
| Kontrak Hampir Habis | Cron H-30 | Manager HRD + Admin - text list karyawan |
| Karyawan Belum Absen | Cron jam 10:00 | Kepala Cabang - list nama karyawan |

# **4\. SPESIFIKASI NON-FUNGSIONAL**

## **4.1 Performa**

- API response time: p95 < 300ms, p99 < 1000ms (diukur dengan Postman monitor).
- Endpoint laporan/export: maksimum 10 detik untuk dataset hingga 10.000 records.
- Batch payroll 500 karyawan: selesai < 2 menit via background job (tidak memblokir UI).
- Socket.IO dashboard update: delay maksimum 2 detik dari event ke tampilan.
- MongoDB query: index wajib pada field: employee_id, branch_id, date, company_id, status di semua collection.

## **4.2 Keamanan**

| **Aspek Keamanan** | **Implementasi & Spesifikasi** |
| --- | --- |
| Password | Bcrypt hash, min 8 karakter (huruf besar+kecil+angka+simbol), rotasi 90 hari |
| Transmisi Data | HTTPS TLS 1.3 wajib di production, HSTS header aktif |
| Enkripsi Field Sensitif | bank_account, nik, face_encoding di-encrypt menggunakan AES-256-GCM |
| Rate Limiting | Auth endpoint: 10 req/menit/IP. API endpoint: 100 req/menit/user |
| CORS | Whitelist domain yang diizinkan, credentials: true hanya untuk domain trusted |
| Input Validation | Semua input divalidasi di server dengan Joi (tidak hanya client-side) |
| File Upload | Validasi MIME type, ukuran maksimum 5MB per file, scan malware (opsional) |
| Audit Trail | TTL index 2 tahun, index pada: user_id, timestamp, action, module |
| Session | JWT blacklist via Redis untuk logout, refresh token rotation |
| XSS Prevention | Helmet.js, Content Security Policy header, sanitize semua output EJS |
| SQL/NoSQL Injection | Mongoose query sanitization, tidak menerima \$where operator dari client |

## **4.3 Keandalan & Ketersediaan**

- Target uptime: 99.5% per bulan (maksimum downtime 3.65 jam/bulan).
- Graceful shutdown: server menyelesaikan request aktif sebelum shutdown.
- Health check endpoint: GET /health → JSON status semua service (DB, Redis, Storage).
- MongoDB replica set (minimal 1 primary + 1 secondary) di production.
- Redis sentinel untuk high availability cache/session.
- Backup MongoDB: daily dump ke S3/MinIO, retensi 90 hari, uji restore bulanan.

## **4.4 Pemeliharaan & Kode**

- Kode mengikuti ESLint (Airbnb style guide) + Prettier formatting.
- Setiap modul memiliki unit test minimal coverage 70% (dijalankan via TestSprite AI).
- Dokumentasi API: Postman Collection dengan contoh request/response untuk setiap endpoint.
- Environment configuration via .env (tidak ada hardcoded credential).
- Semantic versioning: MAJOR.MINOR.PATCH (dimulai dari 1.0.0).
- Git branching strategy: main (production) → develop → feature/\[nama-fitur\].

# **5\. DESAIN DATABASE (MONGODB)**

## **5.1 Ringkasan Collections**

| **No** | **Collection** | **Group** | **Keterangan** |
| --- | --- | --- | --- |
| 1   | companies | Core | Data perusahaan (single tenant: 1 dokumen) |
| 2   | branches | Core | Data cabang dengan geo-fencing dan aturan uang makan/lembur |
| 3   | departments | Core | Departemen per perusahaan |
| 4   | positions | Core | Jabatan per departemen, terhubung ke salary_levels |
| 5   | users | Core | Akun pengguna dengan role dan Telegram chat ID |
| 6   | roles | Core | Role dan array permissions (RBAC) |
| 7   | approval_flows | Core | Konfigurasi alur persetujuan berbasis kondisi |
| 8   | employees | HR  | Data karyawan lengkap (ENTITAS PUSAT) |
| 9   | employee_documents | HR  | File dokumen karyawan (KTP, NPWP, ijazah, dll.) |
| 10  | salary_configs | HR  | Konfigurasi komponen gaji per karyawan (historical) |
| 11  | salary_levels | HR  | Tingkatan/grade gaji per jabatan |
| 12  | salary_histories | HR  | Riwayat kenaikan/perubahan gaji |
| 13  | mutation_histories | HR  | Riwayat mutasi karyawan antar cabang/jabatan |
| 14  | work_schedules | Presensi | Jadwal kerja/shift per cabang |
| 15  | holidays | Presensi | Hari libur nasional & cabang |
| 16  | attendances | Presensi | Data absensi harian per karyawan (4 metode) |
| 17  | attendance_recaps | Presensi | Rekap kehadiran bulanan per karyawan (Cron Job) |
| 18  | leave_types | Presensi | Jenis cuti (tahunan, sakit, izin, dll.) |
| 19  | leave_requests | Presensi | Pengajuan cuti dengan approval workflow |
| 20  | overtime_settings | Presensi | Konfigurasi lembur per cabang (tarif, batas) |
| 21  | overtime_requests | Presensi | Pengajuan lembur dengan approval |
| 22  | payrolls | Payroll | Header payroll per periode per cabang |
| 23  | payroll_details | Payroll | Rincian gaji per karyawan per payroll |
| 24  | salary_slips | Payroll | Slip gaji PDF per karyawan |
| 25  | salary_components | Payroll | Master komponen gaji perusahaan |
| 26  | financial_journals | Payroll | Jurnal akuntansi debit/kredit otomatis |
| 27  | receivables | Piutang | Data piutang per karyawan dengan status tracking |
| 28  | receivable_installments | Piutang | Jadwal cicilan per piutang |
| 29  | receivable_payments | Piutang | Rekaman setiap pembayaran cicilan |
| 30  | receivable_settings | Piutang | Konfigurasi limit piutang per status karyawan |
| 31  | document_templates | Sistem | Template HTML surat/dokumen HR |
| 32  | hr_documents | Sistem | Dokumen HR yang sudah di-generate per karyawan |
| 33  | announcements | Sistem | Pengumuman dari Manager HRD per role/cabang |
| 34  | notifications | Sistem | Log notifikasi (in-app, email, Telegram) |
| 35  | activity_logs | Sistem | Audit trail semua aktivitas (TTL index 2 tahun) |

## **5.2 Strategi Indexing MongoDB**

- employees: index({ company_id:1, branch_id:1, is_active:1 }), index({ employee_code:1 }, {unique:true})
- attendances: index({ employee_id:1, date:-1 }), index({ branch_id:1, date:-1 })
- payroll_details: index({ payroll_id:1, employee_id:1 }, {unique:true})
- receivables: index({ employee_id:1, status:1 })
- receivable_installments: index({ due_date:1, status:1 }) - untuk cron job scan jatuh tempo
- activity_logs: index({ timestamp:1 }, {expireAfterSeconds: 63072000}) - TTL 2 tahun
- notifications: index({ user_id:1, is_read:1, created_at:-1 })

# **6\. SPESIFIKASI API (REST)**

Semua endpoint menggunakan prefix /api/v1. Format response standar:

{ "success": true, "data": {...}, "message": "OK", "pagination": {...} }

Format response error:

{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": \[...\] } }

## **6.1 Auth Endpoints**

| **Method** | **Endpoint** | **Auth** | **Deskripsi** |
| --- | --- | --- | --- |
| POST | /auth/login | Public | Login, return JWT + refresh token |
| POST | /auth/refresh | Public | Refresh access token menggunakan refresh token |
| POST | /auth/logout | JWT | Invalidate token (blacklist di Redis) |
| POST | /auth/change-password | JWT | Ganti password dengan verifikasi password lama |

## **6.2 Employee Endpoints**

| **Method** | **Endpoint** | **Role** | **Deskripsi** |
| --- | --- | --- | --- |
| GET | /employees | admin, mgr_hrd, ka_cabang | List karyawan (filter, sort, pagination, search) |
| POST | /employees | admin, mgr_hrd | Buat karyawan baru + generate ID+QR |
| GET | /employees/:id | All roles | Detail karyawan + dokumen + salary config |
| PUT | /employees/:id | admin, mgr_hrd | Update data karyawan |
| POST | /employees/:id/mutate | admin, mgr_hrd | Proses mutasi karyawan |
| PATCH | /employees/:id/deactivate | admin, mgr_hrd | Nonaktifkan karyawan (dengan validasi piutang) |
| GET | /employees/export | admin, mgr_hrd | Export daftar karyawan ke PDF/Excel |
| POST | /employees/:id/salary-config | admin, mgr_hrd | Update konfigurasi gaji karyawan |

## **6.3 Attendance Endpoints**

| **Method** | **Endpoint** | **Role** | **Deskripsi** |
| --- | --- | --- | --- |
| POST | /attendances/qr-checkin | All (mobile/web) | Check-in via QR Code + geo-fencing |
| POST | /attendances/button-checkin | All | Check-in via tombol (web/mobile) |
| POST | /attendances/manual | staff_admin, ka_cabang | Input manual + upload foto selfie |
| POST | /attendances/face-checkin | Mobile app only | Check-in via face recognition |
| GET | /attendances | admin, mgr_hrd, ka_cabang | Daftar absensi (filter, pagination, export) |
| GET | /attendances/today | ka_cabang, mgr_hrd | Monitoring kehadiran real-time hari ini |
| GET | /attendances/recap | All authorized | Rekap periode dengan persentase kehadiran |
| PATCH | /attendances/:id/verify | ka_cabang | Verifikasi absensi manual (approve/reject) |

## **6.4 Payroll Endpoints**

| **Method** | **Endpoint** | **Role** | **Deskripsi** |
| --- | --- | --- | --- |
| POST | /payrolls | admin, mgr_hrd | Inisiasi batch payroll baru (trigger background job) |
| GET | /payrolls | admin, mgr_hrd, ka_cabang | List payroll dengan filter cabang, periode, status |
| GET | /payrolls/:id/preview | admin, mgr_hrd | Preview total payroll sebelum disetujui |
| PATCH | /payrolls/:id/approve | mgr_hrd | Setujui payroll → status = approved |
| PATCH | /payrolls/:id/lock | admin, mgr_hrd | Lock payroll → tidak bisa diubah |
| POST | /payrolls/:id/generate-slips | admin, mgr_hrd | Generate semua slip gaji + kirim Telegram |
| GET | /payrolls/salary-slips/:employee_id | All roles | Riwayat slip gaji karyawan |

## **6.5 Receivable Endpoints**

| **Method** | **Endpoint** | **Role** | **Deskripsi** |
| --- | --- | --- | --- |
| POST | /receivables | All roles (utk karyawannya) | Ajukan piutang baru (dengan validasi limit+aktif) |
| GET | /receivables | admin, mgr_hrd, ka_cabang | Daftar piutang aktif + filter + export |
| PATCH | /receivables/:id/approve | ka_cabang, mgr_hrd | Setujui piutang + generate jadwal cicilan |
| PATCH | /receivables/:id/reject | ka_cabang, mgr_hrd | Tolak pengajuan piutang |
| POST | /receivable-payments | kasir | Catat pembayaran cicilan tunai/transfer |
| GET | /receivables/aging-report | admin, mgr_hrd | Laporan aging piutang per periode |

# **7\. STRATEGI PENGUJIAN**

## **7.1 Level Pengujian**

| **Level** | **Tools** | **Cakupan** |
| --- | --- | --- |
| Unit Test | Jest + TestSprite AI | Services, utilities, kalkulasi payroll, validasi, model methods |
| Integration Test | Supertest + Jest | API endpoint testing dengan MongoDB in-memory (mongodb-memory-server) |
| API Test | Postman / Newman | Collection test semua endpoint dengan environment staging |
| E2E Test | TestSprite AI | Skenario alur bisnis kritis (payroll, piutang, mutasi) |
| Performance Test | Artillery.io | Load test: 500 concurrent users, stress test endpoint payroll |
| UAT | Manual - Stakeholder | Pengujian penerimaan oleh Manager HRD dan Admin |

## **7.2 Test Cases Kritis**

**TC-001: Kalkulasi Payroll Prorata Mutasi**

Skenario: Karyawan mutasi tanggal 15 dari Cabang A (uang makan Rp 20.000/hari) ke Cabang B (Rp 30.000/hari).

- Expected: 14 hari × Rp 20.000 = Rp 280.000 (Cabang A) + 16 hari × Rp 30.000 = Rp 480.000 (Cabang B).
- Total uang makan = Rp 760.000 dengan flag is_prorata = true.

**TC-002: Validasi Piutang Aktif**

Skenario: Karyawan dengan piutang status = active mengajukan piutang baru.

- Expected: API return 400 Bad Request dengan error code 'ACTIVE_RECEIVABLE_EXISTS'.
- Piutang baru tidak tersimpan di database.

**TC-003: Offboarding dengan Sisa Piutang**

Skenario: Admin mengubah status karyawan ke Non-Aktif saat remaining_balance > 0.

- Expected: API return 409 Conflict, tampilkan sisa piutang = Rp X.
- Status karyawan tetap aktif sampai piutang diselesaikan.

**TC-004: Face Recognition Anti-Spoofing**

Skenario: Upload foto dari layar monitor (bukan wajah langsung) untuk absensi.

- Expected: API return 403 dengan pesan 'Deteksi foto/video palsu'.
- Absensi tidak tersimpan, event dicatat di activity_logs.

**TC-005: Lock Payroll**

Skenario: Coba update payroll_details setelah payroll berstatus locked.

- Expected: API return 403 Forbidden dengan pesan 'Payroll sudah dikunci'.
- Data tidak berubah, percobaan tercatat di activity_logs.

# **8\. DEPLOYMENT & INFRASTRUKTUR**

## **8.1 Environment**

| **Environment** | **Tujuan** | **Konfigurasi** |
| --- | --- | --- |
| Development | Local development | MongoDB local/docker, .env.development, log verbose, Gulp watch SCSS |
| Staging | UAT & integration test | MongoDB Atlas free tier, .env.staging, Telegram bot test |
| Production | Live deployment | MongoDB Atlas M10+, .env.production, SSL, monitoring, `gulp build` |

## **8.2 Environment Variables Kritis**

NODE_ENV=production PORT=3000 MONGODB_URI=mongodb+srv://... JWT_SECRET=&lt;256-bit random string&gt; JWT_REFRESH_SECRET=&lt;256-bit random string&gt; REDIS_URL=redis://... MINIO_ENDPOINT=... MINIO_ACCESS_KEY=... MINIO_SECRET_KEY=... TELEGRAM_BOT_TOKEN=&lt;dari BotFather&gt; SMTP_HOST=... SMTP_PORT=587 SMTP_USER=... SMTP_PASS=... ENCRYPTION_KEY=&lt;32-byte hex untuk AES-256&gt;

## **8.3 Docker Compose (Development)**

services: mongodb: image: mongo:7 ports: \["27017:27017"\] volumes: \["mongo_data:/data/db"\] redis: image: redis:7-alpine ports: \["6379:6379"\] minio: image: minio/minio ports: \["9000:9000", "9001:9001"\] command: server /data --console-address ':9001' app: build: . ports: \["3000:3000"\] depends_on: \[mongodb, redis, minio\] env_file: .env.development

**END OF DOCUMENT - SRS v1.0**

_SIHAPAY - Sistem Informasi HRD, Absensi, dan Payroll_