**PRODUCT REQUIREMENTS DOCUMENT**

**SISTEM APLIKASI HRD, PRESENSI & PAYROLL**

_Multi-Role Enterprise Human Resource Management System_

| Dokumen | Product Requirements Document (PRD) |
| --- | --- |
| Versi | 1.0 - MVP Release |
| Status | DRAFT - Menunggu Review |
| Tech Stack | Node.js · Express.js · MongoDB · Bootstrap · EJS |
| Admin Template | UBold Admin Dashboard (Express+EJS) |
| Build Tool | Gulp (SCSS→CSS + Plugin copy) |
| Mobile | React Native Expo (Android) |
| Pendekatan | Agile / MVP - Iterative Development |
| Tahun | 2025 |

# **1\. PENDAHULUAN**

## **1.1 Latar Belakang**

Perusahaan saat ini membutuhkan sistem terintegrasi untuk mengelola data Sumber Daya Manusia (SDM) yang mencakup pengelolaan karyawan, pencatatan kehadiran (presensi), dan penghitungan penggajian (payroll). Pengelolaan yang masih bersifat manual atau menggunakan sistem terpisah menyebabkan inefisiensi, potensi kesalahan data, dan kesulitan dalam pelaporan.

Sistem yang akan dibangun merupakan aplikasi berbasis web (dengan tambahan aplikasi mobile Android) yang menghubungkan data karyawan, data presensi, dan penggajian dalam satu platform terintegrasi dengan kontrol akses berdasarkan peran (role-based access control).

## **1.2 Tujuan Produk**

- Menyediakan sistem terpusat untuk manajemen data karyawan lintas cabang.
- Mengotomatisasi proses pencatatan kehadiran dengan 4 metode yang fleksibel.
- Mengotomatisasi perhitungan dan pemrosesan penggajian berdasarkan konfigurasi per karyawan.
- Mengelola piutang karyawan dengan alur persetujuan bertingkat yang terstruktur.
- Menyediakan laporan dan analitik SDM yang akurat dan real-time.
- Memastikan keamanan data, audit trail, dan transparansi setiap transaksi.

## **1.3 Scope (Ruang Lingkup)**

Produk ini mencakup 10 modul utama yang akan dibangun secara bertahap dengan pendekatan MVP:

- Modul Core System: Manajemen perusahaan, cabang, dan konfigurasi sistem.
- Modul Karyawan: Data karyawan, departemen, jabatan, struktur organisasi, mutasi.
- Modul Presensi: Absensi (4 metode), jadwal kerja, cuti, lembur, rekap periode.
- Modul Payroll: Penggajian, komponen gaji, slip gaji, tingkatan gaji.
- Modul Piutang: Pengajuan, persetujuan, cicilan, pembayaran piutang karyawan.
- Modul Laporan: Dashboard, laporan karyawan, kehadiran, gaji, piutang.
- Modul Dokumen: Persuratan, template dokumen, ID Card dengan QR Code.
- Modul Pengumuman: Informasi dan pengumuman berdasarkan peran.
- Modul Keuangan: Jurnal keuangan untuk payroll dan piutang.
- Modul System: Pengguna, role, pengaturan, audit trail, notifikasi (Telegram Bot).

## **1.4 Out of Scope**

- Perhitungan BPJS, PPh 21, dan pajak penghasilan lainnya.
- Integrasi dengan software akuntansi pihak ketiga (ERP).
- Modul rekrutmen dan penilaian kinerja (dijadwalkan untuk Phase 2).
- Aplikasi mobile iOS (hanya Android via React Native Expo).

# **2\. STAKEHOLDERS & PENGGUNA**

## **2.1 Deskripsi Peran (Roles)**

| **Peran** | **Nama Role** | **Deskripsi & Akses** |
| --- | --- | --- |
| Administrator | admin | Akses penuh ke seluruh sistem. Mengelola konfigurasi, pengguna, dan data master. |
| Manager HRD | manager_hrd | Akses penuh ke data karyawan, laporan, persetujuan piutang ≥ Rp 1 juta, dan penggajian. |
| Kepala Cabang | kepala_cabang | Akses ke data karyawan cabangnya, persetujuan absensi, cuti, lembur, dan piutang < Rp 1 juta. |
| Staff Admin Cabang | staff_admin | Input data absensi, pengajuan piutang, generate dokumen untuk karyawan di cabangnya. |
| Kasir Cabang | kasir | Proses pembayaran gaji harian/mingguan, pencatatan pembayaran cicilan piutang tunai. |

