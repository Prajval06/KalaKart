exports.success = (res, data, statusCode = 200, meta = null) => {
  const body = { success: true, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
};

exports.error = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};