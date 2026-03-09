/**
 * ============================================================
 * SamudraHRD — Response Helper
 * ============================================================
 * Standar format response API (JSON).
 * Referensi: SRS v1.0 Section 6 — API Response Format
 * ============================================================
 */

/**
 * Success Response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const successResponse = (res, data = null, message = 'OK', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

/**
 * Error Response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {string} code - Error code identifier (e.g., 'VALIDATION_ERROR')
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {Array|null} details - Optional error details array
 */
const errorResponse = (res, message = 'Internal Server Error', code = 'INTERNAL_ERROR', statusCode = 500, details = null) => {
  const response = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (details) {
    response.error.details = details;
  }

  return res.status(statusCode).json(response);
};

/**
 * Paginated Response
 * @param {Object} res - Express response object
 * @param {Array} data - Array of data items
 * @param {number} total - Total records count
 * @param {number} page - Current page number
 * @param {number} limit - Records per page
 * @param {string} message - Success message
 */
const paginatedResponse = (res, data, total, page, limit, message = 'OK') => {
  const totalPages = Math.ceil(total / limit);

  return res.status(200).json({
    success: true,
    data,
    message,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
};