## **2.2 Matriks Hak Akses Modul**

| **Modul** | **Admin** | **Mgr HRD** | **Ka. Cabang** | **Staff Admin** | **Kasir** |
| --- | --- | --- | --- | --- | --- |
| Pengaturan Sistem | Full | Read | -   | -   | -   |
| Data Karyawan | Full | Full | Cabang saja | Cabang saja | -   |
| Presensi | Full | Full | Cabang saja | Input + View | Read |
| Payroll | Full | Full | Cabang saja | View saja | Proses bayar |
| Piutang | Full | Full (≥1jt) | Full (< 1jt) | Buat + View | Catat bayar |
| Dashboard | Full | Full | Cabang saja | Cabang saja | Terbatas |
| Dokumen / Surat | Full | Full | View + Buat | Buat | -   |
| Laporan Keuangan | Full | Full | -   | -   | -   |
| Pengumuman | Full | Buat + Edit | View | View | View |

# **3\. USER STORIES & KEBUTUHAN FUNGSIONAL**

## **3.1 Modul Karyawan**

**US-EMP-01: Pendaftaran Karyawan Baru**

Sebagai Manager HRD, saya ingin mendaftarkan karyawan baru agar data mereka tersimpan di sistem dengan ID Karyawan dan QR Code yang ter-generate otomatis.

**Acceptance Criteria:**

- Sistem generate Employee Code (format: \[KODE_CABANG\]-\[STATUS\]-\[NOMOR_URUT\]).
- Sistem generate QR Code unik berbasis Employee Code yang dapat dicetak ke ID Card.
- Form pendaftaran mencakup data pribadi, dokumen, konfigurasi gaji, dan foto dokumen.
- Status karyawan dipilih: KT (Karyawan Tetap), KL (Karyawan Luar/Lepas), atau Magang.
- Siklus gaji dipilih: Harian, Mingguan, atau Bulanan.

**US-EMP-02: Mutasi Karyawan**

Sebagai Manager HRD, saya ingin memutasi karyawan ke cabang lain agar konfigurasi gaji dan aturan absensinya otomatis menyesuaikan aturan cabang tujuan.

- Sistem mencatat tanggal efektif mutasi di tabel Riwayat_Mutasi.
- Konfigurasi gaji (uang makan, lembur) otomatis merujuk ke cabang baru setelah tanggal efektif.
- Perhitungan prorata gaji bulan mutasi dilakukan otomatis oleh Cron Job.
- Dokumen surat mutasi di-generate otomatis dari template yang tersedia.

**US-EMP-03: Offboarding Karyawan**

Sebagai Manager HRD, saya ingin menonaktifkan karyawan yang resign dengan validasi berlapis agar tidak ada piutang yang tertinggal.

- Sistem menolak perubahan status ke Non-Aktif jika masih ada piutang dengan status AKTIF.
- Sistem menampilkan prompt: pilih potong sisa piutang dari gaji terakhir atau bayar langsung.
- Setelah piutang lunas, status karyawan berhasil diubah ke Non-Aktif.
- Sistem menampilkan checklist aset yang harus dikembalikan (Phase 2).

## **3.2 Modul Presensi**

**US-ATT-01: Absensi via QR Code**

- Karyawan menunjukkan QR Code (dari ID Card atau aplikasi mobile) ke scanner.
- Sistem mencatat waktu check-in/check-out, metode = 'QR', dan koordinat lokasi (jika mobile).
- Sistem otomatis menghitung status (Tepat Waktu / Terlambat) berdasarkan jadwal kerja.

**US-ATT-02: Absensi Manual dengan Foto**

