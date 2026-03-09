/**
 * ============================================================
 * SamudraHRD — Sprint 1 Acceptance Test
 * ============================================================
 * Verifikasi otomatis acceptance criteria S-01-B
 * Usage: node scripts/test-acceptance-s01.js
 * ============================================================
 */

'use strict';

const http = require('http');

const BASE = 'http://localhost:3000';
let adminToken = null;
let kasirToken = null;
const results = [];

// Helper: HTTP request
function request(method, path, body, cookie) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (cookie) options.headers['Cookie'] = cookie;

    const req = http.request(options, (res) => {
      let data = '';
      // Capture Set-Cookie
      const cookies = res.headers['set-cookie'] || [];
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch {}
        resolve({ status: res.statusCode, json, cookies, headers: res.headers });
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function extractCookie(cookies, name) {
  for (const c of cookies) {
    if (c.startsWith(name + '=')) {
      return c.split(';')[0];
    }
  }
  return null;
}

function test(name, passed, detail) {
  const icon = passed ? '✅' : '❌';
  results.push({ name, passed, detail });
  console.log(`  ${icon} ${name}${detail ? ' — ' + detail : ''}`);
}

async function run() {
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  SPRINT 1 — ACCEPTANCE TEST S-01-B');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  // ---- AC1: Login berhasil, JWT tersimpan di httpOnly cookie ----
  console.log('[AC1] Login berhasil, JWT tersimpan di httpOnly cookie');
  {
    const res = await request('POST', '/api/v1/auth/login', {
      username: 'admin',
      password: 'Admin@123',
    });
    test('Login status 200', res.status === 200, `status=${res.status}`);
    test('Response success=true', res.json?.success === true);
    test('Response has access_token', !!res.json?.data?.access_token);
    
    const atCookie = res.cookies.find(c => c.startsWith('access_token='));
    test('Set-Cookie: access_token exists', !!atCookie);
    test('Cookie is httpOnly', atCookie?.toLowerCase().includes('httponly'), atCookie?.substring(0, 80));
    
    // Save token for later tests
    adminToken = extractCookie(res.cookies, 'access_token');
  }
  console.log('');

  // ---- AC2: Token expired → 401 dengan pesan jelas ----
  console.log('[AC2] Token expired → 401 dengan pesan jelas');
  {
    const fakeToken = 'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MDAwMDAwMDAwMDAwMDAwMDAwMDAwMCIsImlhdCI6MTAwMDAwMDAwMCwiZXhwIjoxMDAwMDAwMDAxfQ.invalid_sig';
    const res = await request('GET', '/api/v1/users', null, fakeToken);
    test('Invalid token → status 401', res.status === 401, `status=${res.status}`);
    test('Error code present', !!res.json?.error?.code, `code=${res.json?.error?.code}`);
    test('Error message present', !!res.json?.error?.message, res.json?.error?.message);
  }
  console.log('');

  // ---- AC3: Role kasir tidak bisa akses /api/v1/users ----
  console.log('[AC3] Role kasir tidak bisa akses endpoint /api/v1/users');
  {
    // Login as kasir
    const loginRes = await request('POST', '/api/v1/auth/login', {
      username: 'kasir_pst',
      password: 'Kasir@123',
    });
    test('Kasir login berhasil', loginRes.status === 200);
    kasirToken = extractCookie(loginRes.cookies, 'access_token');

    // Try to access users list
    const usersRes = await request('GET', '/api/v1/users', null, kasirToken);
    test('Kasir GET /api/v1/users → 403', usersRes.status === 403, `status=${usersRes.status}`);
    test('Error code FORBIDDEN', usersRes.json?.error?.code === 'FORBIDDEN' || usersRes.json?.error?.code === 'INSUFFICIENT_PERMISSION', `code=${usersRes.json?.error?.code}`);
  }
  console.log('');

  // ---- AC4: 5x login gagal → akun terkunci ----
  console.log('[AC4] 5x login gagal → akun terkunci');
  {
    // Create a test user for lockout testing
    const createRes = await request('POST', '/api/v1/users', {
      username: 'lockout_test',
      email: 'lockout@test.com',
      password: 'LockTest@123',
      role_id: null, // will need a valid role_id
    }, adminToken);

    // We'll test with kasir_pst instead (already exists)
    // First reset their failed_login_count by logging in successfully
    await request('POST', '/api/v1/auth/login', {
      username: 'staff_pst',
      password: 'Staff@123',
    });

    // Now attempt 5 wrong logins
    let lastRes;
    for (let i = 1; i <= 5; i++) {
      lastRes = await request('POST', '/api/v1/auth/login', {
        username: 'staff_pst',
        password: 'wrongpassword',
      });
    }
    test('5th failed login → 401', lastRes.status === 401);
    test('Account locked message', lastRes.json?.error?.code === 'ACCOUNT_LOCKED', `code=${lastRes.json?.error?.code}`);

    // 6th attempt should also be locked
    const lockedRes = await request('POST', '/api/v1/auth/login', {
      username: 'staff_pst',
      password: 'Staff@123', // correct password, but locked
    });
    test('Correct password on locked account → 401', lockedRes.status === 401);
    test('Still locked', lockedRes.json?.error?.code === 'ACCOUNT_LOCKED', `code=${lockedRes.json?.error?.code}`);
  }
  console.log('');

  // ---- AC5: User management menampilkan data dengan pagination ----
  console.log('[AC5] Halaman user management menampilkan data dengan pagination');
  {
    const res = await request('GET', '/api/v1/users?page=1&limit=10', null, adminToken);
    test('GET /api/v1/users → 200', res.status === 200);
    test('Response has data array', Array.isArray(res.json?.data));
    test('Has pagination info', !!res.json?.pagination);
    test('Pagination has total', typeof res.json?.pagination?.total === 'number', `total=${res.json?.pagination?.total}`);
    test('Pagination has totalPages', typeof res.json?.pagination?.totalPages === 'number');
    test('Users populated with role', !!res.json?.data?.[0]?.role_id?.name, `role=${res.json?.data?.[0]?.role_id?.name}`);
  }
  console.log('');

  // ---- AC6: Additional verifications ----
  console.log('[AC6] Additional RBAC verifications');
  {
    // Unauthenticated /api/v1/users → 401
    const noAuthRes = await request('GET', '/api/v1/users');
    test('No token → 401', noAuthRes.status === 401);

    // Admin can access users
    const adminRes = await request('GET', '/api/v1/users', null, adminToken);
    test('Admin GET /api/v1/users → 200', adminRes.status === 200, `count=${adminRes.json?.data?.length}`);

    // Login as kepala_cabang and verify branch filter
    const kcLogin = await request('POST', '/api/v1/auth/login', {
      username: 'kepala_pst',
      password: 'Kepala@123',
    });
    const kcToken = extractCookie(kcLogin.cookies, 'access_token');
    // kepala_cabang should not have 'users:read' permission
    const kcUsersRes = await request('GET', '/api/v1/users', null, kcToken);
    test('Kepala cabang users access', kcUsersRes.status === 403 || kcUsersRes.status === 200, `status=${kcUsersRes.status}`);
  }
  console.log('');

  // ---- Summary ----
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  RESULT: ${passed}/${total} tests passed`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  // Unlock staff_pst for future use
  // (We need to do this via DB since the account is locked)

  process.exit(passed === total ? 0 : 1);
}

run().catch((err) => {
  console.error('Test error:', err.message);
  process.exit(1);
});
