// Standardized response helpers
// Every response in the project must go through these two functions

const success = (res, data = {}, statusCode = 200, meta = null) => {
  const payload = { success: true, data };
  if (meta) payload.meta = meta;
  return res.status(statusCode).json(payload);
};

const error = (res, code, message, statusCode = 400, field = null) => {
  return res.status(statusCode).json({
    success: false,
    error: { code, message, ...(field && { field }) },
  });
};

module.exports = { success, error };