- Karyawan atau Admin mengisi form absensi manual dengan: foto selfie (disertai timestamp watermark), alasan keterlambatan/kehadiran manual, dan waktu masuk/keluar.
- Absensi manual otomatis masuk ke antrian verifikasi Kepala Cabang.
- Foto selfie disimpan di cloud storage dan dapat diaudit oleh Admin.

**US-ATT-03: Absensi Face Recognition (Mobile)**

- Aplikasi Android mendeteksi wajah karyawan menggunakan kamera depan.
- Liveness detection aktif untuk mencegah foto/video palsu (anti-spoofing).
- Face encoding dibandingkan dengan data yang tersimpan di database.
- Jika wajah dikenali dan dalam radius geo-fencing, absensi berhasil dicatat.

**US-ATT-04: Rekap Periode Absensi**

- Sistem men-generate rekap per karyawan per periode (bulan) secara otomatis via Cron Job.
- Rekap mencantumkan: Hadir, Izin, Sakit, Alpa, Terlambat, total jam lembur, dan persentase kehadiran.
- Rekap dapat diekspor ke PDF dan Excel, dengan filter per cabang, departemen, dan rentang tanggal.

## **3.3 Modul Payroll**

**US-PAY-01: Pemrosesan Payroll Batch**

- Admin/Manager HRD memilih periode dan siklus pembayaran (harian/mingguan/bulanan).
- Sistem kalkulasi otomatis: gaji pokok, tunjangan, uang makan (berdasarkan aturan cabang), lembur, bonus, dan potongan piutang.
- Sistem tampilkan preview total sebelum difinalisasi untuk review.
- Setelah disetujui, payroll berstatus APPROVED dan ter-lock (tidak dapat diubah).
- Slip gaji ter-generate otomatis dalam format PDF dan dikirim via Telegram Bot ke karyawan.

**US-PAY-02: Perhitungan Prorata**

- Karyawan baru yang masuk tanggal 15 → gaji dihitung 50% dari gaji bulanan.
- Karyawan mutasi tanggal 15 → 15 hari dihitung berdasarkan konfigurasi cabang asal, sisanya cabang tujuan.
- Karyawan resign → gaji hari kerja terakhir dihitung secara prorata, dikurangi sisa piutang.

## **3.4 Modul Piutang**

**US-REC-01: Pengajuan Piutang**

- Karyawan mengajukan piutang dengan mengisi: nominal, tujuan, jumlah cicilan sanggup, dan metode pembayaran.
- Sistem otomatis menentukan jalur persetujuan: < Rp 1 juta → Kepala Cabang; ≥ Rp 1 juta → Manager HRD.
- Jika karyawan masih memiliki piutang AKTIF, sistem menolak pengajuan baru.
- Notifikasi Telegram/Email terkirim ke approver terkait.

**US-REC-02: Pembayaran Cicilan**

- Cicilan via potong gaji: otomatis masuk ke komponen potongan saat proses payroll.
- Cicilan via bayar langsung: Kasir mencatat pembayaran tunai/transfer dengan bukti.
- Notifikasi jatuh tempo dikirim H-3 ke karyawan dan Kasir.
- Saldo sisa piutang otomatis terupdate setiap kali ada pembayaran.

# **4\. KEBUTUHAN NON-FUNGSIONAL**

| **Kategori** | **Metrik** | **Target / Deskripsi** |
| --- | --- | --- |
| Performa | Response Time API | < 300ms untuk 95% request (non-report) |
| Performa | Batch Payroll | < 30 detik untuk 200 karyawan via background job |
| Skalabilitas | Concurrent Users | Mendukung 500 concurrent users tanpa degradasi |
| Ketersediaan | Uptime | 99.5% uptime per bulan (ekskl. scheduled maintenance) |
| Keamanan | Autentikasi | JWT + 2FA (TOTP) untuk Admin dan Manager HRD |
| Keamanan | Enkripsi | HTTPS TLS 1.3, enkripsi field sensitif di DB |
| Keamanan | Audit Trail | Semua operasi CRUD dicatat dengan TTL 2 tahun |
| Usabilitas | Browser Support | Chrome 90+, Firefox 88+, Edge 90+, Safari 14+ |
| Usabilitas | Responsif | UI responsif untuk layar 1024px - 2560px |
| Mobile | OS Android | Android 9.0 (API 28) ke atas |
| Backup | Frekuensi | Daily backup otomatis, retensi 90 hari |
| Lokalisasi | Bahasa | Bahasa Indonesia (antarmuka utama) |
| Lokalisasi | Timezone | WIB (UTC+7) sebagai default timezone |

