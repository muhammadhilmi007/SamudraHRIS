/**
 * multer.js
 * Konfigurasi Multer untuk file upload handling
 * 
 * @module config/multer
 */

'use strict';

const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10) * 1024 * 1024; // Default 5MB

/**
 * Storage configuration - Local disk (uploads/)
 * Di production, file akan di-upload ke MinIO setelah disimpan
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'public', 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

/**
 * File filter - hanya izinkan tipe file tertentu
 */
const imageFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar (JPEG, PNG, WebP) yang diizinkan'), false);
  }
};

const documentFilter = (req, file, cb) => {
  if (ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file PDF dan gambar (JPEG, PNG, WebP) yang diizinkan'), false);
  }
};

/**
 * Upload presets
 */
const uploadPhoto = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single('photo');

const uploadDocument = multer({
  storage,
  fileFilter: documentFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single('document');

const uploadMultipleDocuments = multer({
  storage,
  fileFilter: documentFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).array('documents', 10);

module.exports = {
  uploadPhoto,
  uploadDocument,
  uploadMultipleDocuments,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  MAX_FILE_SIZE,
};
