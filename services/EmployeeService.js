/**
 * ============================================================
 * SamudraHRD — Employee Service
 * ============================================================
 * Menangani logika ID generation, QR Code, dan kalkulasi tanggal.
 * ============================================================
 */

'use strict';

const mongoose = require('mongoose');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const { Employee } = require('../models');

class EmployeeService {
  /**
   * Generate Employee Code
   * Format: [KODE_CABANG]-[STATUS_2CHAR]-[URUT_4DIGIT]
   * Contoh: JKT-KT-0001, SBY-KL-0023
   *
   * @param {string} branchCode - Kode cabang (e.g., JKT)
   * @param {string} status - Status Karyawan (KT, KL, Magang)
   * @param {string} companyId - ObjectId perusahaan
   * @returns {Promise<string>} Kode yang tergenerate
   */
  static async generateEmployeeCode(branchCode, status, companyId) {
    if (!branchCode) {
      throw new Error('Kode Cabang tidak valid atau tidak ditemukan saat meng-generate Employee Code');
    }

    let statusPrefix = 'MG';
    if (status === 'KT') statusPrefix = 'KT';
    if (status === 'KL') statusPrefix = 'KL';

    const prefix = `${branchCode.toUpperCase()}-${statusPrefix}-`;

    // Cari employee dengan prefix tsb di cabang dan companyspecific, ambil nomor terbesar
    // Menggunakan regex untuk mencari code yang diawali dengan prefix
    const lastEmployee = await Employee.findOne({
      company_id: companyId,
      employee_code: { $regex: `^${prefix}` }
    })
    .sort({ employee_code: -1 })
    .exec();

    let nextNumber = 1;
    if (lastEmployee && lastEmployee.employee_code) {
      const parts = lastEmployee.employee_code.split('-');
      const lastNumberStr = parts[parts.length - 1];
      const lastNumber = parseInt(lastNumberStr, 10);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    const paddedNumber = String(nextNumber).padStart(4, '0');
    return `${prefix}${paddedNumber}`;
  }

  /**
   * Generate QR Code PNG
   * Encode string: samudraHRD:[employeeCode]:[timestamp_checksum]
   * Disimpan ke public/uploads/qrcodes/
   *
   * @param {string} employeeCode
   * @returns {Promise<string>} URL public file
   */
  static async generateQRCode(employeeCode) {
    try {
      const timestamp = Date.now();
      const qrData = `samudraHRD:${employeeCode}:${timestamp}`;
      
      const fileName = `${employeeCode}_QR.png`;
      const uploadDir = path.join(__dirname, '../public/uploads/qrcodes');
      
      // Ensure directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, fileName);

      await QRCode.toFile(filePath, qrData, {
        width: 300,
        margin: 2,
        color: {
            dark: '#000000',
            light: '#ffffff'
        }
      });

      return `/uploads/qrcodes/${fileName}`;
    } catch (err) {
      console.error('Failed to generate QR Code:', err);
      throw new Error('Gagal membuat QR Code Karyawan');
    }
  }

  /**
   * Hitung Umur dari Tanggal Lahir (tahun)
   * @param {Date|string} birthDate 
   * @returns {number} Umur dalam tahun
   */
  static calculateAge(birthDate) {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
  }

  /**
   * Hitung Masa Kerja (Format: X Tahun Y Bulan)
   * @param {Date|string} joinDate 
   * @returns {string} String masa kerja
   */
  static calculateTenure(joinDate) {
    if (!joinDate) return '0 Tahun 0 Bulan';
    
    const startDate = new Date(joinDate);
    const endDate = new Date();
    
    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();

    if (months < 0 || (months === 0 && endDate.getDate() < startDate.getDate())) {
      years--;
      months += (months < 0 ? 12 : 11);
    }
    
    if (endDate.getDate() < startDate.getDate() && months === 12) {
        years--;
        months = 11;
    }

    return `${years} Tahun ${months} Bulan`;
  }
}

module.exports = EmployeeService;