# **5\. ARSITEKTUR & TECH STACK**

## **5.1 Stack Teknologi**

| **Layer** | **Teknologi** | **Keterangan** |
| --- | --- | --- |
| Backend | Node.js + Express.js | REST API server, middleware, routing |
| Frontend | EJS + Bootstrap 5 | Server-side rendering template engine + CSS framework |
| Admin Template | UBold (Express+EJS) | Pre-built admin dashboard, sidebar, topbar, partials |
| Build Tool | Gulp | SCSS→CSS compilation, vendor plugin bundling |
| Database | MongoDB + Mongoose | NoSQL document database, ODM untuk schema & validasi |
| Cache | Redis | Session store, job queue, caching dashboard data |
| Background Job | Agenda.js / node-cron | Cron job payroll, rekap absensi, notifikasi terjadwal |
| File Storage | MinIO / AWS S3 | Foto absensi, dokumen PDF, ID Card, attachment |
| PDF Generate | Puppeteer / PDFKit | Generate slip gaji, ID Card, surat HR |
| QR Code | qrcode (npm) | Generate QR Code karyawan, validasi absensi QR |
| Auth | JWT + Passport.js | Token-based auth, 2FA via speakeasy (TOTP) |
| Notifikasi | Telegram Bot API | Notifikasi slip gaji, approval, cicilan via Telegram |
| Email | Nodemailer + SMTP | Notifikasi email formal (approval, kontrak, dll.) |
| Validasi | Joi / express-validator | Request validation di layer middleware |
| Mobile | React Native Expo | Aplikasi Android: face recognition attendance |
| Face Recognition | face-api.js / AWS Rekognition | Deteksi wajah + liveness detection |
| Real-time | Socket.IO | Live dashboard monitoring kehadiran hari ini |
| Export | ExcelJS + PDFKit | Export laporan ke Excel (.xlsx) dan PDF |
| API Testing | Postman | Collection testing per endpoint, environment vars |
| Testing | TestSprite AI | AI-powered automated testing |
| IDE | Antigravity AI Vibe Coding | AI-assisted development environment |

## **5.2 Arsitektur Aplikasi**

Aplikasi menggunakan arsitektur MVC (Model-View-Controller) dengan separation of concern yang jelas:

- Model Layer: Mongoose Schema (MongoDB) - mendefinisikan struktur data dan validasi.
- Controller Layer: Express.js Route Handlers - business logic dan orkestrasi data.
- View Layer: EJS Templates + Bootstrap 5 - server-side rendered HTML.
- Service Layer: Business logic yang dapat digunakan ulang (PayrollService, NotificationService, dll.).
- Middleware Layer: Auth, RBAC guard, rate limiter, request logger, error handler.
- Background Jobs: node-cron/Agenda.js untuk payroll batch, rekap absensi, notifikasi terjadwal.

## **5.3 Telegram Bot Integration**

**Mengapa Telegram Bot?**

Telegram Bot API sepenuhnya gratis, tidak memerlukan verifikasi bisnis, dan sangat mudah diimplementasikan via library node-telegram-bot-api. Setiap karyawan cukup menghubungkan akun Telegram mereka ke sistem (dengan perintah /register + employee_code), dan sistem dapat mengirimkan slip gaji dalam format PDF langsung ke DM Telegram mereka. Untuk approver, notifikasi pengajuan cuti/piutang dikirim ke grup Telegram khusus HRD.

- Karyawan menghubungkan akun: /start → /register \[employee_code\] → verifikasi OTP.
- Slip gaji terkirim otomatis saat payroll diproses (file PDF di-attach ke message).
- Notifikasi approval piutang/cuti dikirim ke grup Telegram HRD/Kepala Cabang.
- Karyawan dapat cek saldo piutang, sisa cuti, dan rekap kehadiran via bot command.

