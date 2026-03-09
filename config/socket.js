/**
 * socket.js
 * Konfigurasi Socket.IO untuk real-time features
 * 
 * @module config/socket
 */

'use strict';

let io = null;

/**
 * Initialize Socket.IO dengan HTTP server
 * @param {Object} server - HTTP server instance
 * @returns {Object} Socket.IO instance
 */
const initSocket = (server) => {
  const { Server } = require('socket.io');
  
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join room berdasarkan branch_id untuk notifikasi per cabang
    socket.on('join:branch', (branchId) => {
      socket.join(`branch:${branchId}`);
      console.log(`[Socket.IO] ${socket.id} joined branch:${branchId}`);
    });

    // Join room berdasarkan user_id untuk notifikasi personal
    socket.on('join:user', (userId) => {
      socket.join(`user:${userId}`);
      console.log(`[Socket.IO] ${socket.id} joined user:${userId}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  console.log('[Socket.IO] Initialized');
  return io;
};

/**
 * Get Socket.IO instance
 * @returns {Object|null} Socket.IO instance
 */
const getIO = () => {
  if (!io) {
    console.warn('[Socket.IO] Not initialized. Call initSocket(server) first.');
  }
  return io;
};

/**
 * Emit event ke semua client di branch tertentu
 * @param {string} branchId - Branch ID
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
const emitToBranch = (branchId, event, data) => {
  if (io) {
    io.to(`branch:${branchId}`).emit(event, data);
  }
};

/**
 * Emit event ke user tertentu
 * @param {string} userId - User ID
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitToBranch,
  emitToUser,
};
