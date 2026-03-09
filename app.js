/**
 * ============================================================
 * SamudraHRD — Main Application Entry Point
 * ============================================================
 * Sistem Informasi HRD, Presensi & Payroll
 * Stack: Node.js + Express.js + MongoDB + EJS + Bootstrap 5.3
 * Template: UBold Admin Dashboard
 * ============================================================
 */

// Load environment variables FIRST
require('dotenv').config();

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const session = require('express-session');

// Database
const { connectDB } = require('./config/database');

// Middlewares
const errorHandler = require('./middlewares/errorHandler');

// Routes (UBold template demo routes — akan diganti per sprint)
const templateRoutes = require('./routes/index');

// Sprint 1 — Auth & User Management Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');

// Sprint 2 — Branch Management Routes
const branchRoutes = require('./routes/branch.routes');

// Sprint 2 — Organization (Dept, Position, Salary Level) Routes
const orgRoutes = require('./routes/org.routes');

// Sprint 2 — System Config (Approval Flow) Routes
const systemRoutes = require('./routes/system.routes');

// ============================================================
// Initialize Express App
// ============================================================
const app = express();

// ============================================================
// Security Middlewares
// ============================================================

// Helmet — HTTP security headers
// Konfigurasi CSP yang permissive untuk development (UBold pakai inline script/style)
app.use(helmet({
  contentSecurityPolicy: false, // Dimatikan karena UBold banyak inline scripts
  crossOriginEmbedderPolicy: false,
}));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// ============================================================
// Global Rate Limiter — 100 requests per 15 menit
// ============================================================
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: process.env.NODE_ENV === 'production' ? 100 : 500,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Terlalu banyak request. Coba lagi dalam 15 menit.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Hanya terapkan rate limiter pada API routes (bukan static files / views)
app.use('/api', globalLimiter);

// ============================================================
// Body Parsers & Utilities
// ============================================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

// ============================================================
// Session (untuk flash messages & EJS views)
// ============================================================
app.use(session({
  secret: process.env.JWT_SECRET || 'samudrahrd-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 jam
  },
}));

// ============================================================
// Request Logging (Morgan)
// ============================================================
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ============================================================
// View Engine — EJS (UBold template menggunakan include(), bukan express-ejs-layouts)
// ============================================================
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// ============================================================
// Static Files — dari folder /public (UBold compiled assets)
// CSS: public/css/app.min.css (Gulp-compiled)
// JS:  public/js/vendors.min.js + public/js/app.js
// ============================================================
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// Flash Message & Global Locals Middleware
// ============================================================
app.use((req, res, next) => {
  // Flash messages
  res.locals.success_msg = req.session.success_msg || null;
  res.locals.error_msg = req.session.error_msg || null;
  res.locals.warning_msg = req.session.warning_msg || null;
  // Clear setelah ditampilkan
  delete req.session.success_msg;
  delete req.session.error_msg;
  delete req.session.warning_msg;

  // Default currentUser (null jika belum login)
  // Akan di-overwrite oleh authenticate middleware jika user login
  res.locals.currentUser = res.locals.currentUser || null;

  next();
});

// ============================================================
// Sprint 1 — Auth & User Management Routes
// ============================================================
app.use('/', authRoutes);
app.use('/', userRoutes);

// ============================================================
// Sprint 2 — Branch Management Routes
// ============================================================
app.use('/', branchRoutes);

// ============================================================
// Sprint 2 — Organization (Dept, Position, Salary Level) Routes
// ============================================================
app.use('/', orgRoutes);

// ============================================================
// Sprint 2 — System Routes
// ============================================================
app.use('/', systemRoutes);

// ============================================================
// Routes — UBold Template Demo (akan diganti per sprint)
// ============================================================
app.use('/', templateRoutes);

// ============================================================
// API Routes — Placeholder (akan diaktifkan per sprint)
// ============================================================
// Sprint 2:
// app.use('/api/v1/employees', require('./routes/api/employees.routes'));

// Sprint 3:
// app.use('/api/v1/attendances', require('./routes/api/attendances.routes'));
// app.use('/api/v1/work-schedules', require('./routes/api/workSchedules.routes'));
// app.use('/api/v1/holidays', require('./routes/api/holidays.routes'));

// Sprint 4:
// app.use('/api/v1/leaves', require('./routes/api/leaves.routes'));
// app.use('/api/v1/overtimes', require('./routes/api/overtimes.routes'));

// Sprint 5:
// app.use('/api/v1/payrolls', require('./routes/api/payrolls.routes'));

// Sprint 6:
// app.use('/api/v1/receivables', require('./routes/api/receivables.routes'));

// ============================================================
// Health Check Endpoint
// ============================================================
app.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    },
  });
});

// ============================================================
// 404 Handler — Halaman tidak ditemukan
// ============================================================
app.use((req, res) => {
  // Jika request ke API, kirim JSON
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`,
      },
    });
  }

  // Jika request ke view, render halaman 404
  res.status(404).render('error-404', { title: '404 - Halaman Tidak Ditemukan' });
});

// ============================================================
// Global Error Handler — HARUS di paling akhir
// ============================================================
app.use(errorHandler);

// ============================================================
// Start Server & Connect Database
// ============================================================
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  const http = require('http').createServer(app);

  // Socket.IO placeholder (akan diaktifkan untuk live dashboard)
  // const io = require('socket.io')(http);

  http.listen(PORT, () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  🚀 SamudraHRD Server Started');
    console.log(`  📡 Port: ${PORT}`);
    console.log(`  🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  🔗 URL: http://localhost:${PORT}`);
    console.log(`  ❤️  Health: http://localhost:${PORT}/health`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  });

  // ============================================================
  // Graceful Shutdown
  // ============================================================
  const gracefulShutdown = (signal) => {
    console.log(`\n[APP] ${signal} received. Shutting down gracefully...`);
    http.close(async () => {
      const mongoose = require('mongoose');
      await mongoose.connection.close();
      console.log('[APP] 🔌 Server closed. Database disconnected.');
      process.exit(0);
    });

    // Force close setelah 10 detik
    setTimeout(() => {
      console.error('[APP] ⚠️  Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

startServer();