# **6\. ROADMAP AGILE / MVP**

**Prinsip MVP**

Fokus pada fungsi CORE terlebih dahulu: data karyawan yang stabil, rekap presensi yang akurat, dan perhitungan gaji yang benar. Fitur-fitur lanjutan (notifikasi, laporan lanjutan, face recognition) dikembangkan setelah core stabil dan teruji.

| **Sprint** | **Durasi** | **Deliverables** | **Status** |
| --- | --- | --- | --- |
| Sprint 1 | 2 Minggu | Setup project, Auth (JWT+RBAC), Master data (Company, Branch, Dept, Position), User Management | 🎯 P1 |
| Sprint 2 | 2 Minggu | CRUD Karyawan lengkap, Generate Employee ID + QR Code, Upload dokumen, Konfigurasi Gaji | 🎯 P1 |
| Sprint 3 | 2 Minggu | Jadwal Kerja, Hari Libur, Absensi (QR + Button + Manual), Geo-fencing dasar, Rekap Absensi | 🎯 P1 |
| Sprint 4 | 2 Minggu | Cuti (jenis, pengajuan, approval), Lembur (setting, pengajuan, approval) | 🎯 P1 |
| Sprint 5 | 2 Minggu | CORE PAYROLL: Kalkulasi gaji, Prorata, Batch processing, Preview & Approve, Lock Payroll, Slip Gaji PDF | 🎯 P1 |
| Sprint 6 | 2 Minggu | Piutang: Pengajuan, Approval bertingkat, Jadwal cicilan, Pembayaran (potong gaji + tunai) | 🎯 P1 |
| Sprint 7 | 2 Minggu | Dashboard (per role), Laporan PDF/Excel, Jurnal Keuangan, Audit Trail | 🎯 P2 |
| Sprint 8 | 2 Minggu | Telegram Bot (notifikasi + slip gaji), Persuratan & Template Dokumen, ID Card Generator, Mutasi Karyawan | 🎯 P2 |
| Sprint 9 | 2 Minggu | Aplikasi Mobile Android: Face Recognition Attendance (React Native Expo), Sinkronisasi API | 🎯 P2 |
| Sprint 10 | 2 Minggu | Testing (TestSprite AI), Bug fixing, Performance tuning, Dokumentasi API (Postman Collection), UAT | 🎯 P2 |
| Phase 2 | TBD | Rekrutmen, Penilaian Kinerja, Pelatihan, Inventaris Aset, Offboarding Wizard | 📋 Backlog |

# **7\. STRUKTUR PROJECT (BACKEND + FRONTEND)**

Struktur direktori yang direkomendasikan untuk proyek Fullstack JavaScript (Node.js + EJS):

| **Path** | **Deskripsi** |
| --- | --- |
| /config/ | DB connection, env vars, constants |
| /models/ | Mongoose Schema (33 collections) |
| /controllers/ | Route handler & business logic per modul |
| /services/ | PayrollService, NotificationService, dll. |
| /routes/ | Express Router per modul |
| /middlewares/ | Auth, RBAC, RateLimit, ErrorHandler |
| /jobs/ | Cron jobs (payroll, rekap, notifikasi) |
| /utils/ | Helper functions, PDF gen, QR gen, Excel export |
| /validators/ | Joi/express-validator request schemas |
| /views/ | EJS templates — dari UBold template |
| /views/layouts/ | Main layout (extend template UBold) |
| /views/partials/ | Template partials (sidenav, topbar, footer) |
| /public/ | Static assets — dari UBold template |
| /public/css/ | Gulp-compiled CSS (app.min.css) |
| /public/js/ | vendors.min.js + app.js + page scripts |
| /public/scss/ | Custom SCSS (di-compile Gulp) |
| /public/plugins/ | Vendor plugins (dari plugins.config.js) |
| /gulpfile.js | Build pipeline (SCSS, plugins) |
| /plugins.config.js | Konfigurasi vendor plugins |
| /mobile/ | React Native Expo project (Android app) |
| /tests/ | Unit test, integration test, TestSprite config |
| /postman/ | Postman Collection & Environment files |
| /.env.example | Template environment variables |
| /docker-compose.yml | MongoDB + Redis local dev setup |

# **8\. ALUR BISNIS KRITIS**

## **8.1 Alur Prorata Gaji dengan Mutasi (Cron Job)**

Skenario: Karyawan A pindah dari Cabang X ke Cabang Y pada tanggal 15 Maret 2025.

- mutation_histories mencatat: employee_id, from_branch_id (X), to_branch_id (Y), effective_date = 15 Maret.
- Cron Job berjalan pada tanggal 31 Maret (akhir bulan).
- Cron membaca mutation_histories: tanggal 1-14 → konfigurasi Cabang X (uang makan, lembur, dll).
- Cron menghitung: 14 hari × (gaji harian + komponen Cabang X).
- Cron menghitung: 17 hari × (gaji harian + komponen Cabang Y).
- Hasil dijumlah menjadi payroll_details dengan flag is_prorata = true dan prorata_notes berisi breakdown.

## **8.2 Alur Persetujuan Piutang Bertingkat**

Skenario A - Nominal < Rp 1.000.000:

- Karyawan submit pengajuan → status = pending, approval_level = branch.
- Sistem otomatis kirim notifikasi Telegram ke Kepala Cabang dan Manager HRD (info saja untuk HRD).
- Kepala Cabang approve → status = approved, sistem buat jadwal cicilan di receivable_installments.
- Dana dicairkan → status = active, dicatat di financial_journals (jurnal piutang).

Skenario B - Nominal ≥ Rp 1.000.000:

- Karyawan submit → status = pending, approval_level = hrd.
- Notifikasi Telegram ke Manager HRD untuk approval.
- Manager HRD approve → sistem generate cicilan dan catat ke jurnal keuangan.

## **8.3 Alur Offboarding dengan Validasi Piutang**

- Admin/Manager HRD ubah status karyawan → Non-Aktif (Resign).
- Sistem query receivables: filter employee_id AND status = 'active'.
- Jika ada piutang aktif → sistem BLOKIR perubahan status, tampilkan modal konfirmasi.
- Modal menampilkan: sisa piutang = Rp X. Pilih: (a) Potong dari gaji terakhir, atau (b) Bayar langsung.
- Jika (a): sistem tambah receivable deduction ke payroll terakhir sebelum menonaktifkan.
- Jika (b): Kasir mencatat pembayaran langsung, setelah lunas status karyawan berubah Non-Aktif.
- Semua langkah tercatat di activity_logs.

# **9\. GLOSSARY & DEFINISI**

| **Istilah** | **Definisi** |
| --- | --- |
| KT (Karyawan Tetap) | Karyawan dengan status tetap, hak penuh termasuk tunjangan masa kerja. |
| KL (Karyawan Luar) | Karyawan lepas/kontrak, pembayaran biasanya harian atau mingguan. |
| Magang | Karyawan dalam status magang, gaji dan tunjangan terbatas. |
| Prorata | Perhitungan gaji proporsional berdasarkan jumlah hari kerja aktual dalam periode. |
| Siklus Gaji | Periode pembayaran gaji: Harian, Mingguan, atau Bulanan. |
| Geo-fencing | Batasan area geografis (berbasis koordinat GPS) untuk validasi absensi. |
| Liveness Detection | Teknologi untuk memastikan wajah yang terdeteksi adalah manusia nyata, bukan foto/video. |
| TTL Index | Time-To-Live Index MongoDB: dokumen otomatis terhapus setelah waktu tertentu. |
| Cron Job | Tugas terjadwal yang berjalan otomatis di background pada waktu tertentu. |
| JWT | JSON Web Token: mekanisme autentikasi stateless berbasis token terenkripsi. |
| 2FA/TOTP | Two-Factor Authentication menggunakan Time-based One-Time Password (Google Authenticator). |
| RBAC | Role-Based Access Control: kontrol akses berdasarkan peran pengguna. |
| Aging Piutang | Laporan yang mengelompokkan piutang berdasarkan usia keterlambatan pembayaran. |

**END OF DOCUMENT - PRD v1.0**